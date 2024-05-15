import { REQUEST_FAIL_MSG } from '$common'
import type { RankingItemExtended } from '$define'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import { toast } from '$utility'
import type { IService } from '../base'
import type { RankingItem } from './api'
import { RANKING_CATEGORIES_MAP, getRequestUrl, type CategorySlug } from './category'
import { RankingUsageInfo } from './ranking-usage-info'

export class RankingService implements IService {
  hasMore = true
  slug: CategorySlug

  constructor(slug?: CategorySlug) {
    this.slug = slug || 'all'
  }

  async loadMore(abortSignal: AbortSignal): Promise<RankingItemExtended[] | undefined> {
    const c = RANKING_CATEGORIES_MAP[this.slug]
    const url = getRequestUrl(c)
    const res = await request.get(url, { signal: abortSignal })
    const json = res.data

    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)
      return
    }

    const list = (json?.data?.list || []) as RankingItem[]
    const items: RankingItemExtended[] = list.map((item, index) => {
      return {
        ...item,
        api: EApiType.Ranking,
        uniqId: crypto.randomUUID(),
        rankingNo: index + 1,
        slug: this.slug,
      }
    })

    // TODO: filter blacklist / up / title etc

    this.hasMore = false
    return items
  }

  get usageInfo() {
    return <RankingUsageInfo />
  }
}
