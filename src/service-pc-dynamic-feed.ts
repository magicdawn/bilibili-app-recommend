import { PcDynamicFeedItemExtend, PcDynamicFeedJson } from '$define'
import { request } from '$request'

export class PcDynamicFeedService {
  offset: string
  page = 0
  hasMore = true

  async next() {
    if (!this.hasMore) {
      return
    }

    this.page++

    const params: Record<string, number | string> = {
      timezone_offset: '-480',
      type: 'video',
      features: 'itemOpusStyle',
      page: this.page,
    }
    if (this.offset) {
      params.offset = this.offset
    }

    const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', { params })
    const json = res.data as PcDynamicFeedJson

    this.hasMore = json.data.has_more
    this.offset = json.data.offset

    const arr = json.data.items
    const items: PcDynamicFeedItemExtend[] = arr.map((item) => {
      return {
        ...item,
        api: 'pc-dynamic',
        uniqId: crypto.randomUUID(),
      }
    })
    return items
  }
}
