import { AppRecItem } from './app-recommend'
import { DmJson } from './dm'
import { DynamicFeedItem } from './pc-dynamic-feed'
import { PcRecItem } from './pc-recommend'

export { AppRecItem, AppRecommendJson } from './app-recommend'
export { DynamicFeedItem, DynamicFeedJson } from './pc-dynamic-feed'
export { PcRecItem, PcRecommendJson } from './pc-recommend'
export { WatchLaterItem, WatchLaterJson } from './watchlater'
export { DmJson, PvideoJson }

/**
 * *ItemExtend
 */

export type RecItemType =
  | PcRecItemExtend
  | AppRecItemExtend
  | DynamicFeedItemExtend
  | WatchLaterItemExtend

export interface AppRecItemExtend extends AppRecItem {
  uniqId: string
  api: 'app'
}

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

import { PvideoJson } from './pvideo'
import { WatchLaterItem } from './watchlater'
export type PvideoData = PvideoJson['data']
export type DmData = DmJson['data']
