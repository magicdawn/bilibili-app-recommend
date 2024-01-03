import { APP_KEY_PREFIX } from '$common'
import { useRefInit } from '$common/hooks/useRefInit'
import type { TabType } from '$components/RecHeader/tab.shared'
import { TabConfigMap, getCurrentSourceTab } from '$components/RecHeader/tab.shared'
import type { RecItemExtraType } from '$define'
import type { IService } from '$service/rec/base'
import { DynamicFeedRecService, dynamicFeedFilterStore } from '$service/rec/dynamic-feed'
import { FavRecService } from '$service/rec/fav'
import { PcRecService } from '$service/rec/pc'
import { PopularGeneralService } from '$service/rec/popular-general'
import { PopularWeeklyService } from '$service/rec/popular-weekly'
import { WatchLaterRecService } from '$service/rec/watchlater'
import { settings } from '$settings'
import { nextTick, whenIdle } from '$utility'
import { useGetState, useMemoizedFn } from 'ahooks'
import type { Debugger } from 'debug'
import { createContext, useContext, useEffect, useState } from 'react'

export type OnRefreshOptions = { watchlaterKeepOrder?: boolean }
export type OnRefresh = (reuse?: boolean, options?: OnRefreshOptions) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

const serviceFactories = {
  'dynamic-feed': () => new DynamicFeedRecService(dynamicFeedFilterStore.upMid),
  'watchlater': (options) => new WatchLaterRecService(options?.watchlaterKeepOrder),
  'fav': () => new FavRecService(),
  'popular-general': () => new PopularGeneralService(),
  'popular-weekly': () => new PopularWeeklyService(),
} satisfies Partial<Record<TabType, (options?: OnRefreshOptions) => IService>>

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
  fetcher: (opts: FetcherOptions) => Promise<RecItemExtraType[]>
  recreateService: boolean
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>

  setUpperRefreshing?: (val: boolean) => void
  onScrollToTop?: () => void | Promise<void>
}) {
  const tab = getCurrentSourceTab()

  const itemsCache = useRefInit<Partial<Record<TabType, RecItemExtraType[]>>>(() => ({}))
  const itemsHasCache = useRefInit<Partial<Record<TabType, boolean>>>(() => ({}))

  const [hasMore, setHasMore] = useState(true)
  const [items, setItems] = useState<RecItemExtraType[]>([])
  useEffect(() => {
    try {
      ;(unsafeWindow as any)[`${APP_KEY_PREFIX}_gridItems`] = items
    } catch (e) {
      // noop
    }
  }, [items])

  const [serviceMap, setServiceMap] = useState<ServiceMap>(() => {
    return Object.fromEntries(
      Object.entries(serviceFactories).map(([key, factory]) => [key, factory(undefined)]),
    ) as unknown as ServiceMap
  })
  const [pcRecService, setPcRecService] = useState(() => new PcRecService())

  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt, getRefreshedAt] = useGetState<number>(() => Date.now())
  const [refreshFor, setRefreshFor] = useState<TabType>(tab)
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(
    () => new AbortController(),
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

    let _items: RecItemExtraType[] = []
    let err: any
    const doFetch = async () => {
      try {
        _items = await fetcher(fetcherOptions)
      } catch (e) {
        err = e
      }
    }

    /**
     * 推荐类 tab: 使用 grid-cache, 切换 tab 不 doFetch
     *
     * 动态/稍后再看/综合热门: swr 策略
     * 即: 使用 grid-cache 保存前30项, 并重新网络请求 (recreate-service + doFetch)
     *
     * 收藏/每周必看:
     * 默认顺序: swr 策略
     * 乱序: 使用 QueueStrategy cache, 即 own cache, 切换 tab 要重 doFetch
     */

    // reuse
    const shouldReuse = reuse && !!itemsHasCache.current[tab]
    const swr =
      shouldReuse &&
      (!!TabConfigMap[tab].swr ||
        (tab === 'fav' && !serviceMap.fav.useShuffle && !settings.shuffleForFav) ||
        (tab === 'popular-weekly' &&
          !serviceMap['popular-weekly'].useShuffle &&
          !settings.shuffleForPopularWeekly))

    // all reuse case, do not show skeleton
    setSwr(shouldReuse)

    let useGridCache = true
    if ((tab === 'fav' || tab === 'popular-weekly') && !swr) {
      // use own cache
      useGridCache = false
    }

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    if (recreateService) {
      setPcRecService(_pcRecService)
    }

    const newServiceMap = { ...serviceMap }
    const recreateFor = (tab: ServiceMapKey) => {
      // @ts-ignore
      newServiceMap[tab] = serviceFactories[tab](options)
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
        if (swr) {
          recreateFor(tab)
        } else {
          serviceMap.fav.qs.restore()
        }
      } else {
        recreateFor(tab)
      }
    }
    if (tab === 'popular-general') {
      recreateFor(tab)
    }
    if (tab === 'popular-weekly') {
      if (shouldReuse) {
        if (swr) {
          recreateFor(tab)
        } else {
          serviceMap['popular-weekly'].qs.restore()
        }
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

    debug('refresh(): shouldReuse=%s swr=%s useGridCache=%s', shouldReuse, swr, useGridCache)
    if (shouldReuse) {
      if (swr) {
        _items = itemsCache.current[tab] || []
        setItems(_items)
        await doFetch()
      }
      // for 收藏/每日必看 乱序, 已经 retore, 需要 doFetch
      else if (!useGridCache) {
        itemsCache.current[tab] = []
        await doFetch()
      }
      // for 推荐类 tab
      else {
        _items = itemsCache.current[tab] || []
        // setItems(_items) // setItems will be called next
      }
    } else {
      itemsCache.current[tab] = []
      await doFetch()
    }

    // aborted, `_items` & `err` does not matter
    if (_signal.aborted) {
      debug('refresh(): [legacy] skip setItems/err for aborted, legacy tab = %s', tab)
      return
    }

    if (err) {
      updateRefreshing(false)
      console.error(err)
      setError(err)
      return
    }

    if (_items.length) {
      itemsHasCache.current[tab] = true // mark refreshed

      // if swr or possibile-swr, save list starting part only
      if (TabConfigMap[tab].swr || tab === 'fav' || tab === 'popular-weekly') {
        itemsCache.current[tab] = _items.slice(0, 30)
      } else {
        itemsCache.current[tab] = _items
      }
    }

    // update items
    await whenIdle({ timeout: 400 })
    if (_signal.aborted) {
      debug('refresh(): [legacy] skip setItems-postAction etc for aborted, legacy tab = %s', tab)
      return
    }
    setItems(_items)

    // hasMore check: only ServiceMapKey need hasMore check
    const service = getIService(newServiceMap, tab)
    if (service) setHasMore(service.hasMore)

    await nextTick() // wait setState works, if neccssary
    await postAction?.()

    const cost = performance.now() - start
    debug('refresh(): [success] cost %s ms', cost.toFixed(0))

    updateRefreshing(false)
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
