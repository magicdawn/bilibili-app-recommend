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
  const savedValue: T[] = (await GM.getValue(storageKey)) || []
  const p = proxySet<T>(savedValue)

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    subscribe(p, () => {
      const val = Array.from(snapshot(p))
      GM.setValue(storageKey, val)
    })
  })

  return p
}

export async function proxyMapWithGmStorage<K, V>(
  storageKey: string,
  beforeSave?: (vals: [K, V][]) => [K, V][],
) {
  const savedValue: [key: K, value: V][] = (await GM.getValue(storageKey)) || []
  const p = proxyMap<K, V>(savedValue)

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    subscribe(p, () => {
      let val = Array.from(snapshot(p))
      if (beforeSave) val = beforeSave(val)
      GM.setValue(storageKey, val)
    })
  })

  return p
}
