import { APP_NAME } from '$common'
import { pick } from 'lodash'
import { proxy, subscribe, useSnapshot } from 'valtio'

export const initialSettings = {
  accessKey: '',

  // 窄屏模式
  useNarrowMode: false,

  // 自动查看更多
  initialShowMore: false,

  // 纯推荐模式
  pureRecommend: false,

  // 右键在 IINA 中打开
  openInIINAWhenRightClick: false,

  // 是否使用 PC 端接口
  // https://github.com/magicdawn/bilibili-app-recommend/issues/16
  usePcDesktopApi: false,

  // 并行请求
  useParallelRequest: true,

  // 自动开始预览
  autoPreviewWhenKeyboardSelect: false,

  // 自动预览更新间隔
  autoPreviewUpdateInterval: 400,

  // 鼠标悬浮自动预览, 不再跟随鼠标位置
  // 默认: 跟随鼠标
  autoPreviewWhenHover: false,

  // 颜色主题
  theme: '',

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
  enableFilterForFollowed: false,
}

export type Config = typeof initialSettings
export const settings = proxy({ ...initialSettings })

export type ConfigKey = keyof Config
const allowedConfigKeys = Object.keys(initialSettings) as ConfigKey[]

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

export function load() {
  const val = GM_getValue<Config>(key)
  if (val && typeof val === 'object') {
    Object.assign(settings, pick(val, allowedConfigKeys))
  }

  // persist when config change
  subscribe(settings, () => {
    save()
  })
}
export function save() {
  const newVal = pick(settings, allowedConfigKeys)
  // console.log('GM_setValue newVal = %o', newVal)
  GM_setValue(key, newVal)
}
export function clean() {
  GM_deleteValue(key)
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

load()
