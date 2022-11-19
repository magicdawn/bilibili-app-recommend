/**
 * 推荐内容, 无限滚动
 */

import { VideoCard } from '$components/VideoCard'
import { RecItemWithUniqId } from '$define'
import { css, cx } from '$libs'
import { getRecommendTimes } from '$service'
import { useConfigSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { forwardRef, useImperativeHandle, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { narrowMode, videoGrid } from '../video-grid.module.less'
import { useShortcut } from './useShortcut'

const emotionStyles = {
  loader: css`
    text-align: center;
    line-height: 60px;
    font-size: 120%;
  `,

  card: css`
    border: 2px solid transparent;

    /* global class under .card */
    .bili-video-card__info {
      padding-left: 2px;
      padding-bottom: 1px;
      margin-top: calc(var(--info-margin-top) - 1px);
    }
  `,
  cardActive: css`
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
}

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(
  ({ infiteScrollUseWindow, shortcutEnabled, onScrollToTop }, ref) => {
    const [items, setItems] = useState<RecItemWithUniqId[]>([])
    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => {
      return {
        refresh,
      }
    })

    let [hasMore, setHasMore] = useState(true)

    const refresh = useMemoizedFn(async () => {
      // scroll to top
      await onScrollToTop?.()

      try {
        clearActiveIndex() // before
        setLoading(true)
        setItems(await getRecommendTimes(2))
        clearActiveIndex() // and after

        if (items.length > 20) {
          setHasMore(false)
        }
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

    // 快捷键
    const { activeIndex, clearActiveIndex } = useShortcut({
      enabled: shortcutEnabled,
      refresh,
      maxIndex: items.length - 1,
    })

    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={fetchMore}
        hasMore={hasMore}
        useWindow={infiteScrollUseWindow}
        threshold={360} // 差不多一行高度
        style={{ minHeight: '100%' }}
        loader={
          <div css={emotionStyles.loader} key={0}>
            加载中...
          </div>
        }
      >
        {/* 这里只定义列数, 宽度 100% */}
        <div className={cx(videoGrid, { [narrowMode]: useNarrowMode })}>
          {items.map((item, index) => {
            return (
              <VideoCard
                key={item.uniqId}
                loading={loading}
                item={item}
                css={[emotionStyles.card, index === activeIndex && emotionStyles.cardActive]}
              />
            )
          })}
        </div>
      </InfiniteScroll>
    )
  }
)
