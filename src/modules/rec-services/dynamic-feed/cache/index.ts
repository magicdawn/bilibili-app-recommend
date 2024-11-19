import type { DynamicFeedItem } from '$define'
import { getIdbCache } from '$utility/idb'
import { uniqBy } from 'es-toolkit'
import { fetchVideoDynamicFeeds } from '../api'

const cache = getIdbCache<DynamicFeedItem[]>('dynamic-feed-items')
const lastUpdatedAtCache = getIdbCache<number>('dynamic-feed-last-updated-at')
export { cache as localDynamicFeedCache, lastUpdatedAtCache as localDynamicFeedLastUpdatedAtCache }

export async function hasLocalDynamicFeedCache(upMid: number) {
  const existing = await cache.get(upMid)
  return !!existing?.length
}

export async function updateLocalDynamicFeedCache(upMid: number) {
  if (await hasLocalDynamicFeedCache(upMid)) {
    // perform incremental update
    await performIncrementalUpdate(upMid)
    await lastUpdatedAtCache.set(upMid, Date.now())
  } else {
    // perform full update
    await performFullUpdate(upMid)
    await lastUpdatedAtCache.set(upMid, Date.now())
  }
}

/**
 * 近期已经更新过, 不要再更新了
 */
export async function performIncrementalUpdateIfNeed(upMid: number, force = false) {
  const lastUpdatedAt = await lastUpdatedAtCache.get(upMid)
  if (!force && lastUpdatedAt && Date.now() - lastUpdatedAt < 60 * 1000) return
  return performIncrementalUpdate(upMid)
}

async function performIncrementalUpdate(upMid: number) {
  // it's built for "incremental"
  if (!(await hasLocalDynamicFeedCache(upMid))) return

  const existing = (await cache.get(upMid)) || []
  const existingIds = new Set(existing.map((x) => x.id_str))

  let page = 1
  let offset = ''
  let hasMore = true
  let newItems: DynamicFeedItem[] = []

  while (hasMore) {
    const data = await fetchVideoDynamicFeeds({ upMid, page, offset })
    const items = data.items
    newItems = [...newItems, ...items]
    offset = data.offset
    hasMore = data.has_more
    page++

    if (hasMore) {
      const allIncluded = items.every((item) => existingIds.has(item.id_str))
      if (allIncluded) {
        hasMore = false
      }
    }
  }

  const allItems = uniqBy([...newItems, ...existing], (x) => x.id_str)
  await cache.set(upMid, allItems)
}

const fullUpdateInProgressCache = getIdbCache<{
  page: number
  offset: string
  items: DynamicFeedItem[]
}>('dynamic-feed-items-in-progress')

async function performFullUpdate(upMid: number, skipCache = false) {
  const inProgressCached = skipCache ? undefined : await fullUpdateInProgressCache.get(upMid)
  let page = inProgressCached?.page ?? 1
  let offset = inProgressCached?.offset ?? ''
  let allItems: DynamicFeedItem[] = inProgressCached?.items ?? []
  let hasMore = true

  while (hasMore) {
    const data = await fetchVideoDynamicFeeds({ upMid, page, offset })
    const items = data.items
    allItems = [...allItems, ...items]
    offset = data.offset
    hasMore = data.has_more
    page++

    // save cache for future continuation
    await fullUpdateInProgressCache.set(upMid, { page, offset, items: allItems })
  }

  // completed
  await cache.set(
    upMid,
    uniqBy(allItems, (x) => x.id_str),
  )
  await fullUpdateInProgressCache.delete(upMid)
}
