import type { TabType } from '$components/RecHeader/tab.shared'
import type { PopularGeneralItemExtend } from '$define'
import type { PopularGeneralJson } from '$define/popular-general'
import { request } from '$request'
import type { IService } from './base'

export class PopularGeneralService implements IService {
  forTab: TabType = 'popular-general'
  hasMore = true
  page = 1

  async loadMore() {
    if (!this.hasMore) return

    const res = await request.get('/x/web-interface/popular', {
      params: {
        ps: 20,
        pn: this.page++,
      },
    })
    const json = res.data as PopularGeneralJson

    this.hasMore = !json.data.no_more
    const items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: 'popular-general',
        uniqId: item.bvid,
      } as PopularGeneralItemExtend
    })

    return items
  }
}
