import { useShortcut } from '$components/ModalFeed/useShortcut'
import { VideoCard } from '$components/VideoCard'
import { RecItemWithUniqId } from '$define'
import { cx } from '$libs'
import { getRecommendTimes } from '$service'
import { useConfigSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { ReactNode, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import styles from '../ModalFeed/index.module.less'

export function PureRecommend({ header }: { header?: ReactNode }) {
  const [items, setItems] = useState<RecItemWithUniqId[]>([])
  const [loading, setLoading] = useState(false)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const refresh = useMemoizedFn(async () => {
    // scroll to top
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }

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

  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  // 快捷键
  const { activeIndex, clearActiveIndex } = useShortcut({
    show: true,
    refresh,
    maxIndex: items.length - 1,
  })

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={fetchMore}
      hasMore={true}
      useWindow={true}
      threshold={360} // 差不多一行高度
      style={{ minHeight: '100%' }}
      loader={
        <div className={styles.loader} key={0}>
          加载中...
        </div>
      }
    >
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
        {header}
        <div id={styles.videoCardBody} className={cx('video-card-body', narrowStyleObj)}>
          {items.map((item, index) => {
            return (
              <VideoCard
                key={item.uniqId}
                loading={loading}
                item={item}
                className={cx(styles.card, { [styles.active]: index === activeIndex })}
              />
            )
          })}
        </div>
      </div>
    </InfiniteScroll>
  )
}
