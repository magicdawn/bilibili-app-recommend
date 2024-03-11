import type { ReactNode } from 'react'
import type { android } from './app-recommend.android'
import type { ipad } from './app-recommend.ipad'
import type { DmJson } from './dm'
import type { FavItemExtend } from './fav'
import type { EApiType, EAppApiDevice } from './index.shared'
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
  api: EApiType.app
  device: EAppApiDevice.android
}

export interface IpadAppRecItemExtend extends ipad.AppRecItem {
  uniqId: string
  api: EApiType.app
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

export type ItemsSeparator = { uniqId: string; api: EApiType.separator; content: ReactNode }

export interface PcRecItemExtend extends PcRecItem {
  uniqId: string
  api: EApiType.pc
}

export interface DynamicFeedItemExtend extends DynamicFeedItem {
  uniqId: string
  api: EApiType.dynamic
}

export interface WatchLaterItemExtend extends WatchLaterItem {
  uniqId: string
  api: EApiType.watchlater
}

export interface PopularGeneralItemExtend extends PopularGeneralItem {
  uniqId: string
  api: EApiType.popularGeneral
}

export interface PopularWeeklyItemExtend extends PopularWeeklyItem {
  uniqId: string
  api: EApiType.popularWeekly
}
