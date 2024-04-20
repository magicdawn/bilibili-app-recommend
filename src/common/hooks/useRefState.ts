/**
 * useState + a ref
 *
 * https://github.com/alibaba/hooks/pull/2348#issuecomment-1794002832
 * 还没有合并, 这里简单实现一下, signature 与 useGetState 一致
 */

export function useRefState<T>(initValue: T | (() => T)) {
  const [state, setState] = useState<T>(initValue)

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
