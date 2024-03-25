export function valtioFactory<T>(value: T) {
  const state = proxy({ value })

  function use() {
    return useSnapshot(state).value
  }

  function get() {
    return state.value
  }

  return { state, use, get }
}
