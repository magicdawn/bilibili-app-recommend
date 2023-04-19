import { APP_NAME } from '$common'
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${APP_NAME}] [getMinCount]: addMore(restCount = %s)`, restCount)
    }

    const multipler = anyFilterEnabled()
      ? filterMultiplier // 过滤, 需要大基数
      : 1.2 // 可能有重复, so not 1.0
    let cur: RecItem[] = settings.usePcDesktopApi
      ? await pc._getRecommendTimes(Math.ceil((restCount / pc.PAGE_SIZE) * multipler), pageRef)
      : await app._getRecommendTimes(Math.ceil((restCount / app.PAGE_SIZE) * multipler))

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
  return getMinCount(12, pageRef, 2) // 2 row
}

export async function getRecommendForGrid(pageRef: pc.PageRef) {
  return getMinCount(18, pageRef, 5) // 3 row, 1 screen
}

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  let items: (PcRecItemExtend | AppRecItemExtend)[] = settings.usePcDesktopApi
    ? await pc._getRecommendTimes(times, pageRef)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}
