import { DynamicFeedItemExtend, DynamicFeedJson } from '$define'
import { request } from '$request'

export class DynamicFeedService {
  static PAGE_SIZE = 15

  offset: string
  page = 0
  hasMore = true

  async loadMore(signal: AbortSignal | undefined = undefined) {
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

    const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', { signal, params })
    const json = res.data as DynamicFeedJson

    this.hasMore = json.data.has_more
    this.offset = json.data.offset

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr.map((item) => {
      return {
        ...item,
        api: 'dynamic',
        uniqId: item.id_str || crypto.randomUUID(),
      }
    })
    return items
  }
}
