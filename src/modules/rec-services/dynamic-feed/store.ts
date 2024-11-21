import { IN_BILIBILI_HOMEPAGE } from '$common'
import { settings } from '$modules/settings'
import { getUid, setPageTitle, whenIdle } from '$utility'
import { proxySetWithGmStorage } from '$utility/valtio'
import ms from 'ms'
import { proxy } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import type { getDynamicFeedServiceConfig } from '.'
import { getAllFollowGroups } from './group'
import type { FollowGroup } from './group/groups.json'
import { getRecentUpdateUpList } from './up'
import type { DynamicPortalUp } from './up/portal-types'

/**
 * view dynamic of <mid> via query
 */
const searchParams = new URLSearchParams(location.search)
export const QUERY_DYNAMIC_UP_MID = searchParams.get('dyn-mid')?.trim()
export const QUERY_DYNAMIC_OFFSET = searchParams.get('dyn-offset') // where to start, exclusive
export const QUERY_DYNAMIC_SEARCH_TEXT = QUERY_DYNAMIC_UP_MID // only support using with `dyn-mid`
  ? searchParams.get('dyn-search') || undefined
  : undefined

let upMidInitial: UpMidType | undefined = undefined
let upNameInitial: string | undefined = undefined
if (QUERY_DYNAMIC_UP_MID) {
  upMidInitial = QUERY_DYNAMIC_UP_MID
  upNameInitial = searchParams.get('dyn-name') ?? upMidInitial.toString() ?? undefined
}

export type UpMidType = string

export enum DynamicFeedVideoType {
  All = 'all',
  UploadOnly = 'upload-only',
  DynamicOnly = 'dynamic-only',
}

export const DynamicFeedVideoTypeLabel: Record<DynamicFeedVideoType, string> = {
  [DynamicFeedVideoType.All]: '全部',
  [DynamicFeedVideoType.UploadOnly]: '仅投稿视频',
  [DynamicFeedVideoType.DynamicOnly]: '仅动态视频',
}

export enum DynamicFeedVideoMinDuration {
  All = 'all',
  _5m = '5min',
  _2m = '2min',
  _1m = '1min',
  _30s = '30s',
  _10s = '10s',
}

export const DynamicFeedVideoMinDurationConfig: Record<
  DynamicFeedVideoMinDuration,
  { label: string; duration: number }
> = {
  // 及以上
  [DynamicFeedVideoMinDuration.All]: { label: '全部时长', duration: 0 },
  [DynamicFeedVideoMinDuration._5m]: { label: '5分钟', duration: 5 * 60 },
  [DynamicFeedVideoMinDuration._2m]: { label: '2分钟', duration: 2 * 60 },
  [DynamicFeedVideoMinDuration._1m]: { label: '1分钟', duration: 60 },
  [DynamicFeedVideoMinDuration._30s]: { label: '30秒', duration: 30 },
  [DynamicFeedVideoMinDuration._10s]: { label: '10秒', duration: 10 },
}

export const SELECTED_KEY_ALL = 'all'

/**
 * df expand to `dynamic-feed`
 */

export const dfStore = proxy({
  upMid: upMidInitial as UpMidType | undefined,
  upName: upNameInitial as string | undefined,
  upList: [] as DynamicPortalUp[],
  upListUpdatedAt: 0,

  selectedFollowGroup: undefined as FollowGroup | undefined,
  followGroups: [] as FollowGroup[],
  followGroupsUpdatedAt: 0,

  dynamicFeedVideoType: DynamicFeedVideoType.All,
  searchText: (QUERY_DYNAMIC_SEARCH_TEXT ?? undefined) as string | undefined,

  // 选择了 UP
  get hasSelectedUp(): boolean {
    return !!(this.upName && this.upMid)
  },
  // 展示 filter
  get showFilter() {
    // return this.hasSelectedUp || !!this.selectedFollowGroup
    return true
  },

  // 筛选 UP & 分组 select 控件的 key
  get selectedKey() {
    if (this.upMid) return `up:${this.upMid}`
    if (this.selectedFollowGroup) return `group:${this.selectedFollowGroup.tagid}`
    return SELECTED_KEY_ALL
  },

  hideChargeOnlyVideosForKeysSet: await proxySetWithGmStorage<string>(
    'dynamic-feed:hide-charge-only-videos-for-keys',
  ),

  get hideChargeOnlyVideos() {
    return this.hideChargeOnlyVideosForKeysSet.has(this.selectedKey)
  },

  filterMinDuration: DynamicFeedVideoMinDuration.All,
  get filterMinDurationValue() {
    return DynamicFeedVideoMinDurationConfig[this.filterMinDuration].duration
  },
})

export type DynamicFeedStore = typeof dfStore

export type DynamicFeedServiceConfig = ReturnType<typeof getDynamicFeedServiceConfig>

async function updateUpList(force = false) {
  const cacheHit =
    !force &&
    dfStore.upList.length &&
    dfStore.upListUpdatedAt &&
    dfStore.upListUpdatedAt - Date.now() < ms('5min')
  if (cacheHit) return

  const list = await getRecentUpdateUpList()
  dfStore.upList = list
  dfStore.upListUpdatedAt = Date.now()
}

async function updateFollowGroups(force = false) {
  if (!settings.dynamicFeedEnableFollowGroupFilter) return

  const cacheHit =
    !force &&
    dfStore.followGroups.length &&
    dfStore.followGroupsUpdatedAt &&
    dfStore.followGroupsUpdatedAt - Date.now() < ms('1h')
  if (cacheHit) return

  const groups = await getAllFollowGroups()
  dfStore.followGroups = groups.filter((x) => !!x.count)
  dfStore.followGroupsUpdatedAt = Date.now()
}

export async function updateFilterData() {
  // not logined
  if (!getUid()) return
  return Promise.all([updateUpList(), updateFollowGroups()])
}

/* #region Side Effects */

setTimeout(async () => {
  if (!IN_BILIBILI_HOMEPAGE) return
  if (!dfStore.upList.length || !dfStore.followGroups.length) {
    await whenIdle()
    updateFilterData()
  }
}, ms('5s'))

if (QUERY_DYNAMIC_UP_MID) {
  subscribeKey(dfStore, 'upName', (upName) => {
    const title = upName ? `「${upName}」的动态` : '动态'
    setPageTitle(title)
  })
}

/* #endregion */
