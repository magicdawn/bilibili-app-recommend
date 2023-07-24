import { pick } from 'lodash'
import { proxy, snapshot, subscribe } from 'valtio'

export function proxyWithLocalStorage<T extends object>(initialVaue: T, storageKey: string) {
  const allowedKeys = Object.keys(initialVaue)
  const savedValue = pick(JSON.parse(localStorage.getItem(storageKey) || '{}'), allowedKeys)

  const p = proxy<T>({
    ...initialVaue,
    ...savedValue,
  })

  subscribe(p, () => {
    const val = snapshot(p)
    localStorage.setItem(storageKey, JSON.stringify(val))
  })

  return p
}
