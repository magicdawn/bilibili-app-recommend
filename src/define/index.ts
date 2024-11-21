import type { CategorySlug, CategoryType } from '$modules/rec-services/hot/ranking/category'
import type { RankingItem } from '$modules/rec-services/hot/ranking/types'
import type { LiveItem } from '$modules/rec-services/live/types/list-live'
import type { FavItemExtend } from '../modules/rec-services/fav/types'
import type { WatchlaterItem } from '../modules/rec-services/watchlater/types'
import type { android } from './app-recommend.android'
import type { ipad } from './app-recommend.ipad'
import type { DmJson } from './dm'
import type { EAppApiDevice } from './index.shared'
import { EApiType } from './index.shared'
import type { DynamicFeedItem } from './pc-dynamic-feed'
import type { PcRecItem } from './pc-recommend'
import type { PopularGeneralItem } from './popular-general'
import type { PopularWeeklyItem } from './popular-weekly'
import type { PvideoJson } from './pvideo'

export type { FavItem, FavItemExtend } from '$modules/rec-services/fav/types'
export type { WatchlaterItem, WatchlaterJson } from '../modules/rec-services/watchlater/types'
export type { DynamicFeedItem, DynamicFeedJson } from './pc-dynamic-feed'
export type { PcRecItem, PcRecommendJson } from './pc-recommend'
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
  | RankingItemExtend
  | LiveItemExtend

export type RecItemTypeOrSeparator = RecItemType | ItemsSeparator

export type ItemsSeparator = { uniqId: string; api: EApiType.Separator; content: ReactNode }

export type PcRecItemExtend = PcRecItem & {
  uniqId: string
  api: EApiType.Pc
}

export type DynamicFeedItemExtend = DynamicFeedItem & {
  uniqId: string
  api: EApiType.Dynamic
}

export type WatchLaterItemExtend = WatchlaterItem & {
  uniqId: string
  api: EApiType.Watchlater
}

export type PopularGeneralItemExtend = PopularGeneralItem & {
  uniqId: string
  api: EApiType.PopularGeneral
}

export type PopularWeeklyItemExtend = PopularWeeklyItem & {
  uniqId: string
  api: EApiType.PopularWeekly
}

export type RankingItemExtendProps = {
  uniqId: string
  api: EApiType.Ranking
  rankingNo: number
  slug: CategorySlug
  categoryType: CategoryType
}
export type RankingItemExtend = RankingItem & RankingItemExtendProps

export type LiveItemExtend = LiveItem & {
  uniqId: string
  api: EApiType.Live
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
export function isRanking(item: RecItemType): item is RankingItemExtend {
  return item.api === EApiType.Ranking
}
export function isLive(item: RecItemType): item is LiveItemExtend {
  return item.api === EApiType.Live
}
