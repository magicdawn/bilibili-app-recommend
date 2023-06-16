import { RecItemType, WatchLaterItemExtend, WatchLaterJson } from '$define'
import { request } from '$request'
import { settings } from '$settings'
import { toast } from '$utility/toast'
import { Tag } from 'antd'
import dayjs from 'dayjs'
import { cloneDeep, shuffle } from 'lodash'
import { ComponentProps, ReactNode } from 'react'

/**
 * Q: 为什么不一次性加载?
 * A: 全部加载特别卡, 没有滚动时没必要全部加载
 */

export class WatchLaterService {
  static PAGE_SIZE = 15

  private async fetch() {
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
      // keep 最近几天内
      const gate = dayjs().subtract(2, 'days').unix()
      const firstNotTodayAddedIndex = items.findIndex((item) => item.add_at < gate)

      if (firstNotTodayAddedIndex !== -1) {
        const items1 = items.slice(0, firstNotTodayAddedIndex)
        const items2 = items.slice(firstNotTodayAddedIndex)
        items = [...items1, ...shuffle(items2)]
      }
    }

    this.count = json.data.count
    this.items = items
  }

  loaded = false
  page = -1
  hasMore = true
  count: number
  items: RecItemType[] = []
  usageInfo: ReactNode

  async loadMore() {
    if (!this.hasMore) return

    if (!this.loaded) {
      await this.fetch()
      this.loaded = true

      const { count } = this
      const color: ComponentProps<typeof Tag>['color'] =
        count <= 90 ? 'success' : count < 100 ? 'warning' : 'error'
      const title = `${color !== 'success' ? '快满了~ ' : ''}已使用 ${count} / 100`
      this.usageInfo = (
        <Tag
          color={color}
          style={{ marginLeft: 20, cursor: 'pointer' }}
          title={title}
          onClick={() => {
            toast(`稍后再看: ${title}`)
          }}
        >
          {count} / 100
        </Tag>
      )
    }

    this.page++
    const start = this.page * WatchLaterService.PAGE_SIZE
    const end = start + WatchLaterService.PAGE_SIZE

    const items = cloneDeep(this.items.slice(start, end))
    this.hasMore = end <= this.count - 1
    return items
  }
}
