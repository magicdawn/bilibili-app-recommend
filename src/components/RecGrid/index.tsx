/**
 * 推荐内容, 无限滚动
 */

import { baseDebug } from '$common'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useCurrentTheme } from '$components/ModalSettings/theme'
import { VideoCard, VideoCardActions } from '$components/VideoCard'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { cssCls, cx } from '$libs'
import { HEADER_HEIGHT, getIsInternalTesting } from '$platform'
import { getRecommendForGrid, getRecommendTimes, uniqConcat } from '$service'
import { useSettingsSnapshot } from '$settings'
import { useGetState, useMemoizedFn, useMount } from 'ahooks'
import { RefObject, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { internalTesting, narrowMode, videoGrid } from '../video-grid.module.less'
import { useShortcut } from './useShortcut'

const debug = baseDebug.extend('components:RecGrid')

export const cls = {
  loader: cssCls`
    text-align: center;
    line-height: 60px;
    font-size: 120%;
  `,

  card: cssCls`
    border: 2px solid transparent;

    /* global class under .card */
    .bili-video-card__info {
      padding-left: 2px;
      padding-bottom: 1px;
      margin-top: calc(var(--info-margin-top) - 1px);
    }
  `,
  cardActive: cssCls`
    border-color: #fb7299;
    border-radius: 6px;
    overflow: hidden;
  `,
}

export type RecGridRef = {
  refresh: () => void | Promise<void>
}

export type RecGridProps = {
  shortcutEnabled: boolean
  infiteScrollUseWindow: boolean
  onScrollToTop?: () => void | Promise<void>
  className?: string
  scrollerRef?: RefObject<HTMLElement | null>
}

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(
  ({ infiteScrollUseWindow, shortcutEnabled, onScrollToTop, className, scrollerRef }, ref) => {
    const pageRef = useRef({ page: 1 })

    // 已加载完成的 load call count, 类似 page
    const [loadCompleteCount, setLoadCompleteCount, getLoadCompleteCount] = useGetState(0)

    const [items, setItems, getItems] = useGetState<(PcRecItemExtend | AppRecItemExtend)[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshedAt, setRefreshedAt, getRefreshedAt] = useGetState<number>(() => Date.now())

    const refresh = useMemoizedFn(async () => {
      const start = performance.now()
      debug('call refresh()')

      // scroll to top
      await onScrollToTop?.()

      setIsRefreshing(true)
      setRefreshedAt(Date.now())
      clearActiveIndex() // before
      setItems([])
      pageRef.current.page = 1

      try {
        setItems(await getRecommendForGrid(pageRef.current))
      } catch (e) {
        setIsRefreshing(false)
        throw e
      }

      setLoadCompleteCount(1)
      clearActiveIndex() // and after
      setIsRefreshing(false)

      const cost = performance.now() - start
      debug('refresh cost %s ms', cost.toFixed(0))

      // check need loadMore
      triggerScroll()
    })

    useMount(refresh)
    useImperativeHandle(ref, () => ({ refresh }), [])

    const requesting = useRef(false)

    const fetchMore = useMemoizedFn(async () => {
      if (isRefreshing) return
      if (requesting.current) return
      requesting.current = true

      const refreshAtWhenStart = getRefreshedAt()

      let newItems = items
      try {
        // fetchMore 至少 load 一项, 需要触发 InfiniteScroll.componentDidUpdate
        while (!(newItems.length > items.length)) {
          const more = await getRecommendTimes(2, pageRef.current)
          newItems = uniqConcat(newItems, more)
        }
      } catch (e) {
        requesting.current = false
        throw e
      }

      // loadMore 发出请求了, 但稍候刷新了, setItems 时可能
      //  - 在刷新
      //  - 刷新结束了
      if (refreshAtWhenStart !== getRefreshedAt()) {
        debug(
          'fetchMore: skip update for mismatch refreshedAt, %s != %s',
          refreshAtWhenStart,
          getRefreshedAt()
        )
        requesting.current = false
        return
      }

      debug(
        'fetchMore: seq(%s) len %s -> %s',
        getLoadCompleteCount() + 1,
        items.length,
        newItems.length
      )

      setItems(newItems)
      setLoadCompleteCount((c) => c + 1)
      triggerScroll() // check
      requesting.current = false
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
    const triggerScroll = useMemoizedFn(() => {
      setTimeout(() => {
        const scroller = infiteScrollUseWindow ? window : scrollerRef?.current
        scroller?.dispatchEvent(new CustomEvent('scroll'))
      })
    })

    // 窄屏模式
    const { useNarrowMode } = useSettingsSnapshot()

    // .video-grid
    const containerRef = useRef<HTMLDivElement>(null)

    const getScrollerRect = useMemoizedFn(() => {
      // use window
      if (infiteScrollUseWindow) {
        const headerHight = HEADER_HEIGHT + 50 // 50 RecHeader height
        return new DOMRect(0, headerHight, window.innerWidth, window.innerHeight - headerHight)
      }
      // use in a scroller
      else {
        return scrollerRef?.current?.getBoundingClientRect()
      }
    })

    // 不喜欢弹框
    const modalDislikeVisible = useModalDislikeVisible()

    const videoCardRefs = useMemo(() => {
      return new Array<VideoCardActions | undefined | null>(items.length).fill(undefined)
    }, [items.length])

    // 快捷键
    const { activeIndex, clearActiveIndex } = useShortcut({
      enabled: shortcutEnabled && !modalDislikeVisible,
      refresh,
      maxIndex: items.length - 1,
      containerRef,
      getScrollerRect,
      videoCardRefs,
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

    const isInisInternalTesting = getIsInternalTesting()

    const { colorPrimary } = useCurrentTheme()

    return (
      <InfiniteScroll
        pageStart={0}
        hasMore={true}
        loadMore={fetchMore}
        initialLoad={false}
        useWindow={infiteScrollUseWindow}
        threshold={window.innerHeight} // 一屏
        style={{ minHeight: '100%' }}
        loader={
          <div className={cls.loader} key={-1}>
            加载中...
          </div>
        }
      >
        {/* 这里只定义列数, 宽度 100% */}
        <div
          ref={containerRef}
          className={cx(
            videoGrid,
            { [internalTesting]: isInisInternalTesting },
            { [narrowMode]: useNarrowMode },
            className
          )}
        >
          {isRefreshing
            ? //skeleton loading
              new Array(24).fill(undefined).map((_, index) => {
                return <VideoCard key={index} loading={true} className={cx(cls.card)} />
              })
            : // items
              items.map((item, index) => {
                const active = index === activeIndex
                return (
                  <VideoCard
                    ref={(val) => (videoCardRefs[index] = val)}
                    key={item.uniqId}
                    className={cx(cls.card, { [cls.cardActive]: active })}
                    style={{
                      ...(active && { borderColor: colorPrimary }),
                    }}
                    item={item}
                    active={active}
                  />
                )
              })}
        </div>
      </InfiniteScroll>
    )
  }
)
