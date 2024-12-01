import type { OnRefreshOptions } from '$components/RecGrid/useRefresh'
import { ETab } from '$components/RecHeader/tab-enum'
import type { IService } from './_base'
import { AppRecService } from './app'
import { DynamicFeedRecService, getDynamicFeedServiceConfig } from './dynamic-feed'
import { FavRecService, getFavServiceConfig } from './fav'
import { HotRecService } from './hot'
import { LiveRecService } from './live'
import { PcRecService } from './pc'
import { WatchLaterRecService } from './watchlater'

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
  [ETab.DynamicFeed]: () => new DynamicFeedRecService(getDynamicFeedServiceConfig()),
  [ETab.Watchlater]: (options) => new WatchLaterRecService(options?.watchlaterKeepOrderWhenShuffle),
  [ETab.Fav]: () => new FavRecService(getFavServiceConfig()),
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
