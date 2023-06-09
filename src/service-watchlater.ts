import { WatchLaterItemExtend, WatchLaterJson } from '$define'
import { request } from '$request'

export class WatchLaterService {
  static async getAll() {
    const res = await request.get('/x/v2/history/toview/web')
    const json = res.data as WatchLaterJson
    const items: WatchLaterItemExtend[] = json.data.list.map((item) => {
      return {
        ...item,
        api: 'watchlater',
        uniqId: `watchlater-${item.bvid}`,
      }
    })
    return items
  }
}
