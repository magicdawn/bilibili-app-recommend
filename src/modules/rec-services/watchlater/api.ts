import { appWarn } from '$common'
import { encWbi } from '$modules/bilibili/risk-control'
import { isWebApiSuccess, request } from '$request'
import type { WatchlaterItem, WatchlaterJson } from './types'

/**
 * 一次性获取所有「稍后再看」
 * request.get('/x/v2/history/toview/web')
 * @history 2024-11-14 间歇性, 有 count, 但内容为空, {count: 123, items: []}
 */

/**
 * 分页
 */

export async function getWatchlaterItemFrom(startKey = '', asc = false) {
  const res = await request.get('/x/v2/history/toview/v2/list', {
    params: await encWbi({
      start_key: startKey,
      asc,
      sort_field: 1,
      web_location: 333.881,
    }),
  })

  const json = res.data as WatchlaterJson
  if (!isWebApiSuccess(json)) {
    appWarn('getAllWatchlaterItemsV2 error %s, fulljson %o', json.message, json)
    return { err: json.message }
  }

  return {
    total: json.data.show_count,
    hasMore: json.data.has_more,
    nextKey: json.data.next_key,
    items: filterOutApiReturnedRecent(json.data.list || []),
  }
}

export async function getAllWatchlaterItemsV2(asc = false, abortSignal?: AbortSignal) {
  let hasMore = true
  let startKey = ''
  let total = 0
  let items: WatchlaterItem[] = []
  let err: string | undefined

  while (hasMore) {
    if (abortSignal?.aborted) break

    const result = await getWatchlaterItemFrom(startKey, asc)
    if (typeof result.err !== 'undefined') {
      err = result.err
      break
    }

    items = items.concat(result.items)
    startKey = result.nextKey
    hasMore = result.hasMore
    total = result.total
  }

  return {
    err,
    items,
  }
}

function filterOutApiReturnedRecent(items: WatchlaterItem[]) {
  // title:以下为更早添加的视频, aid:0, bvid:"", add_at:0
  // 新添加一个, 然后第一次请求 v2 API 会返回这个
  return items.filter(
    (item) =>
      !(
        item.title === '以下为更早添加的视频' &&
        item.aid === 0 &&
        item.bvid === '' &&
        item.add_at === 0
      ),
  )
}
