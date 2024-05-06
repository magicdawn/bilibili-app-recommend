/**
 * useState + a ref
 *
 * https://github.com/alibaba/hooks/pull/2348#issuecomment-1794002832
 * 还没有合并, 这里简单实现一下, signature 与 useGetState 一致
 */

export function useRefState<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(initialValue)

  const ref = useRef(state)

  const setStateWraped: typeof setState = useCallback(
    (payload) => {
      const nextState =
        typeof payload === 'function' ? (payload as (prev: T) => T)(ref.current) : payload
      ref.current = nextState
      setState(nextState)
    },
    [setState],
  )

  const getState = useCallback(() => ref.current, [])

  return [state, setStateWraped, getState] as const
}

export type RefState$<T> = ReturnType<typeof useRefState$<T>>
export function useRefState$<T>(initialValue: T | (() => T)) {
  const [state, set, get] = useRefState(initialValue)
  return {
    state, // use state in render, other case use `.val`
    get,
    set,
    get val() {
      return get()
    },
    set val(newValue) {
      set(newValue)
    },
  }
}

export type Ref$<T> = ReturnType<typeof useRef$<T>>
export function useRef$<T>(initialValue: T) {
  const ref = useRef(initialValue)
  const get = useCallback(() => ref.current, [])
  const set = useCallback((newValue: T) => (ref.current = newValue), [])
  return {
    get,
    set,
    get val() {
      return get()
    },
    set val(newValue: T) {
      set(newValue)
    },
  }
}
