/* eslint-disable no-constant-condition */
import { baseDebug } from '$common'
import { FetcherOptions } from '$components/RecGrid/useRefresh'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { TabType } from '$components/RecHeader/tab'
import { anyFilterEnabled, filterVideos } from '$components/VideoCard/process/filter'
import { lookinto } from '$components/VideoCard/process/normalize'
import { RecItemType } from '$define'
import { uniqBy } from 'lodash'
import * as app from './service-app'
import { PcRecService } from './service-pc'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemType) =>
  lookinto<string | number>(item, {
    pc: (item) => item.id,
    app: (item) => item.param,
    dynamic: (item) => item.modules.module_dynamic.major.archive.aid,
    watchlater: (item) => item.bvid,
    fav: (item) => item.bvid,
  })

export function uniqConcat(existing: RecItemType[], newItems: RecItemType[]) {
  const ids = existing.map(recItemUniqer)
  newItems = uniqBy(newItems, recItemUniqer)
  return existing.concat(
    newItems.filter((item) => {
      return !ids.includes(recItemUniqer(item))
    })
  )
}

export const usePcApi = (tab: TabType) => tab === 'onlyFollow' || tab === 'recommend-pc'

export async function getMinCount(
  count: number,
  fetcherOptions: FetcherOptions,
  filterMultiplier = 5
) {
  const { pcRecService, dynamicFeedService, watchLaterService, favService, tab, abortSignal } =
    fetcherOptions

  let items: RecItemType[] = []
  let hasMore = true

  const addMore = async (restCount: number) => {
    let cur: RecItemType[] = []

    // 动态
    if (tab === 'dynamic') {
      cur = (await dynamicFeedService.loadMore(abortSignal)) || []
      hasMore = dynamicFeedService.hasMore
      items = items.concat(cur)
      return
    }
    // 稍候再看
    if (tab === 'watchlater') {
      cur = (await watchLaterService.loadMore()) || []
      hasMore = watchLaterService.hasMore
      items = items.concat(cur)
      return
    }
    // 收藏
    if (tab === 'fav') {
      cur = (await favService.loadMore()) || []
      hasMore = favService.hasMore
      items = items.concat(cur)
      return
    }

    let times: number

    // 已关注
    if (tab === 'onlyFollow') {
      times = 8
      debug('getMinCount: addMore(restCount = %s) times=%s', restCount, times)
    }

    // 常规
    else {
      const pagesize = usePcApi(tab) ? PcRecService.PAGE_SIZE : app.PAGE_SIZE

      const multipler = anyFilterEnabled(tab)
        ? filterMultiplier // 过滤, 需要大基数
        : 1.2 // 可能有重复, so not 1.0

      times = Math.ceil((restCount * multipler) / pagesize)

      debug(
        'getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s',
        restCount,
        multipler,
        pagesize,
        times
      )
    }

    cur = usePcApi(tab)
      ? await pcRecService.getRecommendTimes(times, abortSignal)
      : await app._getRecommendTimes(times)
    cur = filterVideos(cur, tab)

    items = items.concat(cur)
    items = uniqBy(items, recItemUniqer)
  }

  await addMore(count)
  while (true) {
    // aborted
    if (abortSignal?.aborted) {
      debug('getMinCount: break for abortSignal')
      break
    }
    // no more
    if (!hasMore) {
      debug('getMinCount: break for tab=%s hasMore=false', tab)
      break
    }

    // enough
    if (items.length >= count) break
    await addMore(count - items.length)
  }

  return items
}

export async function getRecommendForHome(fetcherOptions: FetcherOptions) {
  let items = await getMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
  if (fetcherOptions.tab === 'watchlater') {
    items = items.slice(0, 20)
  }
  return items
}

export async function getRecommendForGrid(fetcherOptions: FetcherOptions) {
  return getMinCount(getColumnCount() * 3 + 1, fetcherOptions, 5) // 7 * 3-row, 1 screen
}

export async function getRecommendTimes(times: number, tab: TabType, pcRecService: PcRecService) {
  let items: RecItemType[] = usePcApi(tab)
    ? await pcRecService.getRecommendTimes(times)
    : await app._getRecommendTimes(times)
  items = filterVideos(items, tab)
  return items
}
