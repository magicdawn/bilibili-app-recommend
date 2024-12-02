import { type ItemsSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { groupBy, orderBy, shuffle } from 'es-toolkit'
import { type IFavInnerService, FavRecService } from '..'
import { fetchCollectionDetail } from '../collection/api'
import type { FavItemExtend } from '../types'
import type {
  FavCollectionDetailInfo,
  FavCollectionDetailMedia,
} from '../types/collections/collection-detail'
import type { FavCollection } from '../types/collections/list-all-collections'

export class FavCollectionService implements IFavInnerService {
  constructor(
    public entry: FavCollection,
    public useShuffle: boolean,
    public addSeparator: boolean,
  ) {}

  info: FavCollectionDetailInfo | undefined
  get hasMore() {
    if (!this.loaded) return true
    return !!this.bufferQueue.length
  }

  /**
   * 这是个假分页... 一次返回所有
   */
  loaded = false
  bufferQueue: (FavItemExtend | ItemsSeparator)[] = []

  async loadMore(
    abortSignal?: AbortSignal,
  ): Promise<(FavItemExtend | ItemsSeparator)[] | undefined> {
    if (!this.hasMore) return

    if (!this.loaded) {
      const data = await fetchCollectionDetail(this.entry.id, 1)
      const medias = data?.medias || []
      const info = data?.info
      this.loaded = true
      this.info = info
      await this.loadUserAvatarFromSpaceAccInfo(medias)

      const items = medias.map((x) => {
        return {
          ...x,
          api: EApiType.Fav as const,
          uniqId: `fav-${this.entry.id}-${x.bvid}`,
          collection: data.info,
          from: 'fav-collection' as const,
        }
      })
      this.bufferQueue = items
    }

    if (this.useShuffle) {
      this.bufferQueue = shuffle(this.bufferQueue)
    }

    const sliced = this.bufferQueue.slice(0, FavRecService.PAGE_SIZE)
    this.bufferQueue = this.bufferQueue.slice(FavRecService.PAGE_SIZE)
    return sliced
  }

  // 合集返回的数据没有头像, 这里通过 user-detail 获取
  private async loadUserAvatarFromSpaceAccInfo(items: FavCollectionDetailMedia[]) {
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
}
