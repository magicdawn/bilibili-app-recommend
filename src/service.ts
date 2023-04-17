import { filterVideos } from '$components/VideoCard/process/filter'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { settings } from '$settings'
import * as app from './service-app'
import * as pc from './service-pc'

type RecItem = PcRecItemExtend | AppRecItemExtend

async function getMinCount(count: number, pageRef: pc.PageRef) {
  let items: RecItem[] = []

  let addMore = async (restCount: number) => {
    let cur: RecItem[] = settings.usePcDesktopApi
      ? await pc._getRecommendTimes(Math.ceil(restCount / pc.PAGE_SIZE), pageRef)
      : await app._getRecommendTimes(Math.ceil(restCount / app.PAGE_SIZE))
    cur = filterVideos(cur)
    items = items.concat(cur)
  }

  await addMore(count)
  while (items.length < count) {
    await addMore(count - items.length)
  }

  return items
}

export async function getRecommendForHome(pageRef: pc.PageRef) {
  return getMinCount(12, pageRef) // 2 row
}

export async function getRecommendForGrid(pageRef: pc.PageRef) {
  return getMinCount(18, pageRef) // 3 row, 1 screen
}

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  let items: (PcRecItemExtend | AppRecItemExtend)[] = settings.usePcDesktopApi
    ? await pc._getRecommendTimes(times, pageRef)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}
