import { useRefInit } from '$common/hooks/useRefInit'
import type { TabType } from '$components/RecHeader/tab.shared'
import { TabConfigMap, getCurrentSourceTab } from '$components/RecHeader/tab.shared'
import type { RecItemType } from '$define'
import type { IService } from '$service/rec/base'
import { DynamicFeedRecService, dynamicFeedFilterStore } from '$service/rec/dynamic-feed'
import { FavRecService } from '$service/rec/fav'
import { PcRecService } from '$service/rec/pc'
import { PopularGeneralService } from '$service/rec/popular-general'
import { PopularWeeklyService } from '$service/rec/popular-weekly'
import { WatchLaterRecService } from '$service/rec/watchlater'
import { nextTick } from '$utility'
import { useGetState, useMemoizedFn } from 'ahooks'
import type { Debugger } from 'debug'
import { createContext, useContext, useState } from 'react'

export type OnRefreshOoptions = { watchlaterKeepOrder?: boolean }
export type OnRefresh = (reuse?: boolean, options?: OnRefreshOoptions) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

const serviceFactories = {
  'dynamic-feed': () => new DynamicFeedRecService(dynamicFeedFilterStore.upMid),
  'watchlater': () => new WatchLaterRecService(),
  'fav': () => new FavRecService(),
  'popular-general': () => new PopularGeneralService(),
  'popular-weekly': () => new PopularWeeklyService(),
} satisfies Partial<Record<TabType, () => IService>>

export type ServiceMapKey = keyof typeof serviceFactories

export type ServiceMap = {
  [K in ServiceMapKey]: ReturnType<(typeof serviceFactories)[K]>
}

export function getIService(serviceMap: ServiceMap, tab: TabType): IService | undefined {
  return serviceMap[tab as ServiceMapKey]
}

export type FetcherOptions = {
  tab: TabType
  abortSignal: AbortSignal
  serviceMap: ServiceMap
  pcRecService: PcRecService
}

export function useRefresh({
  debug,
  // tab,
  recreateService,
  fetcher,
  preAction,
  postAction,

  // RecGrid 定制
  onScrollToTop,
  setUpperRefreshing,
}: {
  tab: TabType
  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemType[]>
  recreateService: boolean
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>

  setUpperRefreshing?: (val: boolean) => void
  onScrollToTop?: () => void | Promise<void>
}) {
  const tab = getCurrentSourceTab()

  const itemsCache = useRefInit<Partial<Record<TabType, RecItemType[]>>>(() => ({}))
  const [hasMore, setHasMore] = useState(true)
  const [items, setItems] = useState<RecItemType[]>([])

  const [serviceMap, setServiceMap] = useState<ServiceMap>(() => {
    return Object.fromEntries(
      Object.entries(serviceFactories).map(([key, factory]) => [key, factory()])
    ) as unknown as ServiceMap
  })
  const [pcRecService, setPcRecService] = useState(() => new PcRecService())

  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt, getRefreshedAt] = useGetState<number>(() => Date.now())
  const [refreshFor, setRefreshFor] = useState<TabType>(tab)
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(
    () => new AbortController()
  )
  const [swr, setSwr] = useState(false)
  const [error, setError] = useState<any>(undefined)

  const refresh: OnRefresh = useMemoizedFn(async (reuse = false, options) => {
    const start = performance.now()

    // when already in refreshing
    if (refreshing) {
      // prevent same tab `refresh()`
      if (tab === refreshFor) {
        debug('refresh(): [start] [refreshing] prevent same tab(%s) refresh()', tab)
        return
      }
      // switch tab
      else {
        debug('refresh(): [start] [refreshing] switchTab %s -> %s, abort existing', refreshFor, tab)
        refreshAbortController.abort()
      }
    } else {
      debug('refresh(): [start] tab = %s', tab)
    }

    // scroll to top
    await onScrollToTop?.()

    const updateRefreshing = (val: boolean) => {
      setRefreshing(val)
      setUpperRefreshing?.(val)
    }

    updateRefreshing(true)
    setRefreshedAt(Date.now())
    setRefreshFor(tab)

    setItems([])
    setError(undefined)
    setHasMore(true)

    await preAction?.()

    let _items: RecItemType[] = []
    let err: any

    // reuse
    const shouldReuse = Boolean(reuse && itemsCache.current[tab]?.length)
    const swr = Boolean(shouldReuse && (TabConfigMap[tab].swr || tab === 'fav'))
    setSwr(swr)
    // fav is not swr, but need call FavService.loadMore
    const shouldRequestWhenReuse = shouldReuse && (swr || tab === 'fav')

    const doFetch = async () => {
      try {
        _items = await fetcher(fetcherOptions)
      } catch (e) {
        err = e
      }
    }

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    if (recreateService) {
      setPcRecService(_pcRecService)
    }

    const newServiceMap = { ...serviceMap }
    const recreateFor = (tab: ServiceMapKey) => {
      // @ts-ignore
      newServiceMap[tab] = serviceFactories[tab]()
      setServiceMap(newServiceMap)
    }

    if (tab === 'dynamic-feed') {
      recreateFor(tab)
    }
    if (tab === 'watchlater') {
      recreateFor(tab)
    }
    if (tab === 'fav') {
      if (shouldReuse) {
        serviceMap.fav.qs.restore()
      } else {
        recreateFor(tab)
      }
    }
    if (tab === 'popular-general') {
      recreateFor(tab)
    }
    if (tab === 'popular-weekly') {
      if (shouldReuse) {
        serviceMap['popular-weekly'].qs.restore()
      } else {
        recreateFor(tab)
      }
    }

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    const fetcherOptions: FetcherOptions = {
      tab,
      abortSignal: _signal,
      serviceMap: newServiceMap,
      pcRecService: _pcRecService,
    }

    debug('refresh(): shouldReuse=%s swr=%s', shouldReuse, swr)
    if (shouldReuse) {
      _items = itemsCache.current[tab] || []
      setItems(_items)
      if (shouldRequestWhenReuse) await doFetch()
    } else {
      itemsCache.current[tab] = []
      await doFetch()
    }

    // aborted, `_items` & `err` does not matter
    if (_signal.aborted) {
      debug('refresh(): [legacy] skip setItems/err for aborted, legacy tab = %s', tab)
      return
    }

    // err or not
    updateRefreshing(false)

    if (err) {
      console.error(err)
      setError(err)
      return
    }

    // update items
    await new Promise((r) => requestIdleCallback(r, { timeout: 400 }))
    if (_signal.aborted) {
      debug('refresh(): [legacy] skip setItems/err for aborted, legacy tab = %s', tab)
      return
    }
    setItems(_items)

    // if swr, save list starting part only
    if (TabConfigMap[tab].swr) {
      itemsCache.current[tab] = _items.slice(0, 30)
    } else {
      itemsCache.current[tab] = _items
    }

    // hasMore check: only ServiceMapKey need hasMore check
    const service = getIService(newServiceMap, tab)
    if (service) setHasMore(service.hasMore)

    await nextTick() // wait setState works, if neccssary
    await postAction?.()

    const cost = performance.now() - start
    debug('refresh(): [success] cost %s ms', cost.toFixed(0))
  })

  return {
    items,
    itemsCache,
    setItems,
    error,

    refreshedAt,
    setRefreshedAt,
    getRefreshedAt,

    refreshing,
    setRefreshing,

    refreshFor,
    setRefreshFor,

    refreshAbortController,
    setRefreshAbortController,

    hasMore,
    setHasMore,

    swr,
    setSwr,

    pcRecService,
    serviceMap,

    setPcRecService,
    setServiceMap,

    refresh,
  }
}
