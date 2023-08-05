import { APP_NAME, baseDebug } from '$common'
import { setData } from '$service/user/article-draft'
import { omit, pick, throttle } from 'lodash'
import ms from 'ms'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'

const debug = baseDebug.extend('settings')

export const initialSettings = {
  accessKey: '',

  // 窄屏模式
  useNarrowMode: false,

  // 自动查看更多
  initialShowMore: false,

  // 纯推荐模式
  pureRecommend: false,

  // 是否使用 PC 端接口
  // https://github.com/magicdawn/bilibili-app-recommend/issues/16
  // usePcDesktopApi: false,

  // 并行请求
  // useParallelRequest: true,

  // 自动开始预览
  autoPreviewWhenKeyboardSelect: false,

  // 自动预览更新间隔
  autoPreviewUpdateInterval: 400,

  // 鼠标悬浮自动预览, 不再跟随鼠标位置
  // 默认: 跟随鼠标
  autoPreviewWhenHover: false,

  // 颜色主题
  theme: '',
  colorPickerThemeSelectedColor: '', // 自定义颜色

  /**
   * tab=watchlater
   */
  shuffleForWatchLater: true, // 打乱顺序

  /**
   * tab=fav
   */
  shuffleForFav: true, // 打乱顺序
  excludeFavFolderIds: [] as string[], // 忽略的收藏夹

  /**
   * 过滤器模块
   * 使用 flat config 方便使用 FlagSettingItem
   */

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

  /**
   * 外观
   */

  // 大卡片, 大间距
  styleUseYoutubeLikeCard: false,

  // video-source-tab 高度, 默认 compact
  styleUseStandardVideoSourceTab: false,

  /**
   * 功能
   */
  backupSettingsToArticleDraft: false,
}

export type Config = typeof initialSettings
export const settings = proxy({ ...initialSettings })

export type ConfigKey = keyof Config
export const allowedConfigKeys = Object.keys(initialSettings) as ConfigKey[]

export type BooleanConfigKey = {
  [k in ConfigKey]: Config[k] extends boolean ? k : never
}[ConfigKey]

export const useSettingsSnapshot = function () {
  return useSnapshot(settings)
}

/**
 * storage
 */

const nsp = APP_NAME
const key = `${nsp}.settings`

export async function load() {
  const val = await GM.getValue<Config>(key)
  if (val && typeof val === 'object') {
    Object.assign(settings, pick(val, allowedConfigKeys))
  }

  // persist when config change
  subscribe(settings, () => {
    save()
  })
}

const setDataThrottled = throttle(setData, ms('5s'))

export async function save() {
  const newVal = snapshot(settings)
  // console.log('GM.setValue newVal = %o', newVal)

  // GM
  await GM.setValue(key, newVal)

  // http backup
  const httpBackupVal = omit(newVal, ['accessKey'])
  // 如果 (window as any)[`${APP_NAME}-restore`] 存在, 则是刚从备份恢复的, 等等刷新网页
  if (httpBackupVal.backupSettingsToArticleDraft && !(window as any)[`${APP_NAME}-restore`]) {
    try {
      await setDataThrottled(httpBackupVal)
      debug('backup to article draft complete')
    } catch (e: any) {
      console.error(e.stack || e)
    }
  }
}

export function clean() {
  return GM.deleteValue(key)
}

/**
 * update & persist
 */
export function updateSettings(c: Partial<Config>) {
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
