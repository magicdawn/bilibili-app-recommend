import { throttle } from 'lodash'

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
