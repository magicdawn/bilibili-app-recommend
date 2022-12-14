export { RecommendJson, RecItem } from './recommend'
import { RecItem } from './recommend'
export interface RecItemWithUniqId extends RecItem {
  uniqId: string
}

import { PvideoJson } from './pvideo'
type PvideoData = PvideoJson['data']
export { PvideoJson, PvideoData }

import { DmJson } from './dm'
type DmData = DmJson['data']
export { DmJson, DmData }

export { PcRecommendJson, PcRecItem } from './pc-recommend'
import { PcRecItem } from './pc-recommend'
export interface PcRecItemWithUniqId extends PcRecItem {
  uniqId: string
}
