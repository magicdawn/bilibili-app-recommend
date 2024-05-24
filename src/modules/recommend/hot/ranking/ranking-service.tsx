import { REQUEST_FAIL_MSG } from '$common'
import type { RankingItemExtended } from '$define'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import { toast } from '$utility'
import { QueueStrategy, type IService } from '../../base'
import type { RankingItem } from './api'
import { RANKING_CATEGORIES_MAP, getRequestUrl, type CategorySlug } from './category'
import { RankingUsageInfo, rankingStore } from './ranking-usage-info'

export class RankingRecService implements IService {
  loaded = false
  slug: CategorySlug
  qs = new QueueStrategy<RankingItemExtended>(20)

  constructor(slug?: CategorySlug) {
    this.slug = slug || rankingStore.slug
  }

  get hasMore() {
    if (!this.loaded) return true
    return !!this.qs.bufferQueue.length
  }

  async loadMore(abortSignal: AbortSignal): Promise<RankingItemExtended[] | undefined> {
    if (!this.hasMore) return

    if (!this.loaded) {
      const c = RANKING_CATEGORIES_MAP[this.slug]
      const url = getRequestUrl(c)
      const res = await request.get(url, { signal: abortSignal })
      const json = res.data
      this.loaded = true

      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG)
        return
      }

      const list: RankingItem[] = json?.data?.list || json?.result?.list || []
      const items: RankingItemExtended[] = list.map((item, index) => {
        return {
          ...item,
          api: EApiType.Ranking,
          uniqId: crypto.randomUUID(),
          rankingNo: index + 1,
          slug: this.slug,
          categoryType: c.type,
        }
      })

      this.qs.bufferQueue = items
    }

    return this.qs.sliceFromQueue()
  }

  get usageInfo() {
    return <RankingUsageInfo />
  }
}
