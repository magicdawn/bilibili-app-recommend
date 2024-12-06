/**
 * 推荐内容, 无限滚动
 */

import { APP_CLS_CARD, APP_CLS_CARD_ACTIVE, APP_CLS_GRID, baseDebug } from '$common'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { VideoCard } from '$components/VideoCard'
import { getActiveCardBorderCss, useCardBorderCss } from '$components/VideoCard/card-border-css'
import { type VideoCardEmitter, type VideoCardEvents } from '$components/VideoCard/index.shared'
import { filterRecItems } from '$components/VideoCard/process/filter'
import type { IVideoCardData } from '$components/VideoCard/process/normalize'
import { useLinkTarget } from '$components/VideoCard/use/useOpenRelated'
import { AntdTooltip } from '$components/_base/antd-custom'
import { colorPrimaryValue } from '$components/css-vars'
import { type RecItemType, type RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { $headerHeight } from '$header'
import { IconForOpenExternalLink } from '$modules/icon'
import { concatThenUniq, refreshForGrid } from '$modules/rec-services'
import { hotStore } from '$modules/rec-services/hot'
import { getIService } from '$modules/rec-services/service-map.ts'
import { useSettingsSnapshot } from '$modules/settings'
import { isSafari } from '$ua'
import { antMessage } from '$utility/antd'
import { css } from '@emotion/react'
import { useEventListener, useLatest } from 'ahooks'
import { Divider } from 'antd'
import type { AxiosError } from 'axios'
import { cloneDeep, delay } from 'es-toolkit'
import mitt from 'mitt'
import ms from 'ms'
import type { ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import { VirtuosoGrid } from 'react-virtuoso'
import * as scopedClsNames from '../video-grid.module.scss'
import type { OnRefresh } from './useRefresh'
import { useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'
import type { CustomGridComponents, CustomGridContext } from './virtuoso.config'
import { ENABLE_VIRTUAL_GRID, gridComponents } from './virtuoso.config'

const debug = baseDebug.extend('components:RecGrid')

export type RecGridRef = {
  refresh: OnRefresh
}

export type RecGridProps = {
  shortcutEnabled: boolean
  infiniteScrollUseWindow: boolean
  onScrollToTop?: () => void | Promise<void>
  className?: string
  scrollerRef?: RefObject<HTMLElement | null>
  setRefreshing: (val: boolean) => void
  setExtraInfo?: (n?: ReactNode) => void
}

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(function RecGrid(
  {
    infiniteScrollUseWindow,
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

  // 已加载完成的 load call count, 类似 page
  const loadCompleteCountBox = useRefStateBox(0)

  // before refresh
  const preAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateExtraInfo(tab)
  })

  // after refresh, setItems
  const postAction = useMemoizedFn(() => {
    clearActiveIndex()
    loadCompleteCountBox.set(1)
    updateExtraInfo(tab)
    // check need loadMore
    setTimeout(checkShouldLoadMore)
  })

  const updateExtraInfo = useMemoizedFn((tab: ETab) => {
    const info = getIService(serviceMapBox.val, tab)?.usageInfo ?? null
    setExtraInfo?.(info)
  })

  const {
    itemsBox,
    error: refreshError,

    refresh,
    hasMoreBox,
    refreshingBox,
    refreshTsBox,
    refreshAbortController,

    useSkeleton,
    serviceMapBox,
  } = useRefresh({
    tab,
    debug,
    fetcher: refreshForGrid,

    preAction,
    postAction,
    updateExtraInfo,

    onScrollToTop,
    setUpperRefreshing,
  })

  useMount(refresh)
  useImperativeHandle(ref, () => ({ refresh }), [refresh])

  const goOutAt = useRef<number | undefined>()
  useEventListener(
    'visibilitychange',
    (e) => {
      const visible = document.visibilityState === 'visible'
      if (!visible) {
        goOutAt.current = Date.now()
        return
      }

      if (refreshingBox.val) return
      if (loadMoreLocker.current[refreshTsBox.val]) return

      // 场景
      // 当前 Tab: 稍后再看, 点视频进去, 在视频页移除了, 关闭视频页, 回到首页
      if (tab === ETab.Watchlater && goOutAt.current && Date.now() - goOutAt.current > ms('1h')) {
        refresh(true, { watchlaterKeepOrderWhenShuffle: true })
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

  // 在 refresh & loadMore 都有可能更改的 state, 需要 useRefState
  const loadMoreLocker = useRef<Record<number, boolean>>({})
  const lock = useCallback((refreshedAt: number) => {
    loadMoreLocker.current = { [refreshedAt]: true }
  }, [])
  const unlock = useCallback((refreshedAt: number) => {
    loadMoreLocker.current[refreshedAt] = false
  }, [])
  const isLocked = useMemoizedFn((refreshedAt: number) => !!loadMoreLocker.current[refreshedAt])

  const loadMore = useMemoizedFn(async () => {
    if (refreshingBox.val) return
    if (!hasMoreBox.val) return

    const refreshTsWhenStart = refreshTsBox.val
    if (isLocked(refreshTsWhenStart)) return
    lock(refreshTsWhenStart)

    let newItems = itemsBox.val
    let newHasMore = true
    let err: any
    try {
      const service = getIService(serviceMapBox.val, tab)
      let more = (await service.loadMore(refreshAbortController.signal)) || []
      more = filterRecItems(more, tab)
      newItems = concatThenUniq(newItems, more)
      newHasMore = service.hasMore
    } catch (e) {
      err = e
    }

    if (err) {
      unlock(refreshTsWhenStart)
      // todo: how to handle this ?
      throw err
    }

    // loadMore 发出请求了, 但稍候重新刷新了, setItems 以及后续操作应该 abort
    if (refreshTsWhenStart !== refreshTsBox.val) {
      debug(
        'loadMore: skip update for mismatch refreshedAt, %s != %s',
        refreshTsWhenStart,
        refreshTsBox.val,
      )
      return
    }

    debug(
      'loadMore: seq(%s) len %s -> %s',
      loadCompleteCountBox.val + 1,
      itemsBox.val.length,
      newItems.length,
    )
    hasMoreBox.set(newHasMore)
    itemsBox.set(newItems)
    loadCompleteCountBox.set((c) => c + 1)
    unlock(refreshTsWhenStart)

    // check
    checkShouldLoadMore()
  })

  // 渲染使用的 items
  const usingItems = itemsBox.state

  // .video-grid
  const containerRef = useRef<HTMLDivElement | null>(null)

  const getScrollerRect = useMemoizedFn(() => {
    // use window
    if (infiniteScrollUseWindow) {
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
    return usingItems.filter((x) => x.api !== EApiType.Separator)
  }, [usingItems])

  // emitters
  const emitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshTsBox.state])
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
    changeScrollY: infiniteScrollUseWindow
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

  const setItems = itemsBox.set

  const handleRemoveCard = useMemoizedFn((item: RecItemType, data: IVideoCardData) => {
    setItems((items) => {
      const index = items.findIndex((x) => x.uniqId === item.uniqId)
      if (index === -1) return items

      const newItems = items.slice()
      newItems.splice(index, 1)
      antMessage.success(`已移除: ${data.title}`, 4)

      if (tab === ETab.Watchlater) {
        serviceMapBox.val[tab].decreaseTotal()
        updateExtraInfo(tab)
      }
      if (tab === ETab.Fav) {
        serviceMapBox.val[tab].decreaseTotal()
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
   * state for render & useEffect deps
   */

  const refreshing = refreshingBox.state
  const hasMore = hasMoreBox.state

  /**
   * footer for infinite scroll
   */
  const { ref: footerRef, inView: __footerInView } = useInView({
    root: infiniteScrollUseWindow ? null : scrollerRef?.current || null,
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
        grid-column: 1 / -1;
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
              <IconParkOutlineLoading
                className='size-40px animate-spin mr-10px'
                css={css`
                  color: ${colorPrimaryValue};
                `}
              />
              加载中~
            </>
          ) : (
            <>没有更多了~</>
          )}
        </>
      )}
    </div>
  )

  const { useNarrowMode, style } = useSettingsSnapshot()
  const gridClassName = clsx(
    APP_CLS_GRID, // for customize css
    scopedClsNames.videoGrid,
    scopedClsNames.newCardStyle,
    style.pureRecommend.useCustomGrid
      ? scopedClsNames.videoGridCustom
      : scopedClsNames.videoGridBiliFeed4,
    useNarrowMode && scopedClsNames.narrowMode, // 居中
    className,
  )

  const cardBorderCss = useCardBorderCss()

  const virtuosoGridContext: CustomGridContext = useMemo(() => {
    return {
      footerContent: footer,
      containerRef,
      gridClassName,
      // renderItem,
    }
  }, [footer, containerRef, gridClassName])

  // Shit happens!
  if (refreshError) {
    console.error('RecGrid.refresh error:', refreshError.stack || refreshError)
    return <ErrorDetail tab={tab} err={refreshError} />
  }

  // skeleton loading
  const _skeleton = refreshing && useSkeleton
  if (_skeleton) {
    return (
      <div className={scopedClsNames.videoGridContainer}>
        <div className={gridClassName}>
          {new Array(28).fill(undefined).map((_, index) => {
            const x = <VideoCard key={index} loading={true} className={APP_CLS_CARD} tab={tab} />
            return <VideoCard key={index} loading={true} className={APP_CLS_CARD} tab={tab} />
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
          baseCss={[cardBorderCss, getActiveCardBorderCss(active)]}
          item={item}
          active={active}
          onRemoveCurrent={handleRemoveCard}
          onMoveToFirst={handleMoveCardToFirst}
          onRefresh={refresh}
          emitter={videoCardEmitters[index]}
          tab={tab}
        />
      )
    }
  }

  // virtual grid
  if (ENABLE_VIRTUAL_GRID) {
    return (
      <div className={clsx(scopedClsNames.videoGridContainer, scopedClsNames.virtualGridEnabled)}>
        <VirtuosoGrid
          useWindowScroll
          data={usingItems}
          overscan={{ main: 20, reverse: 20 }}
          listClassName={gridClassName}
          computeItemKey={(index, item) => item.uniqId}
          components={gridComponents as CustomGridComponents} // 因为我改了 context required
          context={virtuosoGridContext}
          itemContent={(index, item) => renderItem(item)}
          endReached={() => checkShouldLoadMore()}
        />
        {!gridComponents.Footer && footer}
      </div>
    )
  }

  // plain dom
  return (
    <div style={{ minHeight: '100%' }} className={scopedClsNames.videoGridContainer}>
      <div ref={containerRef} className={gridClassName}>
        {usingItems.map((item) => renderItem(item))}
      </div>
      {footer}
    </div>
  )
})

const isAxiosError = (err: any): err is AxiosError => {
  return err instanceof Error && err.name === 'AxiosError'
}

const errorParagraph = css`
  margin-top: 10px;
`

function inspectErr(err: any): ReactNode {
  const nodes: ReactNode[] = []

  const wrapParagraph = (node: ReactNode) => <p css={errorParagraph}>{node}</p>

  if (!(err instanceof Error)) {
    nodes.push(JSON.stringify(err))
  }
  // Error
  else {
    // display stack, fallback to message
    if (err.stack) {
      nodes.push(
        wrapParagraph(
          <>
            Error Stack: <br />
            {err.stack}
          </>,
        ),
      )
    } else {
      nodes.push(wrapParagraph(<>Error Message: {err.message}</>))
    }

    // add error cause
    if (err.cause) {
      nodes.push(wrapParagraph(<>Error Cause: {inspectErr(err.cause)}</>))
    }

    // if it's axios error
    if (isAxiosError(err)) {
      const _err = cloneDeep(err)
      // hide sensitive access_key
      if (_err.config?.params?.access_key) {
        _err.config.params.access_key = '*'.repeat(_err.config.params.access_key.length)
      }
      nodes.push(wrapParagraph(<>axios config: {JSON.stringify(_err.config, null, 2)}</>))
    }
  }

  return nodes
}

function ErrorDetail({ err, tab }: { err: any; tab: ETab }) {
  const target = useLinkTarget()
  const errDetail: ReactNode = useMemo(() => inspectErr(err), [err])
  return (
    <div
      css={css`
        font-size: 20px;
        padding: 20px;
        text-align: center;
      `}
    >
      <AntdTooltip
        title={
          <div className='p-block-10'>
            <h3>错误详情</h3>
            <div
              css={css`
                overflow: hidden;
                white-space: pre-wrap;
                word-break: normal;
                max-height: 50vh;
                overflow-y: scroll;
              `}
            >
              {errDetail}
            </div>
          </div>
        }
      >
        <p className='cursor-pointer flex items-center justify-center'>
          <IconTablerFaceIdError className='mr-4' />
          出错了, 请刷新重试!
        </p>
      </AntdTooltip>

      {tab === ETab.Hot && hotStore.subtab === EHotSubTab.PopularWeekly && (
        <p className='mt-8 flex items-center justify-center'>
          可能需手动输入验证码
          <IconForOpenExternalLink className='ml-12' />
          <a href='https://www.bilibili.com/v/popular/weekly' target={target} className='ml-2'>
            每周必看
          </a>
        </p>
      )}
    </div>
  )
}
