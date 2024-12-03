import { useRefInit } from '$common/hooks/useRefInit'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { TabConfig } from '$components/RecHeader/tab-config'
import { ETab, type EHotSubTab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import {
  getDynamicFeedServiceConfig,
  type DynamicFeedRecService,
} from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore } from '$modules/rec-services/hot'
import { nextTick } from '$utility/dom'
import type { Debugger } from 'debug'
import { isEqual } from 'radash'
import { createContext } from 'react'
import {
  createServiceMap,
  getIService,
  isRecTab,
  type FetcherOptions,
  type ServiceMap,
  type ServiceMapKey,
} from '../../modules/rec-services/service-map'
import { setGlobalGridItems } from './unsafe-window-export'

export type OnRefreshOptions = { watchlaterKeepOrderWhenShuffle?: boolean }
export type OnRefresh = (reuse?: boolean, options?: OnRefreshOptions) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

export function useRefresh({
  debug,
  // tab,
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
    setGlobalGridItems(itemsBox.state)
  }, [itemsBox.state])

  const serviceMapBox = useRefStateBox<ServiceMap>(() => {
    return Object.fromEntries(
      Object.entries(createServiceMap).map(([key, factory]) => [key, factory(undefined)]),
    ) as unknown as ServiceMap
  })

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
        /**
         * same tab but conditions changed
         */
        let s: DynamicFeedRecService | FavRecService

        // dynamic-feed: conditions changed
        if (
          tab === ETab.DynamicFeed &&
          (s = serviceMap[ETab.DynamicFeed]) &&
          !isEqual(s.config, getDynamicFeedServiceConfig())
        ) {
          debug(
            'refresh(): [start] [refreshing] sametab(%s) but conditions change, abort existing',
            tab,
          )
          refreshAbortController.abort()
        }
        // fav: conditions changed
        else if (
          tab === ETab.Fav &&
          (s = serviceMap[ETab.Fav]) &&
          !isEqual(s.config, getFavServiceConfig())
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
     * cache 分类
     *  - swr 策略: 表示可能有更新的数据. 使用 grid-cache 保存前30项, 并重新网络请求.
     *    useGridCache = true, recreate-service = true, doFetch = true
     *  - QueueStrategy cache: 表示无更新的数据. 使用 own cache, (service.qs.restore() + doFetch)
     *
     *
     * 推荐类 tab: 使用 QueueStrategy cache
     *
     * 动态/稍后再看/综合热门: swr 策略
     *
     * 收藏/每周必看:
     * 默认顺序: swr 策略
     * 乱序: 使用 QueueStrategy cache, 即 own cache, (service.qs.restore() + doFetch)
     */

    const swrFlag = !!TabConfig[tab].swr
    const hasValidCache = swrFlag
      ? hasCache(tab)
      : (() => {
          const service = serviceMap[tab]
          if (!('qs' in service)) return false
          return service.qs.hasCache
        })()

    // reuse configs
    const shouldReuse = reuse && hasValidCache
    const swr = shouldReuse && swrFlag

    // all reuse case, do not show skeleton
    setUseSkeleton(!shouldReuse)

    const newServiceMap = { ...serviceMap }
    const recreateFor = (tab: ServiceMapKey) => {
      try {
        // @ts-ignore
        newServiceMap[tab] = createServiceMap[tab](options)
      } catch (e) {
        setError(e)
        throw e
      }
      serviceMapBox.set(newServiceMap)
    }

    // 推荐类
    if (isRecTab(tab)) {
      if (shouldReuse) {
        serviceMap[tab].qs.restore()
      } else {
        recreateFor(tab)
      }
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
    }

    debug('refresh(): shouldReuse=%s swr=%s useGridCache=%s', shouldReuse, swr, swrFlag)
    if (shouldReuse) {
      if (swr) {
        _items = getCacheFor(tab) || []
        itemsBox.set(_items)
        await doFetch()
      }
      // QueueStrategy, for 收藏/每日必看 乱序, 已经 retore, 需要 doFetch
      else {
        setCacheFor(tab, [])
        await doFetch()
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
      if (swrFlag || tab === ETab.Fav || tab === ETab.Hot) {
        setCacheFor(tab, _items.slice(0, 30))
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
  }
}
