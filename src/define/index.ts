import type { android } from './app-recommend.android'
import type { ipad } from './app-recommend.ipad'
import { DmJson } from './dm'
import type { FavItemExtend } from './fav'
import type { DynamicFeedItem } from './pc-dynamic-feed'
import type { PcRecItem } from './pc-recommend'
import type { PopularGeneralItem } from './popular-general'
import type { PopularWeeklyItem } from './popular-weekly'

export { FavItem, FavItemExtend } from './fav'
export { DynamicFeedItem, DynamicFeedJson } from './pc-dynamic-feed'
export { PcRecItem, PcRecommendJson } from './pc-recommend'
export { WatchLaterItem, WatchLaterJson } from './watchlater'
export { DmJson, PvideoJson }

import { PvideoJson } from './pvideo'
import type { WatchLaterItem } from './watchlater'
export type PvideoData = PvideoJson['data']
export type DmData = DmJson['data']

/**
 * app
 */

// export { AppRecItem, AppRecommendJson } from './app-recommend.android'

export type AndroidAppRecItem = android.AppRecItem
export type IpadAppRecItem = ipad.AppRecItem

export interface AndroidAppRecItemExtend extends AndroidAppRecItem {
  uniqId: string
  api: 'app'
  device: 'android'
}

export interface IpadAppRecItemExtend extends ipad.AppRecItem {
  uniqId: string
  api: 'app'
  device: 'ipad'
}

export type AppRecItem = AndroidAppRecItem | IpadAppRecItem
export type AppRecItemExtend = AndroidAppRecItemExtend | IpadAppRecItemExtend
export type AppRecommendJson = android.AppRecommendJson | ipad.AppRecommendJson

/**
 * ItemExtend
 */

export type RecItemType =
  | AndroidAppRecItemExtend
  | IpadAppRecItemExtend
  | PcRecItemExtend
  | DynamicFeedItemExtend
  | WatchLaterItemExtend
  | FavItemExtend
  | PopularGeneralItemExtend
// | PopularWeeklyItemExtend

export interface PcRecItemExtend extends PcRecItem {
  uniqId: string
  api: 'pc'
}

export interface DynamicFeedItemExtend extends DynamicFeedItem {
  uniqId: string
  api: 'dynamic'
}

export interface WatchLaterItemExtend extends WatchLaterItem {
  uniqId: string
  api: 'watchlater'
}

export interface PopularGeneralItemExtend extends PopularGeneralItem {
  uniqId: string
  api: 'popular-general'
}

export interface PopularWeeklyItemExtend extends PopularWeeklyItem {
  uniqId: string
  api: 'popular-weekly'
}
