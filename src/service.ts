import { filterVideos } from '$components/VideoCard/process/filter'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { settings } from '$settings'
import * as app from './service-app'
import * as pc from './service-pc'

type RecItem = PcRecItemExtend | AppRecItemExtend

async function getMinCount(count: number, pageRef: pc.PageRef) {
  let items: RecItem[] = []

  let addMore = async (times?: number) => {
    let cur: RecItem[] = settings.usePcDesktopApi
      ? await pc._getRecommendTimes(times ?? Math.ceil(count / pc.PAGE_SIZE), pageRef)
      : await app._getRecommendTimes(times ?? Math.ceil(count / app.PAGE_SIZE))
    cur = filterVideos(cur)
    items = items.concat(cur)
  }

  await addMore()
  while (items.length < count) {
    await addMore(1)
  }

  return items
}

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  let items: (PcRecItemExtend | AppRecItemExtend)[] = settings.usePcDesktopApi
    ? await pc._getRecommendTimes(times, pageRef)
    : await app._getRecommendTimes(times)
  items = filterVideos(items)
  return items
}

export async function getRecommendForHome(pageRef: pc.PageRef) {
  return getMinCount(12, pageRef) // 2 row
}

export async function getRecommendForGrid(pageRef: pc.PageRef) {
  return getMinCount(24, pageRef) // 4 row, 1 screen
}
