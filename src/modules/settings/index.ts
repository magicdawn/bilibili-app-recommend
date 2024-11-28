import { baseDebug, IN_BILIBILI_HOMEPAGE } from '$common'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode } from '$components/VideoCard/index.shared'
import { EAppApiDevice } from '$define/index.shared'
import {
  getLeafPaths,
  type BooleanPaths,
  type LeafPaths,
  type ListPaths,
} from '$utility/object-paths'
import { toast } from '$utility/toast'
import { cloneDeep, isNil } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import type { PartialDeep } from 'type-fest'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { saveToDraft } from './cloud-backup'

const debug = baseDebug.extend('settings')

/**
 * 命名: 模块/tab + 场景 + 功能
 */

export const initialSettings = {
  accessKey: '',
  accessKeyExpireAt: 0,

  // 窄屏模式
  useNarrowMode: false,

  // 全屏模式
  // @history
  //  - 2024-03-18 bili-feed4 以前的内测首页现在是默认首页, 这里更名为全屏模式, 默认为 true
  pureRecommend: true,

  /**
   * app recommend
   */
  appApiDecice: EAppApiDevice.ipad,

  /**
   * 查看更多, aka ModalFeed
   */

  // 自动查看更多
  showModalFeedOnLoad: false,

  // "查看更多" 按钮
  showModalFeedEntry: false,

  // ModalFeed.全屏
  modalFeedFullScreen: false,

  /**
   * Video Card
   */

  // 自动开始预览: 按键选择
  autoPreviewWhenKeyboardSelect: false,

  // 自动开始预览: 鼠标悬浮; 不再跟随鼠标位置, 默认: 跟随鼠标
  autoPreviewWhenHover: true,

  // 自动预览: 连续式进度条 跳跃式进度条
  autoPreviewUseContinuousProgress: true,

  // 自动预览: 更新间隔
  // 跳跃式(400) 连续式(700)
  autoPreviewUpdateInterval: 700,

  // hover 延时
  useDelayForHover: false,

  // 从预览处开始播放视频
  // /video/BVID/?t=start
  startPlayFromPreviewPoint: false,

  /**
   * tab=dynamic-feed
   */
  dynamicFeed: {
    showLive: true, // 在动态中显示直播

    followGroup: {
      enabled: true, // 下拉筛选支持 - 关注分组
      forceUseMergeTimelineIds: [] as number[],
    },

    whenViewAll: {
      enableHideSomeContents: false, // 在「全部」动态中隐藏 UP 的动态 & 在「全部」动态中隐藏此分组的动态
      hideIds: [] as string[], // `up:${mid}` | `follow-group:${id}`
    },

    advancedSearch: false,
    __internal: {
      cacheAllItemsEntry: false,
      cacheAllItemsUpMids: [] as string[], // enable for these up
      addCopyBvidButton: false,
      externalSearchInput: false, // more convenient
    },
  },

  /**
   * tab=watchlater
   */
  watchlaterUseShuffle: false, // 打乱顺序
  watchlaterAddSeparator: true, // 添加 "近期" / "更早" 分割线
  watchlaterNormalOrderSortByAddAtAsc: false,

  /**
   * tab=fav
   */
  fav: {
    useShuffle: false, // 打乱顺序
    addSeparator: true, // 收藏夹分割线
    excludedFolderIds: [] as string[], // 忽略的收藏夹
  },

  /**
   * tab=popular-general
   */
  popularGeneralUseAnonymous: false, // without credentials

  /**
   * tab=popular-weekly
   */
  popularWeeklyUseShuffle: false, // shuffle

  /**
   * tab=live
   */

  /**
   * 过滤器模块
   * 使用 flat config 方便使用 FlagSettingItem
   */
  filterEnabled: true,

  // 最少播放量
  filterMinPlayCountEnabled: false,
  filterMinPlayCount: 10000,

  // 时长
  filterMinDurationEnabled: false,
  filterMinDuration: 60, // 60s

  // 已关注豁免
  exemptForFollowedVideo: true,

  // filter out whose goto = 'picture'
  filterOutGotoTypePicture: false,
  // 图文也是有 rcmd_reason = '已关注' 的
  // 已关注UP的推荐图文, 默认不参与过滤
  exemptForFollowedPicture: true,

  // filter out whose goto = 'bangumi'
  filterOutGotoTypeBangumi: false,

  // authorName
  filterByAuthorNameEnabled: false,
  filterByAuthorNameKeywords: [] as string[],

  // title
  filterByTitleEnabled: false,
  filterByTitleKeywords: [] as string[],

  /**
   * 外观
   */

  // video-source-tab 高度: true 高; false compact;
  styleUseStandardVideoSourceTab: true,

  // sticky tabbar
  styleUseStickyTabbarInPureRecommend: true,

  // custom grid | default grid
  styleUseCustomGrid: true,

  // bg1
  styleUseWhiteBackground: true,

  // 隐藏顶部分区
  styleHideTopChannel: false,

  // 使用卡片模式
  // inspired by https://ai.taobao.com
  styleUseCardBorder: true,
  styleUseCardBorderOnlyOnHover: true,
  styleUseCardBoxShadow: false,
  styleUseCardPadding: false,

  /**
   * 颜色主题
   */
  theme: '',
  colorPickerThemeSelectedColor: '', // 自定义颜色

  /**
   * 功能
   */

  // 备份
  backupSettingsToArticleDraft: false,

  // 默认打开模式
  videoLinkOpenMode: VideoLinkOpenMode.Normal,

  // 小窗默认锁定
  pipWindowDefaultLocked: true,

  /**
   * 隐藏的 tab, 使用黑名单, 功能迭代之后新增的 tab, 默认开启.
   * 如果使用白名单, 新增的 tab 会被隐藏
   */
  hidingTabKeys: [ETab.KeepFollowOnly, ETab.Live] satisfies ETab[] as ETab[],
  customTabKeysOrder: [] satisfies ETab[] as ETab[],

  /**
   * internal
   */
  __internalEnableCopyBvidInfoContextMenu: false,
  __internalHotSubUseDropdown: false,
}

