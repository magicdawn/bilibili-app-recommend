import { RecItem } from '@define'
import { getRecommendTimes } from '@service'
import { useMemoizedFn, useSafeState } from 'ahooks'
import delay from 'delay'
import { useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { BaseModal } from '../BaseModal'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

export function ModalFeed({ show, onHide }: IProps) {
  const [items, setItems] = useSafeState<RecItem[]>([])

  const [loading, setLoading] = useSafeState(false)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const refresh = useMemoizedFn(async () => {
    // scroll to top
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }

    // load
    await delay(50)

    try {
      setLoading(true)
      setItems(await getRecommendTimes(2))
    } finally {
      setLoading(false)
    }
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    const more = await getRecommendTimes(2)
    setItems((items) => [...items, ...more])
  })

  return (
    <BaseModal {...{ show, onHide }} clsModalMask={styles.modalMask} clsModal={styles.modal}>
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>推荐</div>

        <div className='space' style={{ flex: 1 }}></div>

        <button className={`primary-btn roll-btn ${styles.btnRefresh}`} onClick={refresh}>
          <svg style={{ transform: 'rotate(0deg)' }}>
            <use xlinkHref='#widget-roll'></use>
          </svg>
          <span>换一换</span>
        </button>

        <button className={`primary-btn roll-btn ${styles.btnClose}`} onClick={onHide}>
          <svg style={{ transform: 'rotate(0deg)' }}>
            <use xlinkHref='#widget-close'></use>
          </svg>
          <span>关闭</span>
        </button>
      </div>

      <div className={styles.modalBody} ref={scrollerRef}>
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchMore}
          hasMore={true}
          useWindow={false}
          threshold={320} // 差不多一行高度
          loader={
            <div className={styles.loader} key={0}>
              加载中...
            </div>
          }
        >
          <div className={`video-card-list is-full ${styles.videoCardList}`}>
            <div className='video-card-body more-class1 more-class2'>
              {items.map((item) => {
                return <VideoCard key={item.param} item={item} loading={loading} />
              })}
            </div>
          </div>
        </InfiniteScroll>
      </div>
    </BaseModal>
  )
}
