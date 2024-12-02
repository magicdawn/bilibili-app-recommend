import { isEqual, pick, throttle } from 'es-toolkit'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { proxyMap, proxySet } from 'valtio/utils'

export function valtioFactory<T>(computeValue: () => T) {
  const state = proxy({ value: computeValue() })

  function use() {
    return useSnapshot(state).value
  }

  function get() {
    return state.value
  }

  function update() {
    state.value = computeValue()
  }

  const updateThrottled = throttle(update, 100, { edges: ['leading', 'trailing'] })

  return { state, use, get, update, updateThrottled }
}

export function subscribeOnKeys<T extends object>(
  state: T,
  keys: (keyof T)[],
  callback: (newState: T) => void,
) {
  let prevVal = pick(snapshot(state) as T, keys)

  subscribe(state, () => {
    const snap = snapshot(state)
    const val = pick(snap as T, keys)
    if (!isEqual(prevVal, val)) {
      callback(snap as T)
    }
    prevVal = val
  })
}

export function proxyWithLocalStorage<T extends object>(initialVaue: T, storageKey: string) {
  const allowedKeys = Object.keys(initialVaue)
  const savedValue = pick(JSON.parse(localStorage.getItem(storageKey) || '{}') as any, allowedKeys)

  const p = proxy<T>({
    ...initialVaue,
    ...savedValue,
  })

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    subscribe(p, () => {
      const val = snapshot(p)
      localStorage.setItem(storageKey, JSON.stringify(val))
    })
  })

  return p
}

export async function proxyWithGmStorage<T extends object>(initialVaue: T, storageKey: string) {
  const allowedKeys = Object.keys(initialVaue)
  const savedValue = pick(((await GM.getValue(storageKey)) || {}) as any, allowedKeys)

  const p = proxy<T>({
    ...initialVaue,
    ...savedValue,
  })

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    subscribe(p, () => {
      const val = snapshot(p)
      GM.setValue(storageKey, val)
    })
  })

  return p
}

export async function proxySetWithGmStorage<T>(storageKey: string) {
  const load = async (): Promise<T[]> => (await GM.getValue(storageKey)) || []
  const p = proxySet<T>(await load())

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    const onChange = throttle(async () => {
      // existing
      const set = new Set<T>(await load())
      // update
      for (const x of snapshot(p)) set.add(x)
      // serialize
      const val = Array.from(set)
      GM.setValue(storageKey, val)
    }, 100)
    subscribe(p, onChange)
  })

  return p
}

export async function proxyMapWithGmStorage<K, V>(
  storageKey: string,
  beforeSave?: (vals: [K, V][]) => [K, V][],
) {
  const load = async (): Promise<[K, V][]> => (await GM.getValue(storageKey)) || []
  const p = proxyMap<K, V>(await load())

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    const onChange = throttle(async () => {
      // existing
      const map = new Map<K, V>(await load())
      // update map
      for (const [k, v] of snapshot(p)) map.set(k, v)
      // serialize
      let val = Array.from(map)
      if (beforeSave) val = beforeSave(val)
      GM.setValue(storageKey, val)
    }, 100)
    subscribe(p, onChange)
  })

  return p
}
