import { IN_BILIBILI_HOMEPAGE } from '$common'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode } from '$components/VideoCard/index.shared'
import { EAppApiDevice } from '$define/index.shared'
import { toast } from '$utility/toast'
import { pick } from 'es-toolkit'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { saveToDraft } from './cloud-backup'

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
  dynamicFeedShowLive: true, // 在动态中显示直播
  dynamicFeedEnableFollowGroupFilter: true, // 下拉筛选支持 - 关注分组
  dynamicFeedWhenViewAllHideMids: [] as string[], // 在「全部」动态中隐藏 UP 的动态

  /**
   * tab=watchlater
   */
  watchlaterUseShuffle: true, // 打乱顺序
  watchlaterAddSeparator: true, // 添加 "近期" / "更早" 分割线
  watchlaterNormalOrderSortByAddAtAsc: false,

  /**
   * tab=fav
   */
  favUseShuffle: true, // 打乱顺序
  favAddSeparator: true, // 收藏夹分割线
  favExcludedFolderIds: [] as string[], // 忽略的收藏夹

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
  __internalVideoCardUsePadding: false,
  __internalHotSubUseDropdown: false,
  __internalDynamicFeedCacheAllItemsEntry: false,
  __internalDynamicFeedCacheAllItemsUpMids: [] as string[], // enable for these up
  __internalDynamicFeedAdvancedSearch: false,
  __internalDynamicFeedAddCopyBvidButton: false,
}

export type Settings = typeof initialSettings
export const settings = proxy({ ...initialSettings })

export type SettingsKey = keyof Settings
export const allowedSettingsKeys = Object.keys(initialSettings) as SettingsKey[]

export type BooleanSettingsKey = {
  [k in SettingsKey]: Settings[k] extends boolean ? k : never
}[SettingsKey]

export type ListSettingsKey = {
  [k in SettingsKey]: Settings[k] extends Array<any> ? k : never
}[SettingsKey]

export const internalBooleanKeys = (Object.keys(initialSettings) as SettingsKey[]).filter(
  (k) => k.startsWith('__internal') && typeof initialSettings[k] === 'boolean',
) as BooleanSettingsKey[]

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

export async function load() {
  const val = await GM.getValue<Settings>(storageKey)
  if (val && typeof val === 'object') {
    Object.assign(settings, pick(val, allowedSettingsKeys))
  }

  // persist when config change
  subscribe(settings, () => {
    save()
  })
}

async function save() {
  const newVal = snapshot(settings)
  // console.log('GM.setValue newVal = %o', newVal)

  // GM save
  await GM.setValue(storageKey, newVal)

  // http backup
  await saveToDraft(newVal as Readonly<Settings>)
}

/**
 * update & persist
 */
export function updateSettings(c: Partial<Settings>) {
  Object.assign(settings, c)
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
