import { useRef } from 'react'

export function useRefInit<T>(init: () => T) {
  const ref = useRef<T>(null as T)
  if (!ref.current) ref.current = init()
  return ref
}
