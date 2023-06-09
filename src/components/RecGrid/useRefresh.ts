import { TabType } from '$components/RecHeader/tab'
import { RecItemType } from '$define'
import { DynamicFeedService } from '$service-dynamic-feed'
import { PcRecService } from '$service-pc'
import { useGetState, useMemoizedFn } from 'ahooks'
import { Debugger } from 'debug'
import { useState } from 'react'

export type FetcherOptions = {
  tab: TabType
  pcRecService: PcRecService
  dynamicFeedService: DynamicFeedService
  abortSignal: AbortSignal
}

export function useRefresh({
  debug,
  tab,
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
  const [hasMore, setHasMore] = useState(true)
  const [items, setItems] = useState<RecItemType[]>([])

  const [pcRecService, setPcRecService] = useState(() => new PcRecService())
  const [dynamicFeedService, setDynamicFeedService] = useState(() => new DynamicFeedService())

  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt, getRefreshedAt] = useGetState<number>(() => Date.now())
  const [refreshFor, setRefreshFor] = useState<TabType>(tab)
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(
    () => new AbortController()
  )
  const [error, setError] = useState<any>(undefined)

  const refresh = useMemoizedFn(async () => {
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

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    const _dynamicFeedService = recreateService ? new DynamicFeedService() : dynamicFeedService
    if (recreateService) {
      setPcRecService(_pcRecService)
      setDynamicFeedService(_dynamicFeedService)
    }

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    const fetcherOptions = {
      tab,
      pcRecService: _pcRecService,
      dynamicFeedService: _dynamicFeedService,
      abortSignal: _signal,
    }

    let _items: RecItemType[] = []
    let err: any
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

    updateRefreshing(false)

    if (err) {
      console.error(err)
      setError(err)
      return
    }

    setItems(_items)
    if (tab === 'watchlater') setHasMore(false)
    await postAction?.()

    const cost = performance.now() - start
    debug('refresh(): [success] cost %s ms', cost.toFixed(0))
  })

  return {
    items,
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

    pcRecService,
    setPcRecService,
    dynamicFeedService,
    setDynamicFeedService,

    refresh,
  }
}