export type Settings = typeof initialSettings
export const settings = proxy(cloneDeep(initialSettings))

export type LeafSettingsPath = LeafPaths<Settings>
export type BooleanSettingsPath = BooleanPaths<Settings>
export type ListSettingsPath = ListPaths<Settings>

export const allowedLeafSettingsPaths = getLeafPaths(initialSettings)
export const internalBooleanPaths = allowedLeafSettingsPaths.filter(
  (p) => p.includes('__internal') && typeof get(initialSettings, p) === 'boolean',
) as BooleanSettingsPath[]
debug(
  'allowedLeafSettingsPaths = %O, internalBooleanPaths = %O',
  allowedLeafSettingsPaths,
  internalBooleanPaths,
)

export function useSettingsSnapshot() {
  return useSnapshot(settings)
}

export function getSettingsSnapshot() {
  return snapshot(settings)
}

/**
 * storage
 */

const storageKey = `settings`

export function runSettingsMigration(val: object) {
  // from v0.28.2, remove after several releases
  const config: Array<[configPath: LeafSettingsPath, legacyConfigPath: string]> = [
    ['dynamicFeed.showLive', 'dynamicFeedShowLive'],
    ['dynamicFeed.followGroup.enabled', 'dynamicFeedFollowGroupEnabled'],
    [
      'dynamicFeed.followGroup.forceUseMergeTimelineIds',
      'dynamicFeedFollowGroupForceUseMergeTimelineIds',
    ],
    [
      'dynamicFeed.whenViewAll.enableHideSomeContents',
      'dynamicFeedWhenViewAllEnableHideSomeContents',
    ],
    ['dynamicFeed.whenViewAll.hideIds', 'dynamicFeedWhenViewAllHideIds'],
    ['dynamicFeed.advancedSearch', 'dynamicFeedAdvancedSearch'],

    ['fav.useShuffle', 'favUseShuffle'],
    ['fav.addSeparator', 'favAddSeparator'],
    ['fav.excludedFolderIds', 'favExcludedFolderIds'],
  ]
  for (const [configPath, legacyConfigPath] of config) {
    const haveValue = (v: any) => !isNil(v) // 迁移设置, 只是改名, 不用考虑空数组
    if (haveValue(get(val, configPath))) {
      // already have a value
      continue
    }
    if (!haveValue(get(val, legacyConfigPath))) {
      // no legacy value
      continue
    }
    // fallback to legacy
    set(val, configPath, get(val, legacyConfigPath))
  }
}

export async function load() {
  const val = await GM.getValue<Settings>(storageKey)
  if (val && typeof val === 'object') {
    runSettingsMigration(val)
    updateSettings(val)
  }

  // persist when config change
  subscribe(settings, () => {
    save()
  })
}

async function save() {
  const newVal = cloneDeep(snapshot(settings))
  // console.log('GM.setValue newVal = %o', newVal)

  // GM save
  await GM.setValue(storageKey, newVal)

  // http backup
  await saveToDraft(newVal as Readonly<Settings>)
}

export function getSettings(path: LeafSettingsPath) {
  return get(settings, path)
}

/**
 * pick
 */
export function pickSettings(
  source: PartialDeep<Settings>,
  paths: LeafSettingsPath[],
  omit: LeafSettingsPath[] = [],
) {
  const pickedSettings: PartialDeep<Settings> = {}
  const pickedPaths = paths.filter(
    (p) => allowedLeafSettingsPaths.includes(p) && !omit.includes(p) && !isNil(get(source, p)),
  )
  pickedPaths.forEach((p) => {
    const v = get(source, p)
    set(pickedSettings, p, v)
  })
  return { pickedPaths, pickedSettings }
}

/**
 * update & persist
 */
export function updateSettings(payload: PartialDeep<Settings>) {
  const { pickedPaths } = pickSettings(payload, allowedLeafSettingsPaths)
  for (const p of pickedPaths) {
    const v = get(payload, p)
    set(settings, p, v)
  }
}

/**
 * reset
 */
export function resetSettings() {
  return updateSettings(initialSettings)
}

/**
 * load on init
 */
await load()

/**
 * access_key expire check
 */
if (
  IN_BILIBILI_HOMEPAGE &&
  settings.accessKey &&
  settings.accessKeyExpireAt &&
  Date.now() >= settings.accessKeyExpireAt
) {
  toast('access_key 已过期, 请重新获取 !!!')
}
