/**
 * 推荐内容, 无限滚动
 */

import { APP_CLS_CARD, APP_CLS_CARD_ACTIVE, APP_CLS_GRID, baseDebug } from '$common'
import { useRefState } from '$common/hooks/useRefState'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { borderColorValue, colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { VideoCard } from '$components/VideoCard'
import {
  borderRadiusValue,
  type VideoCardEmitter,
  type VideoCardEvents,
} from '$components/VideoCard/index.shared'
import { filterRecItems } from '$components/VideoCard/process/filter'
import type { IVideoCardData } from '$components/VideoCard/process/normalize'
import { type RecItemType, type RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { $headerHeight } from '$header'
import { OpenExternalLinkIcon } from '$modules/icon'
import { IconPark } from '$modules/icon/icon-park'
import { getRecommendTimes, refreshForGrid, uniqConcat } from '$modules/rec-services'
import { hotStore } from '$modules/rec-services/hot'
import { useSettingsSnapshot } from '$modules/settings'
import { isSafari } from '$platform'
import { AntdMessage } from '$utility'
import type { TheCssType } from '$utility/type'
import { useEventListener, useLatest } from 'ahooks'
import { Divider } from 'antd'
import delay from 'delay'
import mitt from 'mitt'
import ms from 'ms'
import { useInView } from 'react-intersection-observer'
import {
  narrowMode,
  newCardStyle,
  videoGrid,
  videoGridBiliFeed4,
  videoGridContainer,
  videoGridCustom,
} from '../video-grid.module.scss'
import type { OnRefresh } from './useRefresh'
import { getIService, useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'

const debug = baseDebug.extend('components:RecGrid')

const ENABLE_VIRTUAL_GRID = false

export type RecGridRef = {
  refresh: OnRefresh
}

export type RecGridProps = {
  shortcutEnabled: boolean
  infiteScrollUseWindow: boolean
  onScrollToTop?: () => void | Promise<void>
  className?: string
  scrollerRef?: RefObject<HTMLElement | null>
  setRefreshing: (val: boolean) => void
  setExtraInfo?: (n?: ReactNode) => void
}

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(function RecGrid(
  {
    infiteScrollUseWindow,
    shortcutEnabled,
    onScrollToTop,
    className,
    scrollerRef,
    setRefreshing: setUpperRefreshing,
    setExtraInfo,
  },
  ref,
) {
  const tab = useCurrentUsingTab()

  const [loadCompleteCount, setLoadCompleteCount, getLoadCompleteCount] = useRefState(0) // 已加载完成的 load call count, 类似 page

  // before refresh
  const preAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateExtraInfo(tab)
  })

  // after refresh, setItems
  const postAction = useMemoizedFn(() => {
    clearActiveIndex()
    setLoadCompleteCount(1)
    updateExtraInfo(tab)
    // check need loadMore
    setTimeout(checkShouldLoadMore)
  })

  const updateExtraInfo = useMemoizedFn((tab: ETab) => {
    const info = getIService(getServiceMap(), tab)?.usageInfo ?? null
    setExtraInfo?.(info)
  })

  const {
    refresh,

    items,
    setItems,
    getItems,
    error: refreshError,

    refreshing,
    getRefreshing,
    refreshedAt,
    getRefreshedAt,
    useSkeleton,

    hasMore,
    setHasMore,
    getHasMore,

    refreshAbortController,
    pcRecService,
    serviceMap,
    getServiceMap,
  } = useRefresh({
    tab,
    debug,
    fetcher: refreshForGrid,
    recreateService: true,

    preAction,
    postAction,
    updateExtraInfo,

    onScrollToTop,
    setUpperRefreshing,
  })

  useMount(refresh)
  useImperativeHandle(ref, () => ({ refresh }), [])

  const goOutAt = useRef<number | undefined>()
  useEventListener(
    'visibilitychange',
    (e) => {
      const visible = document.visibilityState === 'visible'
      if (!visible) {
        goOutAt.current = Date.now()
        return
      }

      if (refreshing) return
      if (loadMoreRequesting.current[refreshedAt]) return

      // 场景
      // 当前 Tab: 稍后再看, 点视频进去, 在视频页移除了, 关闭视频页, 回到首页
      if (tab === ETab.Watchlater && goOutAt.current && Date.now() - goOutAt.current > ms('1h')) {
        refresh(true, { watchlaterKeepOrder: true })
      }
    },
    { target: document },
  )

  const checkShouldLoadMore = useMemoizedFn(async () => {
    // always async, `footerInViewRef` depends on `__footerInView` state
    await delay(isSafari ? 100 : 0)

    debug('checkShouldLoadMore(): footerInView = %s', footerInViewRef.current)
    if (footerInViewRef.current) {
      loadMore()
    }
  })

  const loadMoreRequesting = useRef<Record<number, boolean>>({})

  // 在 refresh & loadMore 都有可能更改的 state, 需要 useRefState

  const loadMore = useMemoizedFn(async () => {
    if (!getHasMore()) return
    if (getRefreshing()) return

    const _refreshedAt = refreshedAt
    if (loadMoreRequesting.current[_refreshedAt]) return
    loadMoreRequesting.current = { [_refreshedAt]: true }

    let newItems = getItems()
    let newHasMore = true
    try {
      const service = getIService(serviceMap, tab)
      if (service) {
        let more = (await service.loadMore(refreshAbortController.signal)) || []
        more = filterRecItems(more, tab)
        newItems = uniqConcat(newItems, more)
        newHasMore = service.hasMore
      }
      // others
      else {
        // loadMore 至少 load 一项, 需要触发 InfiniteScroll.componentDidUpdate
        while (!(newItems.length > items.length)) {
          // keep-follow-only 需要大基数
          const times = tab === ETab.KeepFollowOnly ? 5 : 2
          const more = await getRecommendTimes(times, tab, pcRecService)
          newItems = uniqConcat(newItems, more)
        }
      }
    } catch (e) {
      loadMoreRequesting.current[_refreshedAt] = false
      throw e
    }

    // loadMore 发出请求了, 但稍候重新刷新了, setItems 后续操作应该 abort
    if (_refreshedAt !== getRefreshedAt()) {
      debug(
        'loadMore: skip update for mismatch refreshedAt, %s != %s',
        _refreshedAt,
        getRefreshedAt(),
      )
      return
    }

    debug(
      'loadMore: seq(%s) len %s -> %s',
      getLoadCompleteCount() + 1,
      items.length,
      newItems.length,
    )
    setHasMore(newHasMore)
    setItems(newItems)
    setLoadCompleteCount((c) => c + 1)
    loadMoreRequesting.current[_refreshedAt] = false

    // check
    checkShouldLoadMore()
  })

  // 渲染使用的 items
  const usingItems = items

  /**
   * filter fetched items
   */

  // const { hasSelectedUp, searchText } = useSnapshot(dynamicFeedFilterStore)
  // usingItems = useMemo(() => {
  //   if (tab !== ETabType.DynamicFeed) return items
  //   if (!hasSelectedUp || !searchText) return items
  //   return items.filter((item) => {
  //     if (item.api !== EApiType.dynamic) return true
  //     const title = item.modules.module_dynamic.major.archive.title || ''
  //     return title.includes(searchText)
  //   })
  // }, [usingItems, tab, hasSelectedUp, searchText])

  // .video-grid
  const containerRef = useRef<HTMLDivElement>(null)

  const getScrollerRect = useMemoizedFn(() => {
    // use window
    if (infiteScrollUseWindow) {
      const yStart = $headerHeight.get() + 50 // 50 RecHeader height
      return new DOMRect(0, yStart, window.innerWidth, window.innerHeight - yStart)
    }
    // use in a scroller
    else {
      return scrollerRef?.current?.getBoundingClientRect()
    }
  })

  // 不喜欢弹窗
  const modalDislikeVisible = useModalDislikeVisible()

  const usingVideoItems = useMemo(() => {
    return items.filter((x) => x.api !== EApiType.Separator)
  }, [usingItems])

  // emitters
  const emitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshedAt])
  const videoCardEmitters = useMemo(() => {
    return usingVideoItems.map(({ uniqId }) => {
      const cacheKey = uniqId
      return (
        emitterCache.get(cacheKey) ||
        (() => {
          const instance = mitt<VideoCardEvents>()
          emitterCache.set(cacheKey, instance)
          return instance
        })()
      )
    })
  }, [usingVideoItems])

  useEffect(() => {
    const broadcastMouseEnter = (srcUniqId: string) => {
      // broadcast
      videoCardEmitters.forEach((emitter) => {
        emitter.emit('mouseenter-other-card', srcUniqId)
      })
    }
    videoCardEmitters.forEach((emitter) => {
      emitter.on('mouseenter', broadcastMouseEnter)
    })
    return () => {
      videoCardEmitters.forEach((emitter) => {
        emitter.off('mouseenter')
      })
    }
  }, [videoCardEmitters])

  // 快捷键
  const { activeIndex, clearActiveIndex } = useShortcut({
    enabled: shortcutEnabled && !modalDislikeVisible,
    refresh,
    maxIndex: usingVideoItems.length - 1,
    containerRef,
    getScrollerRect,
    videoCardEmitters,
    changeScrollY: infiteScrollUseWindow
      ? function ({ offset, absolute }) {
          const scroller = document.documentElement
          if (typeof offset === 'number') {
            scroller.scrollTop += offset
            return
          }
          if (typeof absolute === 'number') {
            scroller.scrollTop = absolute
            return
          }
        }
      : undefined,
  })

  /**
   * card state change
   */

  const handleRemoveCard = useMemoizedFn((item: RecItemType, data: IVideoCardData) => {
    setItems((items) => {
      const index = items.findIndex((x) => x.uniqId === item.uniqId)
      if (index === -1) return items

      const newItems = items.slice()
      newItems.splice(index, 1)
      AntdMessage.success(`已移除: ${data.title}`, 4)

      if (tab === ETab.Watchlater) {
        serviceMap[tab].count--
        updateExtraInfo(tab)
      }
      if (tab === ETab.Fav) {
        serviceMap[tab].total--
        updateExtraInfo(tab)
      }

      return newItems
    })
  })
  const handleMoveCardToFirst = useMemoizedFn((item: RecItemType, data: IVideoCardData) => {
    setItems((items) => {
      const currentItem = items.find((x) => x.uniqId === item.uniqId)
      if (!currentItem) return items
      const index = items.indexOf(currentItem)

      const newItems = items.slice()
      // rm
      newItems.splice(index, 1)
      // insert
      const newIndex = newItems.findIndex((x) => x.api !== EApiType.Separator)
      newItems.splice(newIndex, 0, currentItem)

      return newItems
    })
  })

  /**
   * footer for infinite scroll
   */
  const { ref: footerRef, inView: __footerInView } = useInView({
    root: infiteScrollUseWindow ? null : scrollerRef?.current || null,
    rootMargin: `0px 0px ${window.innerHeight}px 0px`,
    onChange(inView) {
      if (inView) {
        debug('footerInView change to visible', inView)
        setTimeout(checkShouldLoadMore)
      }
    },
  })
  const footerInViewRef = useLatest(__footerInView)
  const footer = (
    <div
      ref={footerRef}
      css={css`
        padding: 30px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 120%;
      `}
    >
      {!refreshing && (
        <>
          {hasMore ? (
            <>
              <IconPark
                name='Loading'
                fill={colorPrimaryValue}
                spin
                size={40}
                style={{ marginRight: 10 }}
              />
              加载中~
            </>
          ) : (
            '没有更多了~'
          )}
        </>
      )}
    </div>
  )

  const { useNarrowMode, styleUseCustomGrid, styleUseCardBorder, styleUseCardBorderOnlyOnHover } =
    useSettingsSnapshot()
  const gridClassName = clsx(
    APP_CLS_GRID, // for customize css
    videoGrid,
    newCardStyle,
    styleUseCustomGrid ? videoGridCustom : videoGridBiliFeed4,
    useNarrowMode && narrowMode, // 居中
    className,
  )

  if (refreshError) {
    console.error(refreshError.stack || refreshError)
    return (
      <div
        css={css`
          font-size: 20px;
          padding: 20px;
          text-align: center;
        `}
      >
        <p>出错了, 请刷新重试!</p>
        {tab === ETab.Hot && hotStore.subtab === EHotSubTab.PopularWeekly && (
          <p className='mt-8px flex items-center justify-center'>
            可能需手动输入验证码
            <OpenExternalLinkIcon className='ml-3' />
            <a href='https://www.bilibili.com/v/popular/weekly' target='_blank' className='ml-2px'>
              每周必看
            </a>
          </p>
        )}
      </div>
    )
  }

  // skeleton loading
  const _skeleton = refreshing && useSkeleton
  if (_skeleton) {
    return (
      <div className={videoGridContainer}>
        <div className={gridClassName}>
          {new Array(28).fill(undefined).map((_, index) => {
            const x = <VideoCard key={index} loading={true} className={APP_CLS_CARD} />
            return <VideoCard key={index} loading={true} className={APP_CLS_CARD} />
          })}
        </div>
      </div>
    )
  }

  const renderItem = (item: RecItemTypeOrSeparator) => {
    if (item.api === EApiType.Separator) {
      return (
        <Divider
          key={item.uniqId}
          css={css`
            grid-column: 1 / -1;

            .ant-divider-inner-text {
              display: inline-flex;
              align-items: center;
              min-height: 30px;

              a {
                color: var(--ant-color-link);
                &:hover {
                  color: var(--ant-color-primary);
                }
              }
            }
          `}
          orientation='left'
        >
          {item.content}
        </Divider>
      )
    } else {
      const index = usingVideoItems.findIndex((x) => x.uniqId === item.uniqId)
      const active = index === activeIndex

      return (
        <VideoCard
          key={item.uniqId}
          className={clsx(APP_CLS_CARD, { [APP_CLS_CARD_ACTIVE]: active })}
          css={getUsingCss(active, styleUseCardBorder, styleUseCardBorderOnlyOnHover)}
          item={item}
          active={active}
          onRemoveCurrent={handleRemoveCard}
          onMoveToFirst={handleMoveCardToFirst}
          onRefresh={refresh}
          emitter={videoCardEmitters[index]}
        />
      )
    }
  }

  // plain dom
  return (
    <div style={{ minHeight: '100%' }} className={videoGridContainer}>
      <div ref={containerRef} className={gridClassName}>
        {usingItems.map((item) => renderItem(item))}
      </div>
      {footer}
    </div>
  )
})

