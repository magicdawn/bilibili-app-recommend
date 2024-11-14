import { type ItemsSeparator, type WatchLaterItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { settings } from '$modules/settings'
import { getHasLogined, getUid, whenIdle } from '$utility'
import dayjs from 'dayjs'
import { shuffle } from 'es-toolkit'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { QueueStrategy, type IService } from '../_base'
import { getAllWatchlaterItemsV2, getWatchlaterItemFrom } from './api'
import { type WatchlaterItem } from './api.d'
import { WatchLaterUsageInfo } from './usage-info'

export const watchLaterState = proxy({
  updatedAt: 0,
  bvidSet: proxySet<string>(),
})

export function useWatchLaterState(bvid?: string) {
  const set = useSnapshot(watchLaterState).bvidSet
  return !!bvid && set.has(bvid)
}

if (getHasLogined() && getUid()) {
  void (async () => {
    await whenIdle()

    const allWatchLaterItems = await getAllWatchlaterItemsV2()
    if (!allWatchLaterItems.length) return

    watchLaterState.updatedAt = Date.now()
    watchLaterState.bvidSet = proxySet<string>(allWatchLaterItems.map((x) => x.bvid))
  })()
}

/**
 * Q: 为什么不一次性加载?
 * A: 全部加载特别卡, 没有滚动时没必要全部加载
 */

export class WatchLaterRecService implements IService {
  innerService: NormalOrderService | ShuffleOrderService
  constructor(keepOrderWhenShuffle?: boolean) {
    this.innerService = settings.shuffleForWatchLater
      ? new ShuffleOrderService(keepOrderWhenShuffle)
      : new NormalOrderService()
  }

  get usageInfo(): ReactNode {
    return this.innerService.usageInfo
  }
  get hasMore() {
    return this.innerService.hasMore
  }
  loadMore(abortSignal: AbortSignal) {
    return this.innerService.loadMore(abortSignal)
  }

  // for remove watchlater card
  decreaseTotal() {
    this.innerService.total--
  }
}

/**
 * shared
 */

function extendItem(item: WatchlaterItem): WatchLaterItemExtend {
  return {
    ...item,
    api: EApiType.Watchlater,
    uniqId: `watchlater-${item.bvid}`,
  }
}

// recent + earlier
const getRecentGate = () => dayjs().subtract(2, 'days').unix()

const recentSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: 'watchlater-recent',
  content: '近期',
}
const earlierSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: 'watchlater-earlier',
  content: '更早',
}

/**
 * shuffle pre-requirements: load ALL
 */

class ShuffleOrderService implements IService {
  static PAGE_SIZE = 20
  qs = new QueueStrategy<WatchLaterItemExtend | ItemsSeparator>(ShuffleOrderService.PAGE_SIZE)

  addSeparator = settings.addSeparatorForWatchLater
  loaded = false
  total: number = 0

  // shuffle related
  keepOrder: boolean
  private static LastShuffleBvids: string[] = []
  constructor(keepOrder?: boolean) {
    this.keepOrder = keepOrder ?? false
  }

  private async fetch(abortSignal: AbortSignal) {
    const rawItems = await getAllWatchlaterItemsV2(abortSignal)
    const items: WatchLaterItemExtend[] = rawItems.map(extendItem)

    // recent + earlier
    const recentGate = getRecentGate()
    const firstNotRecentIndex = items.findIndex((item) => item.add_at < recentGate)
    let itemsWithSeparator: Array<WatchLaterItemExtend | ItemsSeparator> = items
    if (firstNotRecentIndex !== -1) {
      const recent = items.slice(0, firstNotRecentIndex)
      let earlier = items.slice(firstNotRecentIndex)

      // earlier: shuffle or restore
      if (this.keepOrder && ShuffleOrderService.LastShuffleBvids.length) {
        earlier = earlier
          .map((item) => ({
            item,
            // if not found, -1, front-most
            index: ShuffleOrderService.LastShuffleBvids.findIndex((bvid) => item.bvid === bvid),
          }))
          .sort((a, b) => a.index - b.index)
          .map((x) => x.item)
      } else {
        earlier = shuffle(earlier)
      }

      // save lastShuffleBvids
      ShuffleOrderService.LastShuffleBvids = [...recent, ...earlier].map((x) => x.bvid)

      // combine
      itemsWithSeparator = [
        !!recent.length && this.addSeparator && recentSeparator,
        ...recent,

        !!earlier.length && this.addSeparator && earlierSeparator,
        ...earlier,
      ].filter(Boolean)
    }

    this.total = rawItems.length
    return itemsWithSeparator
  }

  get usageInfo(): ReactNode {
    if (!this.loaded) return
    const { total } = this
    return <WatchLaterUsageInfo total={total} />
  }

  get hasMore() {
    if (!this.loaded) return true
    return !!this.qs.bufferQueue.length
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.hasMore) return

    if (!this.loaded) {
      const items = await this.fetch(abortSignal)
      this.qs.bufferQueue.push(...items)
      this.loaded = true
    }

    return this.qs.sliceFromQueue()
  }
}

class NormalOrderService implements IService {
  addSeparator = settings.addSeparatorForWatchLater

  firstPageLoaded = false
  count: number = 0

  get usageInfo(): ReactNode {
    if (!this.firstPageLoaded) return
    return <WatchLaterUsageInfo total={this.total} />
  }

  hasMore: boolean = true
  nextKey: string = ''
  total: number = 0

  async loadMore() {
    if (!this.hasMore) return

    const result = await getWatchlaterItemFrom(this.nextKey)
    if (!result) return

    this.firstPageLoaded = true
    this.hasMore = result.hasMore
    this.nextKey = result.nextKey
    this.total = result.total

    const items: WatchLaterItemExtend[] = result.items.map(extendItem)
    return this.insertSeparator(items)
  }

  private recentSeparatorInserted = false
  private earlierSeparatorInserted = false
  insertSeparator(items: WatchLaterItemExtend[]): (WatchLaterItemExtend | ItemsSeparator)[] {
    if (!this.addSeparator) return items

    let newItems: (WatchLaterItemExtend | ItemsSeparator)[] = [...items]

    if (!this.recentSeparatorInserted) {
      newItems = [recentSeparator, ...items]
      this.recentSeparatorInserted = true
    }

    const recentGate = getRecentGate()
    if (!this.earlierSeparatorInserted && items.at(-1) && items.at(-1)!.add_at < recentGate) {
      const idx = items.findIndex((item) => item.add_at < recentGate)
      newItems = [...items.slice(0, idx), earlierSeparator, ...items.slice(idx)]
      this.earlierSeparatorInserted = true
    }

    return newItems
  }
}
