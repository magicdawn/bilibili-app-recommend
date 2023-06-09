/* eslint-disable no-constant-condition */
import { baseDebug } from '$common'
import { FetcherOptions } from '$components/RecGrid/useRefresh'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { TabType, getCurrentSourceTab } from '$components/RecHeader/tab'
import { anyFilterEnabled, filterVideos } from '$components/VideoCard/process/filter'
import { RecItemType } from '$define'
import { WatchLaterService } from '$service-watchlater'
import { settings } from '$settings'
import { uniqBy } from 'lodash'
import * as app from './service-app'
import { PcRecService } from './service-pc'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemType) =>
  item.api === 'pc'
    ? item.id
    : item.api === 'app'
    ? item.param
    : item.api === 'dynamic'
    ? item.modules.module_dynamic.major.archive.aid
    : item.bvid

export function uniqConcat(existing: RecItemType[], newItems: RecItemType[]) {
  const ids = existing.map(recItemUniqer)
  newItems = uniqBy(newItems, recItemUniqer)
  return existing.concat(
    newItems.filter((item) => {
      return !ids.includes(recItemUniqer(item))
    })
  )
}

export const usePcApi = (tab: TabType) =>
  tab === 'onlyFollow' || (tab === 'normal' && settings.usePcDesktopApi)

export async function getMinCount(
  count: number,
  fetcherOptions: FetcherOptions,
  filterMultiplier = 5
) {
  const { pcRecService, dynamicFeedService, tab, abortSignal } = fetcherOptions

  if (tab === 'watchlater') {
    return WatchLaterService.getAll()
  }

  let items: RecItemType[] = []
  let addMore = async (restCount: number) => {
    let cur: RecItemType[] = []

    // 动态
    if (tab === 'dynamic') {
      cur = (await dynamicFeedService.loadMore(abortSignal)) || []
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

      const multipler = anyFilterEnabled()
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
    cur = filterVideos(cur)

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
    if (getCurrentSourceTab() === 'dynamic' && !dynamicFeedService.hasMore) {
      debug('getMinCount: break for dynamicFeedService.hasMore')
      break
    }
    // enpugh
    if (items.length >= count) break
    await addMore(count - items.length)
  }

  return items
}

export async function getRecommendForHome(fetcherOptions: FetcherOptions) {
  return getMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
}

export async function getRecommendForGrid(fetcherOptions: FetcherOptions) {
  return getMinCount(getColumnCount() * 3 + 1, fetcherOptions, 5) // 7 * 3-row, 1 screen
}

export async function getRecommendTimes(times: number, tab: TabType, pcRecService: PcRecService) {
  let items: RecItemType[] = usePcApi(tab)
    ? await pcRecService.getRecommendTimes(times)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}
