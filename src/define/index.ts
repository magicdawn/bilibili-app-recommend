import { AppRecItem } from './app-recommend'
import { PcRecItem } from './pc-recommend'

export { AppRecItem, AppRecommendJson } from './app-recommend'
export { DynamicFeedItem, DynamicFeedJson } from './pc-dynamic-feed'
export { PcRecItem, PcRecommendJson } from './pc-recommend'
export { PvideoJson, PvideoData }
export { DmJson, DmData }

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

import { PvideoJson } from './pvideo'
type PvideoData = PvideoJson['data']

import { DmJson } from './dm'
import { DynamicFeedItem } from './pc-dynamic-feed'
type DmData = DmJson['data']

export type RecItemType = PcRecItemExtend | AppRecItemExtend | DynamicFeedItemExtend
