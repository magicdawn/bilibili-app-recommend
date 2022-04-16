export const config = {
  access_key: '',
}

type Config = typeof config

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
