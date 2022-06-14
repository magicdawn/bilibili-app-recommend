import { useMemo } from 'react'

export function useUUID() {
  return useMemo(() => crypto.randomUUID(), [])
}
