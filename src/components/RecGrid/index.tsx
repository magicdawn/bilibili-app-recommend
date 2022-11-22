/**
 * 推荐内容, 无限滚动
 */

import { showModalDislike, useModalDislikeVisible } from '$components/ModalDislike'
import { VideoCard } from '$components/VideoCard'
import { RecItemWithUniqId } from '$define'
import { cssCls, cx } from '$libs'
import { HEADER_HEIGHT, useIsInternalTesting } from '$platform'
import { getRecommendTimes } from '$service'
import { useConfigSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { forwardRef, RefObject, useImperativeHandle, useRef, useState } from 'react'
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
    const [items, setItems] = useState<RecItemWithUniqId[]>([])
    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => {
      return {
        refresh,
      }
    })

    const refresh = useMemoizedFn(async () => {
      // scroll to top
      await onScrollToTop?.()

      try {
        clearActiveIndex() // before
        setLoading(true)
        setItems(await getRecommendTimes(2))
        clearActiveIndex() // and after
      } finally {
        setLoading(false)
      }
    })

    const fetchMore = useMemoizedFn(async (page: number) => {
      const more = await getRecommendTimes(2)
      setItems((items) => [...items, ...more])
    })

    // 窄屏模式
    const { useNarrowMode } = useConfigSnapshot()

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

    // 快捷键
    const { activeIndex, clearActiveIndex } = useShortcut({
      enabled: shortcutEnabled && !modalDislikeVisible,
      refresh,
      maxIndex: items.length - 1,
      containerRef,
      getScrollerRect,
      openDislikeAt(index) {
        showModalDislike(items[index])
      },
    })

    const isInisInternalTesting = useIsInternalTesting()

    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={fetchMore}
        hasMore={true}
        useWindow={infiteScrollUseWindow}
        threshold={360} // 差不多一行高度
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
          {items.map((item, index) => {
            return (
              <VideoCard
                key={item.uniqId}
                loading={loading}
                item={item}
                className={cx(cls.card, { [cls.cardActive]: index === activeIndex })}
              />
            )
          })}
        </div>
      </InfiniteScroll>
    )
  }
)
