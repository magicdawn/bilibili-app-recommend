import pLimit from 'p-limit'

export function createUpdateDataFunction<T extends unknown[], R>({
  fn,
  getCached,
}: {
  fn: (...args: T) => R
  getCached: (...args: T) => Promise<Awaited<NoInfer<R>> | undefined>
}) {
  const limit = pLimit(1) // serve as a mutex
  return async (...args: T): Promise<Awaited<R>> => {
    const ret = await getCached(...args)
    if (ret) return ret

    return await limit(async () => {
      // we get the lock, before run real update, check cache again
      const ret = await getCached(...args)
      if (ret) return ret

      return await fn(...args)
    })
  }
}
