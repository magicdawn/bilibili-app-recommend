import { useRefInit } from '$common/hooks/useRefInit'
import { OnRefresh } from '$components/RecHeader'
import { TabConfigMap, TabType, getCurrentSourceTab } from '$components/RecHeader/tab'
import { RecItemType } from '$define'
import { DynamicFeedService } from '$service/dynamic-feed'
import { FavService } from '$service/fav'
import { PcRecService } from '$service/pc'
import { WatchLaterService } from '$service/watchlater'
import { useGetState, useMemoizedFn } from 'ahooks'
import { Debugger } from 'debug'
import { useState } from 'react'

export type FetcherOptions = {
  tab: TabType
  pcRecService: PcRecService
  dynamicFeedService: DynamicFeedService
  watchLaterService: WatchLaterService
  favService: FavService
  abortSignal: AbortSignal
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

  const [pcRecService, setPcRecService] = useState(() => new PcRecService())
  const [dynamicFeedService, setDynamicFeedService] = useState(() => new DynamicFeedService())
  const [watchLaterService, setWatchLaterService] = useState(() => new WatchLaterService())
  const [favService, setFavService] = useState(() => new FavService())

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
    const shouldReuse = Boolean(
      reuse && TabConfigMap[tab].reuseable !== false && itemsCache.current[tab]?.length
    )
    const swr = Boolean(shouldReuse && TabConfigMap[tab].swr)
    setSwr(swr)

    const doFetch = async () => {
      try {
        _items = await fetcher(fetcherOptions)
      } catch (e) {
        err = e
      }
    }

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    const _dynamicFeedService = recreateService ? new DynamicFeedService() : dynamicFeedService
    if (recreateService) {
      setPcRecService(_pcRecService)
      setDynamicFeedService(_dynamicFeedService)
    }

    const _watchLaterService = new WatchLaterService(options?.watchlaterKeepOrder) // always recreate
    setWatchLaterService(_watchLaterService)

    let _favServive = new FavService()
    setFavService(_favServive)

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    const fetcherOptions = {
      tab,
      pcRecService: _pcRecService,
      dynamicFeedService: _dynamicFeedService,
      watchLaterService: _watchLaterService,
      favService: _favServive,
      abortSignal: _signal,
    }

    debug('refresh(): shouldReuse=%s swr=%s', shouldReuse, swr)
    if (shouldReuse) {
      _items = itemsCache.current[tab] || []
      setItems(_items)
      if (swr) await doFetch()
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

    setItems(_items)

    // if swr, save list starting part only
    if (TabConfigMap[tab].swr) {
      itemsCache.current[tab] = _items.slice(0, 30)
    } else {
      itemsCache.current[tab] = _items
    }

    // hasMore check
    if (tab === 'dynamic') setHasMore(_dynamicFeedService.hasMore)
    if (tab === 'dynamic') setHasMore(_dynamicFeedService.hasMore)
    if (tab === 'fav') setHasMore(_favServive.hasMore)

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
    dynamicFeedService,
    watchLaterService,
    favService,

    setPcRecService,
    setDynamicFeedService,
    setWatchLaterService,
    setFavService,

    refresh,
  }
}
