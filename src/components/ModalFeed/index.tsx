import { CollapseBtn } from '@components/CollapseBtn'
import { RecItem } from '@define'
import { cx } from '@libs'
import { getRecommendTimes } from '@service'
import { useConfigStore, updateConfig } from '@settings'
import { useMemoizedFn, useSafeState } from 'ahooks'
import delay from 'delay'
import { ChangeEventHandler, memo, useCallback, useMemo, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { BaseModal } from '../BaseModal'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
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
    let more = await getRecommendTimes(2)
    const set = new Set(items.map((item) => item.param))
    more = more.filter((item) => {
      return !set.has(item.param)
    })
    setItems((items) => [...items, ...more])
  })

  const { useNarrowMode } = useConfigStore()
  const updateUseNarrowMode: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const val = e.target.checked
    updateConfig({ useNarrowMode: val })
  }, [])

  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  return (
    <BaseModal
      {...{ show, onHide }}
      clsModalMask={cx(styles.modalMask, narrowStyleObj)}
      clsModal={cx(styles.modal, narrowStyleObj)}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>推荐</div>

        <div className='space' style={{ flex: 1 }}></div>

        <CollapseBtn>
          <input
            type='checkbox'
            id={styles.useNarrowMode}
            checked={useNarrowMode}
            onChange={updateUseNarrowMode}
          />
          <label htmlFor={styles.useNarrowMode}>启用窄屏模式</label>
        </CollapseBtn>

        <button className={`primary-btn roll-btn ${styles.btnRefresh}`} onClick={refresh}>
          <svg>
            <use xlinkHref='#widget-roll'></use>
          </svg>
          <span>换一换</span>
        </button>

        <button className={`primary-btn roll-btn ${styles.btnClose}`} onClick={onHide}>
          <svg>
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
          style={{ minHeight: '100%' }}
          loader={
            <div className={styles.loader} key={0}>
              加载中...
            </div>
          }
        >
          <div className={`video-card-list is-full ${styles.videoCardList}`}>
            <div id={styles.videoCardBody} className={cx('video-card-body', narrowStyleObj)}>
              {items.map((item) => {
                return <VideoCard key={item.param} item={item} loading={loading} />
              })}
            </div>
          </div>
        </InfiniteScroll>
      </div>
    </BaseModal>
  )
})
