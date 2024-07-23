import { ETab } from '$components/RecHeader/tab-enum'
import type { IService } from '$modules/rec-services/_base'
import { DynamicFeedRecService, dynamicFeedFilterStore } from '$modules/rec-services/dynamic-feed'
import { FavRecService } from '$modules/rec-services/fav'
import { HotRecService } from '$modules/rec-services/hot'
import { LiveRecService } from '$modules/rec-services/live'
import { PcRecService } from '$modules/rec-services/pc'
import { WatchLaterRecService } from '$modules/rec-services/watchlater'
import type { OnRefreshOptions } from '../../components/RecGrid/useRefresh'
import { AppRecService } from './app'

export const REC_TABS = [ETab.KeepFollowOnly, ETab.RecommendPc, ETab.RecommendApp] satisfies ETab[]

export function isRecTab(
  tab: ETab,
): tab is ETab.RecommendApp | ETab.RecommendPc | ETab.KeepFollowOnly {
  return REC_TABS.includes(tab)
}

export const createServiceMap = {
  [ETab.RecommendApp]: () => new AppRecService(),
  [ETab.RecommendPc]: () => new PcRecService(false),
  [ETab.KeepFollowOnly]: () => new PcRecService(true),
  [ETab.DynamicFeed]: () =>
    new DynamicFeedRecService(dynamicFeedFilterStore.upMid, dynamicFeedFilterStore.searchText),
  [ETab.Watchlater]: (options) => new WatchLaterRecService(options?.watchlaterKeepOrder),
  [ETab.Fav]: () => new FavRecService(),
  [ETab.Hot]: () => new HotRecService(),
  [ETab.Live]: () => new LiveRecService(),
} satisfies Record<ETab, (options?: OnRefreshOptions) => IService>

export type ServiceMapKey = keyof typeof createServiceMap

export type ServiceMap = {
  [K in ServiceMapKey]: ReturnType<(typeof createServiceMap)[K]>
}

export function getIService(serviceMap: ServiceMap, tab: ETab): IService {
  return serviceMap[tab]
}

export type FetcherOptions = {
  tab: ETab
  abortSignal: AbortSignal
  serviceMap: ServiceMap
}
