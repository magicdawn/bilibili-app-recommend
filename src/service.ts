import { settings } from '$settings'
import * as app from './service-app'
import * as pc from './service-pc'

export async function getRecommendTimes(times: number, pageRef: pc.PageRef) {
  if (settings.usePcDesktopApi) {
    return pc._getRecommendTimes(times, pageRef)
  } else {
    return app._getRecommendTimes(times)
  }
}

export async function getRecommendForHome(pageRef: pc.PageRef) {
  if (settings.usePcDesktopApi) {
    return pc._getRecommendForHome(pageRef)
  } else {
    return app._getRecommendForHome()
  }
}
