import { baseDebug } from '$common'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { ETab } from '$components/RecHeader/tab-enum'
import { anyFilterEnabled, filterRecItems } from '$components/VideoCard/process/filter'
import { lookinto } from '$components/VideoCard/process/normalize'
import type { RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { uniqBy } from 'es-toolkit'
import { AppRecService } from './app'
import { DynamicFeedVideoMinDuration, DynamicFeedVideoType } from './dynamic-feed/store'
import { PcRecService } from './pc'
import { REC_TABS, getIService, type FetcherOptions } from './service-map'

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

export function concatThenUniq(
  existing: RecItemTypeOrSeparator[],
  newItems: RecItemTypeOrSeparator[],
) {
  // 对全部 uniq 是否影响性能 ?
  return uniqBy([...existing, ...newItems], recItemUniqer)
}

const usePcApi = (tab: ETab): tab is ETab.RecommendPc | ETab.KeepFollowOnly =>
  tab === ETab.RecommendPc || tab === ETab.KeepFollowOnly

async function fetchMinCount(count: number, fetcherOptions: FetcherOptions, filterMultiplier = 5) {
  const { tab, abortSignal, serviceMap } = fetcherOptions

  let items: RecItemTypeOrSeparator[] = []
  let hasMore = true

  const addMore = async (restCount: number) => {
    let cur: RecItemTypeOrSeparator[] = []

    // dynamic-feed     动态
    // watchlater       稍候再看
    // fav              收藏
    // hot              热门 (popular-general  综合热门, popular-weekly  每周必看, ranking  排行榜)
    // live             直播
    if (!REC_TABS.includes(tab)) {
      const service = getIService(serviceMap, tab)
      cur = (await service.loadMore(abortSignal)) || []
      hasMore = service.hasMore
      cur = filterRecItems(cur, tab) // filter
      items = concatThenUniq(items, cur) // concat
      return
    }

    /**
     * REC_TABS
     */

    let times: number
    if (tab === ETab.KeepFollowOnly) {
      // 已关注
      times = 8
      debug('getMinCount: addMore(restCount = %s) times=%s', restCount, times)
    } else {
      // 常规
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
      const service = serviceMap[tab]
      cur = (await service.getRecommendTimes(times, abortSignal)) || []
      hasMore = service.hasMore
    } else {
      const service = serviceMap[ETab.RecommendApp]
      cur = (await service.getRecommendTimes(times)) || []
      hasMore = service.hasMore
    }

    cur = filterRecItems(cur, tab) // filter
    items = concatThenUniq(items, cur) // concat
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
  let items = await fetchMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
  if (fetcherOptions.tab === ETab.Watchlater) {
    items = items.slice(0, 20)
  }
  return items
}

export async function refreshForGrid(fetcherOptions: FetcherOptions) {
  let minCount = getColumnCount() * 3 + 1 // 7 * 3-row, 1 screen

  // 当结果很少的, 不用等一屏
  if (fetcherOptions.tab === ETab.DynamicFeed) {
    const s = fetcherOptions.serviceMap[ETab.DynamicFeed]
    if (
      typeof s.followGroupTagId !== 'undefined' || // 选择了分组 & 分组很少更新, TODO: 考虑 merge-timeline
      // 过滤结果可能比较少
      s.searchText ||
      s.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly ||
      s.filterMinDuration !== DynamicFeedVideoMinDuration.All
    ) {
      minCount = 1
    }
  }

  return fetchMinCount(minCount, fetcherOptions, 5)
}
