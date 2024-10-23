import { IN_BILIBILI_HOMEPAGE } from '$common'
import { settings } from '$modules/settings'
import { getUid, setPageTitle, whenIdle } from '$utility'
import { proxySetWithGmStorage } from '$utility/valtio'
import ms from 'ms'
import { snapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { getAllFollowGroups } from './group'
import type { FollowGroup } from './group/groups'
import { getRecentUpdateUpList } from './up'
import type { DynamicPortalUp } from './up/portal'

/**
 * view dynamic of <mid> via query
 */
const searchParams = new URLSearchParams(location.search)
export const QUERY_DYNAMIC_UP_MID = !!searchParams.get('dyn-mid')

let upMidInitial: number | undefined = undefined
let upNameInitial: string | undefined = undefined
if (QUERY_DYNAMIC_UP_MID) {
  upMidInitial = Number(searchParams.get('dyn-mid'))
  upNameInitial = searchParams.get('dyn-name') ?? upMidInitial.toString() ?? undefined
}

export type UpMidType = number

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
  searchText: undefined as string | undefined,

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
    return 'all'
  },

  hideChargeOnlyVideosForKeysSet: await proxySetWithGmStorage<string>(
    'dynamic-feed:hide-charge-only-videos-for-keys',
  ),

  get hideChargeOnlyVideos() {
    return this.hideChargeOnlyVideosForKeysSet.has(this.selectedKey)
  },
})

export type DynamicFeedStore = typeof dfStore

export type DynamicFeedStoreFilterConfig = ReturnType<typeof getDfStoreFilterConfig>

export function getDfStoreFilterConfig() {
  const snap = snapshot(dfStore)
  return {
    // state
    upMid: snap.upMid,
    followGroupTagid: snap.selectedFollowGroup?.tagid,

    searchText: snap.searchText,
    dynamicFeedVideoType: snap.dynamicFeedVideoType,
    hideChargeOnlyVideos: snap.hideChargeOnlyVideos,

    // flags
    hasSelectedUp: snap.hasSelectedUp,
    showFilter: snap.showFilter,
  }
}

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
  if (!settings.enableFollowGroupFilterForDynamicFeed) return

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
