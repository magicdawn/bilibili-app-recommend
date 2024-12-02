import { type ItemsSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { groupBy, orderBy, shuffle } from 'es-toolkit'
import { proxy } from 'valtio'
import { fetchCollectionDetail } from '../collection/api'
import { type IFavInnerService } from '../index'
import type { FavItemExtend } from '../types'
import type {
  FavCollectionDetailInfo,
  FavCollectionDetailMedia,
} from '../types/collections/collection-detail'
import type { FavCollection } from '../types/collections/list-all-collections'
import { FavUsageInfo } from '../usage-info'
import { FavItemsOrder, FavItemsOrderSwitcher } from '../usage-info/fav-items-order'
import { FAV_PAGE_SIZE, FavCollectionSeparator } from './_base'

export class FavCollectionService implements IFavInnerService {
  constructor(
    public entry: FavCollection,
    public addSeparator: boolean,
    public itemsOrder: FavItemsOrder,
  ) {}

  get hasMore() {
    if (this.addSeparator && !this.separatorAdded) return true
    if (!this.loaded) return true
    return !!this.bufferQueue.length
  }

  /**
   * 这是个假分页... 一次返回所有
   */
  loaded = false
  info: FavCollectionDetailInfo | undefined
  bufferQueue: FavItemExtend[] = []

  private separatorAdded = false
  private get separator(): ItemsSeparator {
    return {
      api: EApiType.Separator,
      uniqId: `fav-collection-${this.entry.id}`,
      content: <FavCollectionSeparator service={this} />,
    }
  }

  // reactive state
  state = proxy({
    firstBvid: undefined as string | undefined,
  })

  async loadMore(
    abortSignal?: AbortSignal,
  ): Promise<(FavItemExtend | ItemsSeparator)[] | undefined> {
    if (!this.hasMore) return

    if (this.addSeparator && !this.separatorAdded) {
      this.separatorAdded = true
      return [this.separator]
    }

    if (!this.loaded) {
      const data = await fetchCollectionDetail(this.entry.id, 1)
      const medias = data?.medias || []
      const info = data?.info
      this.loaded = true
      this.info = info
      await this.loadUserAvatarFromSpaceAccInfo(medias, abortSignal)

      let items: FavItemExtend[] = medias.map((x) => {
        return {
          ...x,
          api: EApiType.Fav as const,
          uniqId: `fav-${this.entry.id}-${x.bvid}`,
          collection: data.info,
          from: 'fav-collection' as const,
        }
      })
      items = this.setupItemsOrder(items)

      this.state.firstBvid = items[0]?.bvid
      this.bufferQueue = items
    }

    // just for fun, shuffle every time
    if (this.itemsOrder === FavItemsOrder.Shuffle) {
      this.bufferQueue = shuffle(this.bufferQueue)
    }

    const sliced = this.bufferQueue.slice(0, FAV_PAGE_SIZE)
    this.bufferQueue = this.bufferQueue.slice(FAV_PAGE_SIZE)
    return sliced
  }

  setupItemsOrder(items: FavItemExtend[]) {
    if (this.itemsOrder === FavItemsOrder.Shuffle) {
      return shuffle(items)
    }

    if (
      this.itemsOrder === FavItemsOrder.PubTimeDesc ||
      this.itemsOrder === FavItemsOrder.PubTimeAsc
    ) {
      const order = this.itemsOrder === FavItemsOrder.PubTimeDesc ? 'desc' : 'asc'
      return orderBy(items, [(x) => x.pubtime], [order])
    }

    return items
  }

  // 合集返回的数据没有头像, 这里通过 user-detail 获取
  private async loadUserAvatarFromSpaceAccInfo(
    items: FavCollectionDetailMedia[],
    abortSignal?: AbortSignal,
  ) {
    if (!items.length) return
    const midsArr = items.map((x) => x.upper.mid)
    const midsGrouped = groupBy(midsArr, (x) => x)
    const tuples: [mid: string, count: number][] = Object.entries(midsGrouped).map(
      ([mid, mids]) => [mid, mids.length],
    )
    // 出现次数最多的 mid, 合集: 应该只有一个 mid; 列表: 无能为力
    const topMids = orderBy(tuples, [(x) => x[1]], ['desc'])
      .slice(0, 3)
      .map((x) => x[0])

    await Promise.all(
      topMids.map(async (mid) => {
        if (abortSignal?.aborted) return

        const info = await getSpaceAccInfo(mid)
        const face = info?.face
        if (face) {
          items
            .filter((x) => x.upper.mid.toString() === mid)
            .forEach((x) => {
              x.upper.face ||= face
            })
        }
      }),
    )
  }

  get usageInfo() {
    return <FavUsageInfo showShuffle={false} extraContent={<FavItemsOrderSwitcher />} />
  }
}
