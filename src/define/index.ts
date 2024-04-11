import type { android } from './app-recommend.android'
import type { ipad } from './app-recommend.ipad'
import type { DmJson } from './dm'
import type { FavItemExtend } from './fav'
import type { EAppApiDevice } from './index.shared'
import { EApiType } from './index.shared'
import type { DynamicFeedItem } from './pc-dynamic-feed'
import type { PcRecItem } from './pc-recommend'
import type { PopularGeneralItem } from './popular-general'
import type { PopularWeeklyItem } from './popular-weekly'
import type { PvideoJson } from './pvideo'
import type { WatchLaterItem } from './watchlater'

export type { FavItem, FavItemExtend } from './fav'
export type { DynamicFeedItem, DynamicFeedJson } from './pc-dynamic-feed'
export type { PcRecItem, PcRecommendJson } from './pc-recommend'
export type { WatchLaterItem, WatchLaterJson } from './watchlater'
export type { DmJson, PvideoJson }

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
  api: EApiType.App
  device: EAppApiDevice.android
}

export interface IpadAppRecItemExtend extends ipad.AppRecItem {
  uniqId: string
  api: EApiType.App
  device: EAppApiDevice.ipad
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
  | PopularWeeklyItemExtend

export type RecItemExtraType = RecItemType | ItemsSeparator

export type ItemsSeparator = { uniqId: string; api: EApiType.Separator; content: ReactNode }

export interface PcRecItemExtend extends PcRecItem {
  uniqId: string
  api: EApiType.Pc
}

export interface DynamicFeedItemExtend extends DynamicFeedItem {
  uniqId: string
  api: EApiType.Dynamic
}

export interface WatchLaterItemExtend extends WatchLaterItem {
  uniqId: string
  api: EApiType.Watchlater
}

export interface PopularGeneralItemExtend extends PopularGeneralItem {
  uniqId: string
  api: EApiType.PopularGeneral
}

export interface PopularWeeklyItemExtend extends PopularWeeklyItem {
  uniqId: string
  api: EApiType.PopularWeekly
}

export function isApp(item: RecItemType): item is AppRecItemExtend {
  return item.api === EApiType.App
}
export function isPc(item: RecItemType): item is PcRecItemExtend {
  return item.api === EApiType.Pc
}
export function isDynamic(item: RecItemType): item is DynamicFeedItemExtend {
  return item.api === EApiType.Dynamic
}
export function isWatchlater(item: RecItemType): item is WatchLaterItemExtend {
  return item.api === EApiType.Watchlater
}
export function isFav(item: RecItemType): item is FavItemExtend {
  return item.api === EApiType.Fav
}
export function isPopularGeneral(item: RecItemType): item is PopularGeneralItemExtend {
  return item.api === EApiType.PopularGeneral
}
export function isPopularWeekly(item: RecItemType): item is PopularWeeklyItemExtend {
  return item.api === EApiType.PopularWeekly
}
