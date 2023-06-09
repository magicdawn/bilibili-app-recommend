import { WatchLaterItemExtend, WatchLaterJson } from '$define'
import { request } from '$request'
import { settings } from '$settings'
import dayjs from 'dayjs'
import { shuffle } from 'lodash'

export class WatchLaterService {
  static async getAll() {
    const res = await request.get('/x/v2/history/toview/web')
    const json = res.data as WatchLaterJson
    let items: WatchLaterItemExtend[] = json.data.list.map((item) => {
      return {
        ...item,
        api: 'watchlater',
        uniqId: `watchlater-${item.bvid}`,
      }
    })

    // 洗牌
    if (settings.shuffleForWatchLater) {
      const firstNotTodayAddedIndex = items.findIndex(
        (item) => item.add_at < dayjs().startOf('day').unix()
      )
      if (firstNotTodayAddedIndex !== -1) {
        const items1 = items.slice(0, firstNotTodayAddedIndex)
        const items2 = items.slice(firstNotTodayAddedIndex)
        items = [...items1, ...shuffle(items2)]
      }
    }

    return items
  }
}
