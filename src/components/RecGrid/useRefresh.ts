import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import { TabConfig } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import {
  getDynamicFeedServiceConfig,
  type DynamicFeedRecService,
} from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import { useUnmount } from 'ahooks'
import type { Debugger } from 'debug'
import { invariant } from 'es-toolkit'
import { isEqual } from 'radash'
import { createContext } from 'react'
import {
  createServiceMap,
  type FetcherOptions,
  type ServiceMap,
} from '../../modules/rec-services/service-map'
import { setGlobalGridItems } from './unsafe-window-export'

export type OnRefreshOptions = { watchlaterKeepOrderWhenShuffle?: boolean }
export type OnRefresh = (reuse?: boolean, options?: OnRefreshOptions) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

export function useRefresh({
  tab,
  existingServices,

  debug,
  fetcher,

  preAction,
  postAction,
  updateExtraInfo,

  // RecGrid 定制
  onScrollToTop,
  setUpperRefreshing,
}: {
  tab: ETab
  existingServices: RefStateBox<Partial<ServiceMap>>

  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemTypeOrSeparator[]>

  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
  updateExtraInfo?: (tab: ETab) => void
  setUpperRefreshing?: (val: boolean) => void
  onScrollToTop?: () => void | Promise<void>
}) {
  const hasMoreBox = useRefStateBox(true)
  const itemsBox = useRefStateBox<RecItemTypeOrSeparator[]>([])
  useEffect(() => {
    setGlobalGridItems(itemsBox.state)
  }, [itemsBox.state])

  const refreshingBox = useRefStateBox(false)
  const refreshTsBox = useRefStateBox<number>(() => Date.now())
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(
    () => new AbortController(),
  )
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [error, setError] = useState<any>(undefined)

  const [beforeMount, setBeforeMount] = useState(true)

  useMount(() => {
    setBeforeMount(false)
    refresh(true)
  })

  // switch away
  useUnmount(() => {
    debug('useRefresh(): tab=%s unmount, abort refresh requests', tab)
    refreshAbortController.abort()
  })

  const refresh: OnRefresh = useMemoizedFn(async (reuse = false, options) => {
    const start = performance.now()
    await using stack = new AsyncDisposableStack()
    const serviceMap = existingServices.val
    const refreshing = refreshingBox.val

    // when already in refreshing
    if (refreshing) {
      /**
       * same tab but conditions changed
       */
      let s: DynamicFeedRecService | FavRecService | HotRecService | undefined

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
      else if (tab === ETab.Hot && (s = serviceMap[ETab.Hot]) && s.subtab !== hotStore.subtab) {
        debug('refresh(): [start] [refreshing] sametab(%s) but subtab changed, abort existing', tab)
        refreshAbortController.abort()
      }

      // prevent same tab `refresh()`
      else {
        debug('refresh(): [start] [refreshing] prevent same tab(%s) refresh()', tab)
        return
      }
    } else {
      debug('refresh(): [start] tab = %s', tab)
    }

    const updateRefreshing = (val: boolean) => {
      refreshingBox.set(val)
      setUpperRefreshing?.(val)
    }

    // refresh state
    refreshTsBox.set(Date.now())
    updateRefreshing(true)
    // refresh result
    setError(undefined)
    // itemsBox.set([])
    hasMoreBox.set(true)
    // defer actions
    stack.defer(() => {
      // refreshing
      updateRefreshing(false)
      // hasMore
      const service = existingServices.val[tab]
      invariant(service, `service should not be nil`)
      hasMoreBox.set(service.hasMore)
    })

    // TODO: move into preAction
    await onScrollToTop?.() // scroll to top
    await preAction?.()

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    let _items: RecItemTypeOrSeparator[] = []
    let err: any
    const doFetch = async () => {
      const fetcherOptions: FetcherOptions = {
        tab,
        abortSignal: _signal,
        serviceMap: existingServices.val,
      }
      try {
        _items = await fetcher(fetcherOptions)
      } catch (e) {
        err = e
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
      // update items
      if (_signal.aborted) {
        debug('refresh(): [legacy] skip setItems-postAction etc for aborted, legacy tab = %s', tab)
        return
      }

      itemsBox.set(_items)
      return true // mark go next
    }

    const existingService = reuse ? existingServices.val[tab] : undefined
    let refresh: boolean
    // reuse existing service
    if (existingService) {
      existingService.restore()
      itemsBox.set(existingService.qs.bufferQueue.slice(0, 30))
      const next = await doFetch()
      const swrFlag = !!TabConfig[tab].swr
      refresh = !!next && swrFlag
    }
    // create new service
    else {
      setShowSkeleton(true)
      stack.defer(() => {
        setShowSkeleton(false)
      })
      refresh = true
    }

    if (refresh) {
      const service = createServiceMap[tab](options)
      existingServices.set({ ...existingServices.val, [tab]: service })
      await doFetch()
    }

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
    showSkeleton,
    beforeMount,
  }
}
