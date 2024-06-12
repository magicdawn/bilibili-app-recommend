import { baseDebug } from '$common'
import { getIService, type FetcherOptions } from '$components/RecGrid/useRefresh'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { ETab } from '$components/RecHeader/tab-enum'
import { anyFilterEnabled, filterRecItems } from '$components/VideoCard/process/filter'
import { lookinto } from '$components/VideoCard/process/normalize'
import type { RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { uniqBy } from 'lodash'
import { AppRecService } from './app'
import { PcRecService } from './pc'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemTypeOrSeparator) =>
  item.api === EApiType.Separator
    ? item.uniqId
    : lookinto<string | number>(item, {
        [EApiType.App]: (item) => item.param,
        [EApiType.Pc]: (item) => item.bvid,
        [EApiType.Dynamic]: (item) => item.modules.module_dynamic.major.archive.bvid,
        [EApiType.Watchlater]: (item) => item.bvid,
        [EApiType.Fav]: (item) => item.bvid,
        [EApiType.PopularGeneral]: (item) => item.bvid,
        [EApiType.PopularWeekly]: (item) => item.bvid,
        [EApiType.Ranking]: (item) => item.uniqId,
        [EApiType.Live]: (item) => item.roomid,
      })

export function uniqFilter(existing: RecItemTypeOrSeparator[], newItems: RecItemTypeOrSeparator[]) {
  const ids = existing.map(recItemUniqer)
  // make self uniq
  newItems = uniqBy(newItems, recItemUniqer)
  // uniq by existing
  newItems = newItems.filter((item) => {
    return !ids.includes(recItemUniqer(item))
  })
  return newItems
}

export function uniqConcat(existing: RecItemTypeOrSeparator[], newItems: RecItemTypeOrSeparator[]) {
  return existing.concat(uniqFilter(existing, newItems))
}

export const usePcApi = (tab: ETab) => tab === ETab.KeepFollowOnly || tab === ETab.RecommendPc

export async function getMinCount(
  count: number,
  fetcherOptions: FetcherOptions,
  filterMultiplier = 5,
) {
  const { tab, abortSignal, pcRecService, serviceMap } = fetcherOptions
  const appRecService = new AppRecService()

  let items: RecItemTypeOrSeparator[] = []
  let hasMore = true

  const addMore = async (restCount: number) => {
    let cur: RecItemTypeOrSeparator[] = []

    // dynamic-feed     动态
    // watchlater       稍候再看
    // fav              收藏
    // popular-general  综合热门
    // popular-weekly   每周必看
    const service = getIService(serviceMap, tab)
    if (service) {
      cur = (await service.loadMore(abortSignal)) || []
      hasMore = service.hasMore
      cur = filterRecItems(cur, tab)
      items = items.concat(cur)
      items = uniqBy(items, recItemUniqer)
      return
    }

    let times: number

    // 已关注
    if (tab === ETab.KeepFollowOnly) {
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
    const len = items.filter((x) => x.api !== EApiType.Separator).length
    if (len >= count) break

    await addMore(count - items.length)
  }

  return items
}

export async function refreshForHome(fetcherOptions: FetcherOptions) {
  let items = await getMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
  if (fetcherOptions.tab === ETab.Watchlater) {
    items = items.slice(0, 20)
  }
  return items
}

export async function refreshForGrid(fetcherOptions: FetcherOptions) {
  let minCount = getColumnCount() * 3 + 1 // 7 * 3-row, 1 screen

  if (
    fetcherOptions.tab === ETab.DynamicFeed &&
    fetcherOptions.serviceMap[ETab.DynamicFeed].searchText
  ) {
    minCount = 1
  }

  return getMinCount(minCount, fetcherOptions, 5)
}

export async function getRecommendTimes(times: number, tab: ETab, pcRecService: PcRecService) {
  let items: RecItemTypeOrSeparator[] = usePcApi(tab)
    ? await pcRecService.getRecommendTimes(times)
    : await new AppRecService().getRecommendTimes(times)
  items = filterRecItems(items, tab)
  return items
}
