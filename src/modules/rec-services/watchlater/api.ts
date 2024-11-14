import { APP_NAME } from '$common'
import { encWbi } from '$modules/bilibili/risk-control'
import { isWebApiSuccess, request } from '$request'
import type { WatchlaterItem, WatchlaterJson } from './api.d'

/**
 * 一次性获取所有「稍后再看」
 * request.get('/x/v2/history/toview/web')
 * @history 2024-11-14 间歇性, 有 count, 但内容为空, {count: 123, items: []}
 */

/**
 * 分页
 */

export async function getWatchlaterItemFrom(startKey = '') {
  const res = await request.get('/x/v2/history/toview/v2/list', {
    params: await encWbi({
      start_key: startKey,
      asc: false,
      sort_field: 1,
      web_location: 333.881,
    }),
  })
  const json = res.data as WatchlaterJson
  if (!isWebApiSuccess(json)) {
    console.warn(`[${APP_NAME}] getAllWatchlaterItemsV2 error %s, fulljson %o`, json.message, json)
    return
  }

  return {
    total: json.data.show_count,
    hasMore: json.data.has_more,
    nextKey: json.data.next_key,
    items: json.data.list,
  }
}

export async function getAllWatchlaterItemsV2(abortSignal?: AbortSignal) {
  let hasMore = true
  let startKey = ''
  let total = 0
  let items: WatchlaterItem[] = []

  while (hasMore) {
    if (abortSignal?.aborted) break

    const result = await getWatchlaterItemFrom(startKey)
    if (!result) break

    items = items.concat(result.items)
    startKey = result.nextKey
    hasMore = result.hasMore
    total = result.total
  }

  return items
}
