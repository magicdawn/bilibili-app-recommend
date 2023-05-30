import { baseDebug } from '$common'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { anyFilterEnabled, filterVideos } from '$components/VideoCard/process/filter'
import { RecItemType } from '$define'
import { PcDynamicFeedService } from '$service-pc-dynamic-feed'
import { settings } from '$settings'
import { hasLogined } from '$utility'
import { uniqBy } from 'lodash'
import * as app from './service-app'
import * as pc from './service-pc'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemType) =>
  item.api === 'pc'
    ? item.id
    : item.api === 'app'
    ? item.param
    : item.modules.module_dynamic.major.archive.aid

export function uniqConcat(existing: RecItemType[], newItems: RecItemType[]) {
  const ids = existing.map(recItemUniqer)
  newItems = uniqBy(newItems, recItemUniqer)
  return existing.concat(
    newItems.filter((item) => {
      return !ids.includes(recItemUniqer(item))
    })
  )
}

export const usePcApi = () => settings.usePcDesktopApi || (settings.dynamicMode && hasLogined())

export async function getMinCount(
  count: number,
  pageRef: pc.PageRef,
  pcDynamicFeedService: PcDynamicFeedService,
  filterMultiplier = 5
) {
  let items: RecItemType[] = []

  let addMore = async (restCount: number) => {
    const pagesize = settings.usePcDesktopApi ? pc.PAGE_SIZE : app.PAGE_SIZE
    const multipler = anyFilterEnabled()
      ? filterMultiplier // 过滤, 需要大基数
      : 1.2 // 可能有重复, so not 1.0
    const times = Math.ceil((restCount * multipler) / pagesize)
    debug(
      'getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s',
      restCount,
      filterMultiplier,
      pagesize,
      times
    )

    let cur: RecItemType[] = []
    if (settings.usePcDynamicApi && hasLogined()) {
      cur = (await pcDynamicFeedService.next()) || []
    } else {
      cur = usePcApi()
        ? await pc._getRecommendTimes(times, pageRef)
        : await app._getRecommendTimes(times)
      cur = filterVideos(cur)
    }

    items = items.concat(cur)
    items = uniqBy(items, recItemUniqer)
  }

  await addMore(count)
  while (items.length < count) {
    await addMore(count - items.length)
  }

  return items
}

export async function getRecommendForHome(
  pageRef: pc.PageRef,
  pcDynamicFeedService: PcDynamicFeedService
) {
  return getMinCount(getColumnCount(undefined, false) * 2, pageRef, pcDynamicFeedService, 3) // 7 * 2-row
}

export async function getRecommendForGrid(
  pageRef: pc.PageRef,
  pcDynamicFeedService: PcDynamicFeedService
) {
  return getMinCount(getColumnCount() * 3, pageRef, pcDynamicFeedService, 5) // 7 * 3-row, 1 screen
}

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  let items: RecItemType[] = usePcApi()
    ? await pc._getRecommendTimes(times, pageRef)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}
