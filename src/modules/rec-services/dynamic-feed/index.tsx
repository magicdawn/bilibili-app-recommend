import { REQUEST_FAIL_MSG } from '$common'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { type DynamicFeedItemExtend, type DynamicFeedJson } from '$define'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import { parseDuration, toast } from '$utility'
import type { IService } from '../_base'
import { LiveRecService } from '../live'
import { getFollowGroupContent } from './group'
import {
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
  QUERY_DYNAMIC_UP_MID,
  dfStore,
  type DynamicFeedStoreFilterConfig,
} from './store'
import { DynamicFeedUsageInfo } from './usage-info'

export class DynamicFeedRecService implements IService {
  static PAGE_SIZE = 15

  offset: string = ''
  page = 0 // pages loaded

  liveRecService: LiveRecService | undefined

  hasMoreDynFeed = true

  get hasMoreStreamingLive() {
    // has more streaming Live item
    if (this.liveRecService?.hasMore && !this.liveRecService.separatorAdded) {
      return true
    }
    return false
  }

  get hasMore() {
    return this.hasMoreStreamingLive || this.hasMoreDynFeed
  }

  constructor(
    public filterConfig: DynamicFeedStoreFilterConfig,
    public showLiveInDynamicFeed: boolean,
  ) {
    if (this.showLiveInDynamicFeed) {
      const filterEmpty =
        !this.upMid && typeof this.followGroupTagid === 'undefined' && !this.searchText
      if (filterEmpty) {
        this.liveRecService = new LiveRecService()
      }
    }
  }

  // shortcut for filterConfig
  get upMid() {
    return this.filterConfig.upMid
  }
  // NOTE: number | undefined 默认分组是 0
  get followGroupTagid() {
    return this.filterConfig.followGroupTagid
  }
  get searchText() {
    return this.filterConfig.searchText
  }
  get dynamicFeedVideoType() {
    return this.filterConfig.dynamicFeedVideoType
  }
  get hideChargeOnlyVideos() {
    return this.filterConfig.hideChargeOnlyVideos
  }
  get filterMinDuration() {
    return this.filterConfig.filterMinDuration
  }
  get filterMinDurationValue() {
    return this.filterConfig.filterMinDurationValue
  }
  get hasSelectedUp() {
    return this.filterConfig.hasSelectedUp
  }
  get showFilter() {
    return this.filterConfig.showFilter
  }

  private followGroupMids = new Set<number>()
  async loadFollowGroupMids() {
    if (typeof this.followGroupTagid !== 'number') return
    if (this.followGroupMids.size) return
    const mids = await getFollowGroupContent(this.followGroupTagid)
    this.followGroupMids = new Set(mids)
  }

  async loadMore(signal: AbortSignal | undefined = undefined) {
    if (!this.hasMore) {
      return
    }

    // load live first
    if (this.liveRecService && this.hasMoreStreamingLive) {
      const items = (await this.liveRecService.loadMore()) || []
      const hasSep = items.some((x) => x.api === EApiType.Separator)
      if (!hasSep) {
        return items
      } else {
        const idx = items.findIndex((x) => x.api === EApiType.Separator)
        return items.slice(0, idx)
      }
    }

    const params: Record<string, number | string> = {
      timezone_offset: '-480',
      type: 'video',
      features: 'itemOpusStyle',
      page: this.page + 1, // ++this.page, starts from 1
    }
    if (this.offset) {
      params.offset = this.offset
    }
    if (this.upMid) {
      params.host_mid = this.upMid
    }

    const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', {
      signal,
      params,
    })
    const json = res.data as DynamicFeedJson
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)

      // prevent infinite call
      if (json.message === '账号未登录') {
        this.hasMoreDynFeed = false
      }

      return
    }

    this.page++
    this.hasMoreDynFeed = json.data.has_more
    this.offset = json.data.offset

    // ensure current follow-group's mids loaded
    await this.loadFollowGroupMids()

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr
      .filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型

      // by 关注分组
      .filter((x) => {
        if (typeof this.followGroupTagid !== 'number') return true
        if (!this.followGroupMids.size) return true
        const mid = x?.modules?.module_author?.mid
        return mid && this.followGroupMids.has(mid)
      })

      // by 动态视频|投稿视频
      .filter((x) => {
        // only when the filter UI visible
        if (!this.showFilter) return true
        // all
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.All) return true
        // type only
        const currentLabel = x.modules.module_dynamic.major.archive.badge.text as string
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly) {
          return currentLabel === '动态视频'
        }
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.UploadOnly) {
          return currentLabel === '投稿视频' || currentLabel === CHARGE_ONLY_TEXT
        }
        return false
      })

      // by 充电专属
      .filter((x) => {
        // only when the filter UI visible
        if (!this.showFilter) return true
        if (!this.hideChargeOnlyVideos) return true
        const chargeOnly =
          (x.modules?.module_dynamic?.major?.archive?.badge?.text as string) === CHARGE_ONLY_TEXT
        return !chargeOnly
      })

      // by 最短时长
      .filter((x) => {
        // only when the filter UI visible
        if (!this.showFilter) return true
        if (this.filterMinDuration === DynamicFeedVideoMinDuration.All) return true

        const v = x.modules.module_dynamic.major.archive
        const duration = parseDuration(v.duration_text)
        return duration >= this.filterMinDurationValue
      })

      // by 关键字搜索
      .filter((x) => {
        // only when the filter UI visible
        if (!this.showFilter) return true
        if (!this.searchText) return true
        const title = x?.modules?.module_dynamic?.major?.archive?.title || ''
        return title.includes(this.searchText)
      })

      .map((item) => {
        return {
          ...item,
          api: EApiType.Dynamic,
          uniqId: item.id_str || crypto.randomUUID(),
        }
      })

    /**
     * side effects
     */

    // fill up-name when filter up via query
    const { upMid, upName } = dfStore
    if (
      //
      QUERY_DYNAMIC_UP_MID &&
      upMid &&
      upName &&
      upName === upMid.toString() &&
      items[0]
    ) {
      const authorName = items[0].modules.module_author.name
      dfStore.upName = authorName
    }

    return items
  }

  get usageInfo(): ReactNode {
    return <DynamicFeedUsageInfo />
  }
}
