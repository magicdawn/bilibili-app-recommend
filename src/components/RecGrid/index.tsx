/**
 * 推荐内容, 无限滚动
 */

import { APP_NAME, baseDebug } from '$common'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { colorPrimaryValue } from '$components/ModalSettings/theme'
import { useCurrentSourceTab } from '$components/RecHeader/tab'
import {
  VideoCard,
  VideoCardEmitter,
  VideoCardEvents,
  borderRadiusValue,
} from '$components/VideoCard'
import { IVideoCardData } from '$components/VideoCard/process/normalize'
import { RecItemType } from '$define'
import { getHeaderHeight } from '$header'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { getIsInternalTesting, isSafari } from '$platform'
import { getRecommendTimes, refreshForGrid, uniqConcat } from '$service/rec'
import { useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import { css as styled } from '@emotion/css'
import { css } from '@emotion/react'
import { useEventListener, useLatest, useMemoizedFn, useMount } from 'ahooks'
import delay from 'delay'
import mitt from 'mitt'
import ms from 'ms'
import {
  ReactNode,
  RefObject,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { VirtuosoGrid } from 'react-virtuoso'
import {
  narrowMode,
  videoGrid,
  videoGridContainer,
  videoGridInternalTesting,
  videoGridNewHomepage,
  videoGridYoutubeLike,
} from '../video-grid.module.less'
import { OnRefresh, useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'

const debug = baseDebug.extend('components:RecGrid')

const ENABLE_VIRTUAL_GRID = false

export const CardClassNames = {
  card: styled`
    border: 2px solid transparent;

    /* global class under .card */
    .bili-video-card__info {
      padding-left: 2px;
      padding-bottom: 1px;
      margin-top: calc(var(--info-margin-top) - 1px);
    }
  `,

  cardActive: styled`
    border-color: ${colorPrimaryValue};
    border-radius: ${borderRadiusValue};
    overflow: hidden;
  `,
}

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

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(
  (
    {
      infiteScrollUseWindow,
      shortcutEnabled,
      onScrollToTop,
      className,
      scrollerRef,
      setRefreshing: setUpperRefreshing,
      setExtraInfo,
    },
    ref
  ) => {
    const { useNarrowMode, styleUseYoutubeLikeCard } = useSettingsSnapshot()
    const tab = useCurrentSourceTab()

    const [loadCompleteCount, setLoadCompleteCount] = useState(0) // 已加载完成的 load call count, 类似 page

    // before refresh
    const preAction = useMemoizedFn(async () => {
      clearActiveIndex()
      setExtraInfo?.()
    })

    // after refresh, setItems
    const postAction = useMemoizedFn(() => {
      clearActiveIndex()
      setLoadCompleteCount(1)

      if (tab === 'watchlater') {
        setExtraInfo?.(watchLaterService.usageInfo)
      }
      if (tab === 'fav') {
        setExtraInfo?.(favService.usageInfo)
      }
      if (tab === 'dynamic-feed') {
        setExtraInfo?.(dynamicFeedService.usageInfo)
      }

      // check need loadMore
      checkShouldLoadMore()
    })

    const {
      refresh,

      items,
      setItems,
      error: refreshError,

      refreshing,
      refreshedAt,
      getRefreshedAt,
      swr,

      hasMore,
      setHasMore,

      pcRecService,
      dynamicFeedService,
      watchLaterService,
      favService,
    } = useRefresh({
      tab,
      debug,
      fetcher: refreshForGrid,
      recreateService: true,
      preAction,
      postAction,

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
        if (tab === 'watchlater' && goOutAt.current && Date.now() - goOutAt.current > ms('1h')) {
          refresh(true, { watchlaterKeepOrder: true })
        }
      },
      { target: document }
    )

    const loadMoreRequesting = useRef<Record<number, boolean>>({})

    /**
     * useMemoizedFn 只能确保 loadMore 开始调用时值时最新的.
     * 拿 refreshedAt 举例, loadMore 内部, 值 refreshedAt 不变
     * 所以需要 useGetState, 从 getRefreshedAt 取最新的值
     */
    const loadMore = useMemoizedFn(async () => {
      if (!hasMore) return
      if (refreshing) return

      const refreshAtWhenStart = refreshedAt
      if (loadMoreRequesting.current[refreshAtWhenStart]) return
      loadMoreRequesting.current = { [refreshAtWhenStart]: true }

      let newItems = items
      let _hasMore = true
      try {
        if (tab === 'dynamic-feed') {
          newItems = newItems.concat((await dynamicFeedService.loadMore()) || [])
          _hasMore = dynamicFeedService.hasMore
        } else if (tab === 'watchlater') {
          newItems = newItems.concat((await watchLaterService.loadMore()) || [])
          _hasMore = watchLaterService.hasMore
        } else if (tab === 'fav') {
          newItems = newItems.concat((await favService.loadMore()) || [])
          _hasMore = favService.hasMore
        } else {
          // loadMore 至少 load 一项, 需要触发 InfiniteScroll.componentDidUpdate
          while (!(newItems.length > items.length)) {
            // keep-follow-only 需要大基数
            const times = tab === 'keep-follow-only' ? 5 : 2
            const more = await getRecommendTimes(times, tab, pcRecService)
            newItems = uniqConcat(newItems, more)
          }
        }
      } catch (e) {
        loadMoreRequesting.current[refreshAtWhenStart] = false
        throw e
      }

      // loadMore 发出请求了, 但稍候刷新了, setItems 时可能
      //  - 在刷新
      //  - 刷新结束了
      if (refreshAtWhenStart !== getRefreshedAt()) {
        debug(
          'loadMore: skip update for mismatch refreshedAt, %s != %s',
          refreshAtWhenStart,
          getRefreshedAt()
        )
        return
      }

      debug('loadMore: seq(%s) len %s -> %s', loadCompleteCount + 1, items.length, newItems.length)
      setHasMore(_hasMore)
      setItems(newItems)
      setLoadCompleteCount((c) => c + 1)
      loadMoreRequesting.current[refreshAtWhenStart] = false

      // check
      checkShouldLoadMore()
    })

    //
    // loadMore may need more loadMore
    // 例如大屏的初始化问题: https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/182834
    //
    // react-infinite-scroll 的使用方法
    // check threshold -> detach scroll, loadMore -> loadMore 引发数据变化 -> InfiniteScroll.componentDidUpdate -> re-bind scroll event
    // 问题在于, loadMore 结束后还需要再 loadMore, 这时需要手动 scroll 一下
    // 这里模拟一下 scroll event
    //
    const checkShouldLoadMore = useMemoizedFn(async () => {
      const ms = isSafari ? 100 : 50
      await delay(ms) // always in nextTick

      debug('checkShouldLoadMore(): footerInView = %s', footerInViewRef.current)
      if (footerInViewRef.current) {
        loadMore()
      }

      // legacy trigger for react-infinite-scroller
      // const scroller = infiteScrollUseWindow ? window : scrollerRef?.current
      // scroller?.dispatchEvent(new CustomEvent('scroll'))
    })

    // .video-grid
    const containerRef = useRef<HTMLDivElement>(null)

    const getScrollerRect = useMemoizedFn(() => {
      // use window
      if (infiteScrollUseWindow) {
        const yStart = getHeaderHeight() + 50 // 50 RecHeader height
        return new DOMRect(0, yStart, window.innerWidth, window.innerHeight - yStart)
      }
      // use in a scroller
      else {
        return scrollerRef?.current?.getBoundingClientRect()
      }
    })

    // 不喜欢弹窗
    const modalDislikeVisible = useModalDislikeVisible()

    // emitters
    const videoCardEmittersMap = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshedAt])
    const videoCardEmitters = useMemo(() => {
      return items.map(({ uniqId: cacheKey }) => {
        return (
          videoCardEmittersMap.get(cacheKey) ||
          (() => {
            const instance = mitt<VideoCardEvents>()
            videoCardEmittersMap.set(cacheKey, instance)
            return instance
          })()
        )
      })
    }, [items])

    // 快捷键
    const { activeIndex, clearActiveIndex } = useShortcut({
      enabled: shortcutEnabled && !modalDislikeVisible,
      refresh,
      maxIndex: items.length - 1,
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

    const isInternalTesting = getIsInternalTesting()

    /**
     * card state change
     */

    const handleRemoveCard = useMemoizedFn((item: RecItemType, data: IVideoCardData) => {
      setItems((items) => {
        const index = items.findIndex((x) => x.uniqId === item.uniqId)
        if (index === -1) return items

        let newItems = items.slice()
        newItems.splice(index, 1)
        toast(`已移除: ${data.title}`, 4000)

        if (tab === 'watchlater') {
          watchLaterService.count--
          setExtraInfo?.(watchLaterService.usageInfo)
        }
        if (tab === 'fav') {
          favService.total--
          setExtraInfo?.(favService.usageInfo)
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
        newItems.splice(index, 1)
        newItems.unshift(currentItem)

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
          loadMore()
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

    const gridClassName = cx(
      `${APP_NAME}-video-grid`, // for customize css
      videoGrid,

      styleUseYoutubeLikeCard
        ? videoGridYoutubeLike // 大卡片
        : isInternalTesting
        ? videoGridInternalTesting // 内测
        : videoGridNewHomepage, // default

      useNarrowMode && narrowMode, // 居中
      className
    )

    const showSkeleton = !items.length || refreshError || (refreshing && !swr)

    // skeleton loading
    if (showSkeleton) {
      return (
        <div className={videoGridContainer}>
          <div className={gridClassName}>
            {new Array(28).fill(undefined).map((_, index) => {
              const x = <VideoCard key={index} loading={true} className={CardClassNames.card} />
              return <VideoCard key={index} loading={true} className={CardClassNames.card} />
            })}
          </div>
        </div>
      )
    }

    // virtual grid
    // 有个缺点, 开始的时候只显示一个 video-card
    if (ENABLE_VIRTUAL_GRID) {
      return (
        <div>
          <VirtuosoGrid
            useWindowScroll
            data={items}
            // listClassName={containerClassName}
            overscan={window.innerHeight}
            computeItemKey={(index, item) => item.uniqId}
            components={{
              List: forwardRef((props, ref) => {
                return (
                  <div
                    ref={(el) => {
                      // @ts-ignore
                      containerRef.current = el
                      if (ref) {
                        if (typeof ref === 'function') ref(el)
                        else ref.current = el
                      }
                    }}
                    {...props}
                    className={cx(props.className, gridClassName)}
                  />
                )
              }),

              // render footer here cause error
              // Footer() {
              //   return <></>
              // },
            }}
            itemContent={(index, item) => {
              const active = index === activeIndex
              return (
                <VideoCard
                  key={item.uniqId}
                  className={cx(CardClassNames.card, { [CardClassNames.cardActive]: active })}
                  item={item}
                  active={active}
                  onRemoveCurrent={handleRemoveCard}
                  onMoveToFirst={handleMoveCardToFirst}
                  onRefresh={refresh}
                  emitter={videoCardEmitters[index]}
                />
              )
            }}
          />
          {footer}
        </div>
      )
    }

    // plain dom
    return (
      <div style={{ minHeight: '100%' }} className={videoGridContainer}>
        <div ref={containerRef} className={gridClassName}>
          {/* items */}
          {items.map((item, index) => {
            const active = index === activeIndex
            return (
              <VideoCard
                key={item.uniqId}
                className={cx(CardClassNames.card, { [CardClassNames.cardActive]: active })}
                item={item}
                active={active}
                onRemoveCurrent={handleRemoveCard}
                onMoveToFirst={handleMoveCardToFirst}
                onRefresh={refresh}
                emitter={videoCardEmitters[index]}
              />
            )
          })}
        </div>
        {footer}
      </div>
    )
  }
)
