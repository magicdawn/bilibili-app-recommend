import { IN_BILIBILI_HOMEPAGE } from '$common'
import { settings } from '$modules/settings'
import { getUid } from '$utility/cookie'
import { setPageTitle, whenIdle } from '$utility/dom'
import { proxySetWithGmStorage } from '$utility/valtio'
import ms from 'ms'
import { proxy } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { getAllFollowGroups } from './group'
import type { FollowGroup } from './group/types/groups'
import { getRecentUpdateUpList } from './up'
import type { DynamicPortalUp } from './up/portal-types'

/**
 * view dynamic of <mid> via query
 */

export enum DynamicFeedQueryKey {
  Mid = 'dyn-mid',
  Offset = 'dyn-offset',
  SearchText = 'dyn-search',
  MinId = 'dyn-min-id',
  MinTs = 'dyn-min-ts',
}

const searchParams = new URLSearchParams(location.search)
export const QUERY_DYNAMIC_UP_MID = searchParams.get(DynamicFeedQueryKey.Mid)?.trim()
export const QUERY_DYNAMIC_OFFSET = searchParams.get(DynamicFeedQueryKey.Offset) // where to start, exclusive
export const QUERY_DYNAMIC_SEARCH_TEXT = QUERY_DYNAMIC_UP_MID // only support using with `dyn-mid`
  ? searchParams.get(DynamicFeedQueryKey.SearchText) || undefined
  : undefined
export const QUERY_DYNAMIC_MIN_ID = QUERY_DYNAMIC_UP_MID // only support using with `dyn-mid`, dyn.id_str >= dyn-min-id, stands for `update since`
  ? searchParams.get(DynamicFeedQueryKey.MinId)
  : undefined
export const QUERY_DYNAMIC_MIN_TS = QUERY_DYNAMIC_MIN_ID // only support using with `dyn-min-id`, dyn.publish-time >= dyn-min-ts, stands for `update since`
  ? searchParams.get(DynamicFeedQueryKey.MinTs)
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
export const SELECTED_KEY_PREFIX_UP = 'up:'
export const SELECTED_KEY_PREFIX_GROUP = 'group:'

/**
 * df expand to `dynamic-feed`
 */

export type DynamicFeedStore = typeof dfStore
export const dfStore = proxy({
  upMid: upMidInitial as UpMidType | undefined,
  upName: upNameInitial as string | undefined,
  upFace: undefined as string | undefined,
  upList: [] as DynamicPortalUp[],
  upListUpdatedAt: 0,

  followGroups: [] as FollowGroup[],
  followGroupsUpdatedAt: 0,
  selectedFollowGroupTagId: undefined as number | undefined,
  get selectedFollowGroup(): FollowGroup | undefined {
    if (typeof this.selectedFollowGroupTagId) return
    return this.followGroups.find((x) => x.tagid === this.selectedFollowGroupTagId)
  },

  dynamicFeedVideoType: DynamicFeedVideoType.All,
  searchText: (QUERY_DYNAMIC_SEARCH_TEXT ?? undefined) as string | undefined,

  // 选择了 UP
  get hasSelectedUp(): boolean {
    return !!(this.upName && this.upMid)
  },

  // 筛选 UP & 分组 select 控件的 key
  get selectedKey() {
    if (this.upMid) return `${SELECTED_KEY_PREFIX_UP}${this.upMid}`
    if (this.selectedFollowGroup)
      return `${SELECTED_KEY_PREFIX_GROUP}${this.selectedFollowGroup.tagid}`
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

  /**
   * methods
   */
  updateUpList,
  updateFollowGroups,
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FollowGroupInfo = Record<number, {}>
export const dfInfoStore = proxy<{ followGroupInfo: FollowGroupInfo }>({
  followGroupInfo: {},
})

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
  {
    const { followGroup, whenViewAll } = settings.dynamicFeed
    const enabled =
      followGroup.enabled ||
      !!whenViewAll.hideIds.filter((x) => x.startsWith(SELECTED_KEY_PREFIX_GROUP)).length
    if (!enabled) return
  }

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
