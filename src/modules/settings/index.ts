import { APP_NAME, IN_BILIBILI_HOMEPAGE, baseDebug } from '$common'
import { HAS_RESTORED_SETTINGS } from '$components/ModalSettings/index.shared'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode } from '$components/VideoCard/index.shared'
import { EAppApiDevice } from '$define/index.shared'
import { BilibiliArticleDraft } from '$modules/user/article-draft'
import { toast } from '$utility/toast'
import { isEqual, omit, pick, throttle } from 'lodash'
import ms from 'ms'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

const debug = baseDebug.extend('settings')

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

  /**
   * tab=dynamic-feed
   */
  hideChargeOnlyDynamicFeedVideos: false,

  /**
   * tab=watchlater
   */
  shuffleForWatchLater: true, // 打乱顺序
  addSeparatorForWatchLater: true, // 添加 "近期" / "更早" 分割线

  /**
   * tab=fav
   */
  shuffleForFav: true, // 打乱顺序
  excludeFavFolderIds: [] as string[], // 忽略的收藏夹
  addSeparatorForFav: true, // 收藏夹分割线

  /**
   * tab=popular-general
   */
  // shuffleForPopularGeneral: false, // shuffle
  anonymousForPopularGeneral: false, // without credentials

  /**
   * tab=popular-weekly
   */
  shuffleForPopularWeekly: false, // shuffle
  showPopularWeeklyOnlyOnWeekend: false, // only on weekend

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

  // 已关注UP的推荐视频, 默认不参与过滤
  enableFilterForFollowedVideo: false,

  // filter out whose goto = 'picture'
  filterOutGotoTypePicture: false,
  // 已关注UP的推荐图文, 默认不参与过滤
  // 图文也是有 rcmd_reason = '已关注' 的
  enableFilterForFollowedPicture: false,

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

  // video-source-tab 高度, 默认 compact
  styleUseStandardVideoSourceTab: false,

  // sticky tabbar
  styleUseStickyTabbarInPureRecommend: true,

  // custom grid | default grid
  styleUseCustomGrid: true,

  // bg1
  styleUseWhiteBackground: true,

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

export function useSettingsSnapshot() {
  return useSnapshot(settings)
}

/**
 * storage
 */

const nsp = APP_NAME
const key = `${nsp}.settings`

export async function load() {
  const val = await GM.getValue<Settings>(key)
  if (val && typeof val === 'object') {
    Object.assign(settings, pick(val, allowedSettingsKeys))
  }

  // persist when config change
  subscribe(settings, () => {
    save()
  })
}

export const articleDraft = new BilibiliArticleDraft(APP_NAME)
const setDataThrottled = throttle(articleDraft.setData, ms('5s'))

export async function save() {
  const newVal = snapshot(settings)
  // console.log('GM.setValue newVal = %o', newVal)

  // GM save
  await GM.setValue(key, newVal)

  // http backup
  await saveToDraft(newVal as Readonly<Settings>)
}

const omitKeys: SettingsKey[] = [
  // private
  'accessKey',
  'accessKeyExpireAt',

  // 无关紧要
  'shuffleForFav',
  'addSeparatorForFav',

  'shuffleForWatchLater',
  'addSeparatorForWatchLater',

  'shuffleForPopularWeekly',
  'anonymousForPopularGeneral',
  'hideChargeOnlyDynamicFeedVideos',
]

let lastBackupVal: Partial<Settings> | undefined

async function saveToDraft(val: Readonly<Settings>) {
  if (!val.backupSettingsToArticleDraft) return
  // skip when `HAS_RESTORED_SETTINGS=true`
  if (HAS_RESTORED_SETTINGS) return

  const currentBackupVal = omit(val, omitKeys)
  const shouldBackup = !lastBackupVal || !isEqual(lastBackupVal, currentBackupVal)
  if (!shouldBackup) return

  try {
    await setDataThrottled(currentBackupVal)
    lastBackupVal = currentBackupVal
    debug('backup to article draft complete')
  } catch (e: any) {
    console.error(e.stack || e)
  }
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
