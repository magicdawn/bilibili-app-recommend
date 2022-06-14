import { proxy, useSnapshot } from 'valtio'

export const config = proxy({
  accessKey: '',

  // 窄屏模式
  useNarrowMode: false,

  // 自动查看更多
  initialShowMore: false,
})

type Config = typeof config

export const useConfigStore = function () {
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
    Object.assign(config, val)
  }
}
export function save() {
  GM_setValue(key, config)
}
export function clean() {
  GM_deleteValue(key)
}

/**
 * update & persist
 */
export function updateConfig(c: Partial<Config>) {
  Object.assign(config, c)
  save()
}

/**
 * load on init
 */

load()
