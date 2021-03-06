import { pick } from 'lodash'
import { proxy, subscribe, useSnapshot } from 'valtio'

const initialConfig = {
  accessKey: '',

  // 窄屏模式
  useNarrowMode: false,

  // 自动查看更多
  initialShowMore: false,
}
const allowedConfigKeys = Object.keys(initialConfig)

type Config = typeof initialConfig
export const config = proxy(initialConfig)

export const useConfigSnapshot = function () {
  return useSnapshot(config)
}

/**
 * storage
 */

const nsp = 'bilibili-app-recommend'
const key = `${nsp}.config`

export function load() {
  const val = GM_getValue<Config>(key)
  if (val && typeof val === 'object') {
    Object.assign(config, pick(val, allowedConfigKeys))
  }

  // persist when config change
  subscribe(config, () => {
    save()
  })
}
export function save() {
  GM_setValue(key, pick(config, allowedConfigKeys))
}
export function clean() {
  GM_deleteValue(key)
}

/**
 * update & persist
 */
export function updateConfig(c: Partial<Config>) {
  Object.assign(config, c)
}

/**
 * load on init
 */

load()
