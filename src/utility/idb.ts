/**
 * indexedDB related
 */

import { APP_NAME } from '$common'
import localforage from 'localforage'
import pLimit from 'p-limit'
import { whenIdle } from './dom'

export function getIdbCache<T>(tableName: string) {
  const db = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: APP_NAME,
    storeName: tableName,
  })
  return {
    db,
    get(key: string | number) {
      return db.getItem<T>(key.toString())
    },
    set(key: string | number, entry: T) {
      return db.setItem(key.toString(), entry)
    },
  }
}

export function wrapWithIdbCache<A extends unknown[], FnReturnType>({
  fn,
  generateKey,
  tableName,
  ttl,
  concurrency, // concurrency for `fn`
  autoCleanUp = true,
}: {
  fn: (...args: A) => FnReturnType
  generateKey: (args: NoInfer<A>) => string
  tableName: string
  ttl: number
  concurrency?: number
  autoCleanUp?: boolean
}) {
  type R = Awaited<FnReturnType>
  type CacheEntry = { ts: number; val: R }

  const cache = getIdbCache<CacheEntry>(tableName)
  const limit = concurrency && concurrency > 0 ? pLimit(concurrency) : undefined

  async function cleanUp() {
    cache.db.iterate((cached: CacheEntry, key) => {
      if (Date.now() - cached.ts > ttl) {
        cache.db.removeItem(key)
      }
    })
  }
  if (autoCleanUp) {
    whenIdle().then(cleanUp)
  }

  function shouldReuse(cached: CacheEntry) {
    return cached.val && cached.ts && Date.now() - cached.ts <= ttl
  }

  async function wrapped(...args: A): Promise<R> {
    const key = generateKey(args)
    const cached = await cache.get(key)
    if (cached && shouldReuse(cached)) return cached.val
    const result = await (limit ? limit(() => fn(...args)) : fn(...args))
    await cache.set(key, { ts: Date.now(), val: result })
    return result
  }
  Object.defineProperties(wrapped, {
    cache: { value: cache },
    cleanUp: { value: cleanUp },
  })

  return wrapped as {
    (...args: A): Promise<R>
    cache: typeof cache
    cleanUp: typeof cleanUp
  }
}
