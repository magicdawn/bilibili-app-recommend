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
}

export type Config = typeof initialSettings
export const settings = proxy({ ...initialSettings })

export type ConfigKey = keyof Config
const allowedConfigKeys = Object.keys(initialSettings) as ConfigKey[]

export const useSettingsSnapshot = function () {
  return useSnapshot(settings)
}

/**
 * storage
 */

const nsp = 'bilibili-app-recommend'
const legacyKey = `${nsp}.config`
const key = `${nsp}.settings`

export function load() {
  // 迁移到新 key, 后续移除
  // TODO: remove 数据迁移代码
  if (
    Object.keys(GM_getValue(legacyKey) || {}).length &&
    !Object.keys(GM_getValue(key) || {}).length
  ) {
    GM_setValue(key, GM_getValue(legacyKey))
    GM_deleteValue(legacyKey)
  }

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
