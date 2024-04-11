import { APP_NAME, IN_BILIBILI_HOMEPAGE, baseDebug } from '$common'
import { HAS_RESTORED_SETTINGS } from '$components/ModalSettings/index.shared'
import type { ETabType } from '$components/RecHeader/tab.shared'
import { EAppApiDevice } from '$define/index.shared'
import { BilibiliArticleDraft } from '$modules/user/article-draft'
import { toast } from '$utility/toast'
import { omit, pick, throttle } from 'lodash'
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
  showModalFeedEntry: true,

  // ModalFeed.全屏
  modalFeedFullScreen: false,

  /**
   * Video Card
   */

  // 自动开始预览
  autoPreviewWhenKeyboardSelect: false,

  // 自动预览更新间隔
  autoPreviewUpdateInterval: 400,

  // 鼠标悬浮自动预览, 不再跟随鼠标位置, 默认: 跟随鼠标
  autoPreviewWhenHover: false,

  // hover 延时
  useDelayForHover: false,

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
  shuffleForPopularWeekly: false,

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

  /**
   * 外观
   */

  // 新卡片样式
  styleNewCardStyle: true,

  // video-source-tab 高度, 默认 compact
  styleUseStandardVideoSourceTab: false,

  // sticky tabbar
  styleUseStickyTabbarInPureRecommend: true,

  // custom grid | default grid
  styleUseCustomGrid: true,

  /**
   * 颜色主题
   */
  theme: '',
  colorPickerThemeSelectedColor: '', // 自定义颜色

  /**
   * 功能
   */
  backupSettingsToArticleDraft: false,

  // 点击视频默认在 popup 中打开
  openVideoInPopupWhenClick: false,

  // 新标签打开时, 自动全屏
  openVideoAutoFullscreen: false,

  /**
   * 隐藏的 tab, 使用黑名单, 功能迭代之后新增的 tab, 默认开启.
   * 如果使用白名单, 新增的 tab 会被隐藏
   */
  hidingTabKeys: [] as ETabType[],
  customTabKeysOrder: [] as ETabType[],
}

export type Settings = typeof initialSettings
export const settings = proxy({ ...initialSettings })

export type SettingsKey = keyof Settings
export const allowedSettingsKeys = Object.keys(initialSettings) as SettingsKey[]

export type BooleanSettingsKey = {
  [k in SettingsKey]: Settings[k] extends boolean ? k : never
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

async function saveToDraft(val: Readonly<Settings>) {
  if (!val.backupSettingsToArticleDraft) return

  // skip when `HAS_RESTORED_SETTINGS=true`
  if (HAS_RESTORED_SETTINGS) return

  const httpBackupVal = omit(val, ['accessKey', 'accessKeyExpireAt'])
  try {
    await setDataThrottled(httpBackupVal)
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