function getUsingCss(
  active: boolean,
  useBorder: boolean,
  useBorderOnlyOnHover: boolean,
): TheCssType {
  const borderAndShadow = css`
    border-color: ${colorPrimaryValue};
    /* overflow: hidden; */
    /* try here https://box-shadow.dev/ */
    box-shadow: 0px 0px 9px 4px ${colorPrimaryValue};
  `

  return [
    css`
      border: 1px solid transparent;
      transition:
        border-color 0.3s ease-in-out,
        box-shadow 0.3s ease-in-out;

      /* global class under .card */
      .bili-video-card__info {
        padding-left: 2px;
        padding-bottom: 1px;
        margin-top: calc(var(--info-margin-top) - 1px);
      }
    `,

    useBorder &&
      css`
        cursor: pointer;
        border-radius: ${borderRadiusValue};
      `,
    useBorder &&
      (useBorderOnlyOnHover
        ? css`
            &:hover {
              /* 可选 borderColorValue(白色) colorPrimaryValue(主题色) borderAndShadow(主题色+box-shadow) */
              ${borderAndShadow}
            }
          `
        : css`
            border-color: ${borderColorValue};
            &:hover {
              ${borderAndShadow}
            }
          `),

    active &&
      css`
        border-radius: ${borderRadiusValue};
        ${borderAndShadow}
      `,
  ]
}
