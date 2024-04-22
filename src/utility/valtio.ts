import { isEqual, pick, throttle } from 'lodash'
import { snapshot, subscribe } from 'valtio'

export function valtioFactory<T>(getValue: () => T) {
  const state = proxy({ value: getValue() })

  function use() {
    return useSnapshot(state).value
  }

  function get() {
    return state.value
  }

  function update() {
    state.value = getValue()
  }

  const updateThrottled = throttle(update, 100, { leading: true, trailing: true })

  return { state, use, get, update, updateThrottled }
}

export function subscribeOnKeys<T extends object>(
  state: T,
  keys: (keyof T)[],
  callback: (newState: T) => void,
) {
  let prevVal = pick(snapshot(state), keys)

  subscribe(state, () => {
    const stateValues = snapshot(state)
    const val = pick(stateValues, keys)
    if (!isEqual(prevVal, val)) {
      callback(stateValues as T)
    }
    prevVal = val
  })
}
