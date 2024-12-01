import { REQUEST_FAIL_MSG } from '$common'
import type { LiveItemExtend, RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import dayjs from 'dayjs'
import type { IService } from '../_base'
import { ELiveStatus } from './live-enum'
import type { ListFollowingLiveJson } from './types/list-live'

export async function getLiveList(page: number) {
  const res = await request.get('https://api.live.bilibili.com/xlive/web-ucenter/user/following', {
    params: {
      page: page,
      page_size: LiveRecService.PAGE_SIZE,
      ignoreRecord: 1,
      hit_ab: true,
    },
  })
  const json = res.data as ListFollowingLiveJson
  return json
}

export class LiveRecService implements IService {
  static PAGE_SIZE = 10

  hasMore: boolean = true
  page = 0
  loaded = false

  liveCount: number = -1
  totalPage = Infinity

  separatorAdded = false

  async loadMore(): Promise<RecItemTypeOrSeparator[] | undefined> {
    if (!this.hasMore) return

    if (this.page + 1 > this.totalPage) {
      this.hasMore = false
      return
    }

    const json = await getLiveList(this.page + 1)
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)
      this.hasMore = false
    }

    // success
    this.page++

    const { count, live_count, totalPage } = json.data
    this.totalPage = totalPage
    this.liveCount = live_count

    const items = json.data.list.map((item) => {
      const _item: LiveItemExtend = {
        ...item,
        api: EApiType.Live,
        uniqId: item.roomid.toString(),
      }
      return _item
    })

    const last = items.at(-1)
    const gateTime = dayjs().subtract(2, 'weeks').unix()
    if (last) {
      const lastStatus = last.live_status
      const lastLiveTime = last.record_live_time
      if (lastStatus !== ELiveStatus.Streaming && lastLiveTime && lastLiveTime < gateTime) {
        this.hasMore = false
      }
    }

    const ret: RecItemTypeOrSeparator[] = items

    // add separator
    if (!this.separatorAdded && items.some((x) => x.live_status !== ELiveStatus.Streaming)) {
      this.separatorAdded = true
      const index = items.findIndex((x) => x.live_status !== ELiveStatus.Streaming)
      ret.splice(index, 0, {
        api: EApiType.Separator,
        uniqId: 'live-separator',
        content: '最近直播过',
      })
    }

    return ret
  }

  get usageInfo() {
    return null
  }
}
