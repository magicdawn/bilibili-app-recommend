import { type ItemsSeparator, type WatchLaterItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { settings } from '$modules/settings'
import { getHasLogined, getUid } from '$utility/cookie'
import { whenIdle } from '$utility/dom'
import toast from '$utility/toast'
import dayjs from 'dayjs'
import { shuffle } from 'es-toolkit'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { QueueStrategy, type IService, type ITabService } from '../_base'
import { getAllWatchlaterItemsV2, getWatchlaterItemFrom } from './api'
import { type WatchlaterItem } from './types'
import { WatchLaterUsageInfo } from './usage-info'

export const watchlaterState = proxy({
  updatedAt: 0,
  bvidSet: proxySet<string>(),
})

export function useWatchlaterState(bvid?: string) {
  const set = useSnapshot(watchlaterState).bvidSet
  return !!bvid && set.has(bvid)
}

if (getHasLogined() && getUid()) {
  void (async () => {
    await whenIdle()

    const { items: allWatchLaterItems } = await getAllWatchlaterItemsV2()
    if (!allWatchLaterItems.length) return

    watchlaterState.updatedAt = Date.now()
    watchlaterState.bvidSet = proxySet<string>(allWatchLaterItems.map((x) => x.bvid))
  })()
}

export class WatchLaterRecService implements ITabService {
  static PAGE_SIZE = 10

  innerService: WatchlaterNormalOrderService | WatchlaterShuffleOrderService

  constructor(
    public useShuffle: boolean,
    prevShuffleBvids?: string[],
  ) {
    this.innerService = settings.watchlaterUseShuffle
      ? new WatchlaterShuffleOrderService(prevShuffleBvids)
      : new WatchlaterNormalOrderService()
  }

  get usageInfo(): ReactNode {
    return this.innerService.usageInfo
  }
  get hasMore() {
    return !!this.qs.bufferQueue.length || this.innerService.hasMore
  }

  qs = new QueueStrategy<WatchLaterItemExtend | ItemsSeparator>(WatchLaterRecService.PAGE_SIZE)
  restore(): void {
    this.qs.restore()
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()
    return this.qs.doReturnItems(await this.innerService.loadMore(abortSignal))
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

function showApiRequestError(err: string) {
  toast(`获取稍后再看失败: ${err}`)
  throw new Error(`获取稍后再看失败: ${err}`, {
    cause: err,
  })
}

/**
 * shuffle pre-requirements: load ALL
 */

export class WatchlaterShuffleOrderService implements IService {
  static PAGE_SIZE = 20
  qs = new QueueStrategy<WatchLaterItemExtend | ItemsSeparator>(
    WatchlaterShuffleOrderService.PAGE_SIZE,
  )

  addSeparator = settings.watchlaterAddSeparator
  loaded = false
  total: number = 0

  // shuffle related
  keepOrder: boolean
  prevShuffleBvids?: string[]
  constructor(prevShuffleBvids?: string[]) {
    if (prevShuffleBvids?.length) {
      this.keepOrder = true
      this.prevShuffleBvids = prevShuffleBvids
    } else {
      this.keepOrder = false
    }
  }

  currentShuffleBvids: string[] = []
  private async fetch(abortSignal: AbortSignal) {
    const { items: rawItems, err } = await getAllWatchlaterItemsV2(false, abortSignal)
    if (typeof err !== 'undefined') {
      showApiRequestError(err)
    }

    const items: WatchLaterItemExtend[] = rawItems.map(extendItem)

    // recent + earlier
    const recentGate = getRecentGate()
    const firstNotRecentIndex = items.findIndex((item) => item.add_at < recentGate)
    let itemsWithSeparator: Array<WatchLaterItemExtend | ItemsSeparator> = items
    if (firstNotRecentIndex !== -1) {
      const recent = items.slice(0, firstNotRecentIndex)
      let earlier = items.slice(firstNotRecentIndex)

      // earlier: shuffle or restore
      if (this.keepOrder && this.prevShuffleBvids?.length) {
        earlier = earlier
          .map((item) => ({
            item,
            // if not found, -1, front-most
            index: this.prevShuffleBvids!.findIndex((bvid) => item.bvid === bvid),
          }))
          .sort((a, b) => a.index - b.index)
          .map((x) => x.item)
      } else {
        earlier = shuffle(earlier)
      }

      // combine
      itemsWithSeparator = [
        !!recent.length && this.addSeparator && recentSeparator,
        ...recent,

        !!earlier.length && this.addSeparator && earlierSeparator,
        ...earlier,
      ].filter(Boolean)
    }

    this.total = rawItems.length
    this.currentShuffleBvids = itemsWithSeparator
      .filter((x) => x.api !== EApiType.Separator)
      .map((x) => x.bvid)
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

class WatchlaterNormalOrderService implements IService {
  // configs
  addSeparator = settings.watchlaterAddSeparator
  addAtAsc = settings.watchlaterNormalOrderSortByAddAtAsc

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

    const result = await getWatchlaterItemFrom(this.nextKey, this.addAtAsc)
    // error
    if (typeof result.err !== 'undefined') {
      this.hasMore = false
      showApiRequestError(result.err)
      return
    }

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

    const recentGate = getRecentGate()
    const needEarlierSeparator = items.some((item) => item.add_at < recentGate)
    const needRecentSeparator = items.some((item) => item.add_at >= recentGate)

    // ASC
    if (this.addAtAsc) {
      if (!this.earlierSeparatorInserted && needEarlierSeparator) {
        newItems = [earlierSeparator, ...newItems]
        this.earlierSeparatorInserted = true
      }
      if (!this.recentSeparatorInserted && needRecentSeparator) {
        const idx = newItems.findIndex(
          (item) => item.api === EApiType.Watchlater && item.add_at >= recentGate,
        )
        newItems = [...newItems.slice(0, idx), recentSeparator, ...newItems.slice(idx)]
        this.recentSeparatorInserted = true
      }
    }
    // desc
    else {
      if (!this.recentSeparatorInserted && needRecentSeparator) {
        newItems = [recentSeparator, ...items]
        this.recentSeparatorInserted = true
      }
      if (!this.earlierSeparatorInserted && needEarlierSeparator) {
        const idx = newItems.findIndex(
          (item) => item.api === EApiType.Watchlater && item.add_at < recentGate,
        )
        newItems = [...newItems.slice(0, idx), earlierSeparator, ...newItems.slice(idx)]
        this.earlierSeparatorInserted = true
      }
    }

    return newItems
  }
}
