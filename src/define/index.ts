export { AppRecommendJson, AppRecItem } from './app-recommend'
import { AppRecItem } from './app-recommend'
export interface AppRecItemExtend extends AppRecItem {
  uniqId: string
  api: 'app'
}

export { PcRecommendJson, PcRecItem } from './pc-recommend'
import { PcRecItem } from './pc-recommend'
export interface PcRecItemExtend extends PcRecItem {
  uniqId: string
  api: 'pc'
}

import { PvideoJson } from './pvideo'
type PvideoData = PvideoJson['data']
export { PvideoJson, PvideoData }

import { DmJson } from './dm'
type DmData = DmJson['data']
export { DmJson, DmData }
