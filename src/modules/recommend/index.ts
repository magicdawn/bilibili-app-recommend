/* eslint-disable no-constant-condition */
import { baseDebug } from '$common'
import { getIService, type FetcherOptions } from '$components/RecGrid/useRefresh'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { ETabType } from '$components/RecHeader/tab.shared'
import { anyFilterEnabled, filterRecItems } from '$components/VideoCard/process/filter'
import { lookinto } from '$components/VideoCard/process/normalize'
import type { RecItemExtraType } from '$define'
import { EApiType } from '$define/index.shared'
import { uniqBy } from 'lodash'
import { AppRecService } from './app'
import { PcRecService } from './pc'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemExtraType) =>
  item.api === EApiType.separator
    ? item.uniqId
    : lookinto<string | number>(item, {
        'pc': (item) => item.bvid,
        'app': (item) => item.param,
        'dynamic': (item) => item.modules.module_dynamic.major.archive.bvid,
        'watchlater': (item) => item.bvid,
        'fav': (item) => item.bvid,
        'popular-general': (item) => item.bvid,
        'popular-weekly': (item) => item.bvid,
      })

export function uniqConcat(existing: RecItemExtraType[], newItems: RecItemExtraType[]) {
  const ids = existing.map(recItemUniqer)
  newItems = uniqBy(newItems, recItemUniqer)
  return existing.concat(
    newItems.filter((item) => {
      return !ids.includes(recItemUniqer(item))
    }),
  )
}

export const usePcApi = (tab: ETabType) =>
  tab === ETabType.KeepFollowOnly || tab === ETabType.RecommendPc

export async function getMinCount(
  count: number,
  fetcherOptions: FetcherOptions,
  filterMultiplier = 5,
) {
  const { tab, abortSignal, pcRecService, serviceMap } = fetcherOptions
  const appRecService = new AppRecService()

  let items: RecItemExtraType[] = []
  let hasMore = true

  const addMore = async (restCount: number) => {
    let cur: RecItemExtraType[] = []

    // dynamic-feed     动态
    // watchlater       稍候再看
    // fav              收藏
    // popular-general  综合热门
    // popular-weekly   每周必看
    const service = getIService(serviceMap, tab)
    if (service) {
      cur = (await service.loadMore(abortSignal)) || []
      hasMore = service.hasMore
      items = items.concat(cur)
      items = uniqBy(items, recItemUniqer)
      return
    }

    let times: number

    // 已关注
    if (tab === ETabType.KeepFollowOnly) {
      times = 8
      debug('getMinCount: addMore(restCount = %s) times=%s', restCount, times)
    }

    // 常规
    else {
      const pagesize = usePcApi(tab) ? PcRecService.PAGE_SIZE : AppRecService.PAGE_SIZE

      const multipler = anyFilterEnabled(tab)
        ? filterMultiplier // 过滤, 需要大基数
        : 1.2 // 可能有重复, so not 1.0

      times = Math.ceil((restCount * multipler) / pagesize)

      debug(
        'getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s',
        restCount,
        multipler,
        pagesize,
        times,
      )
    }

    if (usePcApi(tab)) {
      cur = await pcRecService.getRecommendTimes(times, abortSignal)
      hasMore = pcRecService.hasMore
    } else {
      cur = await appRecService.getRecommendTimes(times)
      hasMore = appRecService.hasMore
    }

    cur = filterRecItems(cur, tab)
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
    const len = items.filter((x) => x.api !== EApiType.separator).length
    if (len >= count) break

    await addMore(count - items.length)
  }

  return items
}

export async function refreshForHome(fetcherOptions: FetcherOptions) {
  let items = await getMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
  if (fetcherOptions.tab === ETabType.Watchlater) {
    items = items.slice(0, 20)
  }
  return items
}

export async function refreshForGrid(fetcherOptions: FetcherOptions) {
  let minCount = getColumnCount() * 3 + 1 // 7 * 3-row, 1 screen

  if (
    fetcherOptions.tab === ETabType.DynamicFeed &&
    fetcherOptions.serviceMap[ETabType.DynamicFeed].searchText
  ) {
    minCount = 1
  }

  return getMinCount(minCount, fetcherOptions, 5)
}

export async function getRecommendTimes(times: number, tab: ETabType, pcRecService: PcRecService) {
  let items: RecItemExtraType[] = usePcApi(tab)
    ? await pcRecService.getRecommendTimes(times)
    : await new AppRecService().getRecommendTimes(times)
  items = filterRecItems(items, tab)
  return items
}
