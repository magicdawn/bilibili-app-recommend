import { APP_KEY_PREFIX } from '$common'
import { useRefInit } from '$common/hooks/useRefInit'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { TabConfig } from '$components/RecHeader/tab-config'
import { type EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import type { IService } from '$modules/rec-services/_base'
import { DynamicFeedRecService, dynamicFeedFilterStore } from '$modules/rec-services/dynamic-feed'
import { FavRecService } from '$modules/rec-services/fav'
import { HotRecService, hotStore } from '$modules/rec-services/hot'
import { LiveRecService } from '$modules/rec-services/live'
import { PcRecService } from '$modules/rec-services/pc'
import { WatchLaterRecService } from '$modules/rec-services/watchlater'
import { nextTick } from '$utility'
import type { Debugger } from 'debug'
import { tryit } from 'radash'
import { createContext } from 'react'

export type OnRefreshOptions = { watchlaterKeepOrder?: boolean }
export type OnRefresh = (reuse?: boolean, options?: OnRefreshOptions) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

const createServiceMap = {
  [ETab.DynamicFeed]: () =>
    new DynamicFeedRecService(dynamicFeedFilterStore.upMid, dynamicFeedFilterStore.searchText),
  [ETab.Watchlater]: (options) => new WatchLaterRecService(options?.watchlaterKeepOrder),
  [ETab.Fav]: () => new FavRecService(),
  [ETab.Hot]: () => new HotRecService(),
  [ETab.Live]: () => new LiveRecService(),
} satisfies Partial<Record<ETab, (options?: OnRefreshOptions) => IService>>

export type ServiceMapKey = keyof typeof createServiceMap

export type ServiceMap = {
  [K in ServiceMapKey]: ReturnType<(typeof createServiceMap)[K]>
}

export function getIService(serviceMap: ServiceMap, tab: ETab): IService | undefined {
  return serviceMap[tab as ServiceMapKey]
}

export type FetcherOptions = {
  tab: ETab
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
  updateExtraInfo,

  // RecGrid 定制
  onScrollToTop,
  setUpperRefreshing,
}: {
  tab: ETab
  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemTypeOrSeparator[]>
  recreateService: boolean

  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
  updateExtraInfo?: (tab: ETab) => void

  setUpperRefreshing?: (val: boolean) => void
  onScrollToTop?: () => void | Promise<void>
}) {
  const tab = useCurrentUsingTab()

  /**
   * cache
   */
  const itemsCache = useRefInit<
    Partial<Record<Exclude<ETab, ETab.Hot> | EHotSubTab, RecItemTypeOrSeparator[]>>
  >(() => ({}))
  const getCacheFor = useMemoizedFn((tab: ETab) => {
    const cache = itemsCache.current
    if (tab === ETab.Hot) {
      return cache[hotStore.subtab]
    } else {
      return cache[tab]
    }
  })
  const setCacheFor = useMemoizedFn((tab: ETab, items: RecItemTypeOrSeparator[]) => {
    const cache = itemsCache.current
    if (tab === ETab.Hot) {
      cache[hotStore.subtab] = items
    } else {
      cache[tab] = items
    }
  })
  const hasCache = useMemoizedFn((tab: ETab) => {
    return !!getCacheFor(tab)?.length
  })

  const hasMoreBox = useRefStateBox(true)
  const itemsBox = useRefStateBox<RecItemTypeOrSeparator[]>([])
  useEffect(() => {
    tryit(() => {
      ;(unsafeWindow as any)[`${APP_KEY_PREFIX}_gridItems`] = itemsBox.state
    })()
  }, [itemsBox.state])

  const serviceMapBox = useRefStateBox<ServiceMap>(() => {
    return Object.fromEntries(
      Object.entries(createServiceMap).map(([key, factory]) => [key, factory(undefined)]),
    ) as unknown as ServiceMap
  })
  const [pcRecService, setPcRecService] = useState(() => new PcRecService())

  const refreshingBox = useRefStateBox(false)
  const refreshTsBox = useRefStateBox<number>(() => Date.now())
  const [refreshFor, setRefreshFor] = useState<ETab>(tab)
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(
    () => new AbortController(),
  )
  const [useSkeleton, setUseSkeleton] = useState(false)
  const [error, setError] = useState<any>(undefined)

  const refresh: OnRefresh = useMemoizedFn(async (reuse = false, options) => {
    const start = performance.now()

    const refreshing = refreshingBox.val
    const serviceMap = serviceMapBox.val

    // when already in refreshing
    if (refreshing) {
      // same tab
      if (tab === refreshFor) {
        // same tab but conditions changed
        if (
          tab === ETab.DynamicFeed &&
          serviceMap[ETab.DynamicFeed].searchText !== dynamicFeedFilterStore.searchText
        ) {
          debug(
            'refresh(): [start] [refreshing] sametab(%s) but conditions change, abort existing',
            tab,
          )
          refreshAbortController.abort()
        }

        // has sub-tabs
        else if (tab === ETab.Hot && serviceMap[ETab.Hot].subtab !== hotStore.subtab) {
          debug(
            'refresh(): [start] [refreshing] sametab(%s) but subtab changed, abort existing',
            tab,
          )
          refreshAbortController.abort()
        }

        // prevent same tab `refresh()`
        else {
          debug('refresh(): [start] [refreshing] prevent same tab(%s) refresh()', tab)
          return
        }
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

    // reuse configs
    const shouldReuse = reuse && hasCache(tab)
    const swr = shouldReuse && !!TabConfig[tab].swr

    // all reuse case, do not show skeleton
    setUseSkeleton(!shouldReuse)

    const updateRefreshing = (val: boolean) => {
      refreshingBox.set(val)
      setUpperRefreshing?.(val)
    }
    updateRefreshing(true)
    refreshTsBox.set(Date.now())
    setRefreshFor(tab)

    setError(undefined)
    itemsBox.set([])
    hasMoreBox.set(true)

    await preAction?.()

    let _items: RecItemTypeOrSeparator[] = []
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

    let useGridCache = true
    // conditional swr and disabled (for shuffle case), use own cache
    if (TabConfig[tab].swr === false) {
      useGridCache = false
    }

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    if (recreateService) {
      setPcRecService(_pcRecService)
    }

    const newServiceMap = { ...serviceMap }
    const recreateFor = (tab: ServiceMapKey) => {
      // @ts-ignore
      newServiceMap[tab] = createServiceMap[tab](options)
      serviceMapBox.set(newServiceMap)
    }

    if (tab === ETab.DynamicFeed || tab === ETab.Watchlater || tab === ETab.Live) {
      recreateFor(tab)
    }

    if (tab === ETab.Fav) {
      if (shouldReuse) {
        if (swr) {
          recreateFor(tab)
        } else {
          serviceMap[tab].qs.restore()
        }
      } else {
        recreateFor(tab)
      }
    }

    if (tab === ETab.Hot) {
      if (shouldReuse) {
        if (swr) {
          recreateFor(tab)
        } else {
          const hotInnerService = serviceMap[tab].service
          ;(hotInnerService as any).qs?.restore()
        }
      } else {
        recreateFor(tab)
      }
      updateExtraInfo?.(tab)
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
        _items = getCacheFor(tab) || []
        itemsBox.set(_items)
        await doFetch()
      }
      // for 收藏/每日必看 乱序, 已经 retore, 需要 doFetch
      else if (!useGridCache) {
        setCacheFor(tab, [])
        await doFetch()
      }
      // for 推荐类 tab
      else {
        _items = getCacheFor(tab) || []
        // setItems(_items) // setItems will be called next
      }
    } else {
      setCacheFor(tab, [])
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
      // if swr or possibile-swr, save list starting part only
      if (TabConfig[tab].swr || tab === ETab.Fav || tab === ETab.Hot) {
        setCacheFor(tab, _items.slice(0, 30))
      } else {
        setCacheFor(tab, _items)
      }
    }

    // update items
    if (_signal.aborted) {
      debug('refresh(): [legacy] skip setItems-postAction etc for aborted, legacy tab = %s', tab)
      return
    }
    itemsBox.set(_items)

    // hasMore check: only ServiceMapKey need hasMore check
    const service = getIService(newServiceMap, tab)
    if (service) hasMoreBox.set(service.hasMore)

    updateRefreshing(false)
    await nextTick() // wait setState works, if neccssary

    await postAction?.()

    const cost = performance.now() - start
    debug('refresh(): [success] cost %s ms', cost.toFixed(0))
  })

  return {
    itemsBox,
    error,

    refresh,
    hasMoreBox,
    refreshingBox,
    refreshTsBox,
    refreshAbortController,

    useSkeleton,
    serviceMapBox,
    pcRecService,
  }
}
