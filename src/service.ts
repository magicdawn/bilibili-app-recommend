import { APP_NAME } from '$common'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { anyFilterEnabled, filterVideos } from '$components/VideoCard/process/filter'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { settings } from '$settings'
import { uniqBy } from 'lodash'
import * as app from './service-app'
import * as pc from './service-pc'

export type RecItem = PcRecItemExtend | AppRecItemExtend

export const recItemUniqer = (item: RecItem) => (item.api === 'pc' ? item.id : item.param)

export function uniqConcat(existing: RecItem[], newItems: RecItem[]) {
  const ids = existing.map(recItemUniqer)
  newItems = uniqBy(newItems, recItemUniqer)
  return existing.concat(
    newItems.filter((item) => {
      return !ids.includes(recItemUniqer(item))
    })
  )
}

async function getMinCount(count: number, pageRef: pc.PageRef, filterMultiplier) {
  let items: RecItem[] = []

  let addMore = async (restCount: number) => {
    const pagesize = settings.usePcDesktopApi ? pc.PAGE_SIZE : app.PAGE_SIZE

    const multipler = anyFilterEnabled()
      ? filterMultiplier // 过滤, 需要大基数
      : 1.2 // 可能有重复, so not 1.0

    const times = Math.ceil((restCount * multipler) / pagesize)

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${APP_NAME}] [getMinCount]: addMore(restCount = %s) multipler=%s pagesize=%s times=%s`,
        restCount,
        filterMultiplier,
        pagesize,
        times
      )
    }

    let cur: RecItem[] = settings.usePcDesktopApi
      ? await pc._getRecommendTimes(times, pageRef)
      : await app._getRecommendTimes(times)

    cur = filterVideos(cur)
    items = items.concat(cur)
    items = uniqBy(items, recItemUniqer)
  }

  await addMore(count)
  while (items.length < count) {
    await addMore(count - items.length)
  }

  return items
}

export async function getRecommendForHome(pageRef: pc.PageRef) {
  return getMinCount(getColumnCount() * 2, pageRef, 3) // 7 * 2-row
}

export async function getRecommendForGrid(pageRef: pc.PageRef) {
  return getMinCount(getColumnCount() * 3, pageRef, 5) // 7 * 3-row, 1 screen
}

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  let items: (PcRecItemExtend | AppRecItemExtend)[] = settings.usePcDesktopApi
    ? await pc._getRecommendTimes(times, pageRef)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}
