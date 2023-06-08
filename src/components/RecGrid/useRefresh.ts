import { TabType } from '$components/RecHeader/tab'
import { RecItemType } from '$define'
import { getRecommendForGrid, getRecommendForHome } from '$service'
import { DynamicFeedService } from '$service-dynamic-feed'
import { PcRecService } from '$service-pc'
import { useGetState, useMemoizedFn } from 'ahooks'
import { Debugger } from 'debug'
import delay from 'delay'
import { useState } from 'react'

export function useRefresh({
  debug,
  tab,
  foruse,
  recreateService = true,

  onScrollToTop,
  setUpperRefreshing,
  clearActiveIndex,
  triggerScroll,
}: {
  tab: TabType
  debug: Debugger
  foruse: 'RecGrid' | 'SectionRecommend'
  recreateService?: boolean

  setUpperRefreshing?: (val: boolean) => void
  onScrollToTop?: () => void | Promise<void>
  clearActiveIndex?: () => void
  triggerScroll?: () => void
}) {
  const [items, setItems] = useState<RecItemType[]>([])
  const [loadCompleteCount, setLoadCompleteCount] = useState(0) // 已加载完成的 load call count, 类似 page

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
        debug('refresh(): [refreshing] prevent same tab(%s) refresh()', tab)
        return
      }
      // switch tab
      else {
        debug('refresh(): [refreshing] switchTab %s -> %s, abort existing', refreshFor, tab)
        refreshAbortController.abort()
      }
    } else {
      debug('refresh(): tab = %s', tab)
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

    clearActiveIndex?.() // before
    setItems([])
    setError(undefined)

    const _pcRecService = recreateService ? new PcRecService() : pcRecService
    const _dynamicFeedService = recreateService ? new DynamicFeedService() : dynamicFeedService
    if (recreateService) {
      setPcRecService(_pcRecService)
      setDynamicFeedService(_dynamicFeedService)
    }

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    await delay(50)

    const fn = foruse === 'RecGrid' ? getRecommendForGrid : getRecommendForHome
    let _items: RecItemType[] = []
    let err: any
    try {
      _items = await fn(tab, _pcRecService, _dynamicFeedService, _abortController.signal)
    } catch (e) {
      err = e
    }

    // aborted, `_items` & `err` does not matter
    if (_signal.aborted) {
      debug('refresh(): skip setItems/err for aborted, legacy tab = %s', tab)
      return
    }

    updateRefreshing(false)

    if (err) {
      console.error(err)
      setError(err)
      return
    }

    setItems(_items)
    setLoadCompleteCount(1)
    clearActiveIndex?.() // and after
    const cost = performance.now() - start
    debug('refresh cost %s ms', cost.toFixed(0))

    // check need loadMore
    triggerScroll?.()
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

    loadCompleteCount,
    setLoadCompleteCount,

    pcRecService,
    setPcRecService,
    dynamicFeedService,
    setDynamicFeedService,

    refresh,
  }
}
