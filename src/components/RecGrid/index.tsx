/**
 * 推荐内容, 无限滚动
 */

import { useModalDislikeVisible } from '$components/ModalDislike'
import { VideoCard, VideoCardActions } from '$components/VideoCard'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { cssCls, cx } from '$libs'
import { HEADER_HEIGHT, getIsInternalTesting } from '$platform'
import { getRecommendTimes } from '$service'
import { useSettingsSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { RefObject, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { internalTesting, narrowMode, videoGrid } from '../video-grid.module.less'
import { useShortcut } from './useShortcut'

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
    const [items, setItems] = useState<(PcRecItemExtend | AppRecItemExtend)[]>([])
    const [loading, setLoading] = useState(false)

    useImperativeHandle(
      ref,
      () => ({
        refresh,
      }),
      []
    )

    const pageRef = useMemo(() => ({ page: 1 }), [])

    const refresh = useMemoizedFn(async () => {
      // scroll to top
      await onScrollToTop?.()

      try {
        clearActiveIndex() // before
        setLoading(true)
        pageRef.page = 1
        setItems(await getRecommendTimes(2, pageRef))
        clearActiveIndex() // and after
      } finally {
        setLoading(false)
      }
    })

    const fetchMore = useMemoizedFn(async () => {
      const more = await getRecommendTimes(2, pageRef)
      setItems((items) => [...items, ...more])
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

    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={fetchMore}
        hasMore={true}
        useWindow={infiteScrollUseWindow}
        threshold={window.innerHeight} // 一屏
        style={{ minHeight: '100%' }}
        loader={
          <div className={cls.loader} key={0}>
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
          {/* <VideoCard key={1} loading={true} className={cx(cls.card)} />
          <VideoCard key={2} loading={true} className={cx(cls.card)} /> */}

          {items.map((item, index) => {
            const active = index === activeIndex
            return (
              <VideoCard
                ref={(val) => (videoCardRefs[index] = val)}
                key={item.uniqId}
                className={cx(cls.card, { [cls.cardActive]: active })}
                loading={loading}
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
