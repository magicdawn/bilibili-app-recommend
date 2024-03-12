export function useRefInit<T>(init: () => T) {
  const ref = useRef<T>(null as T)
  ref.current ??= init()
  return ref
}
