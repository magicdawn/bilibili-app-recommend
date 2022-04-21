import { useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMemoizedFn, useSafeState } from 'ahooks'
import delay from 'delay'
import InfiniteScroll from 'react-infinite-scroller'
import { RecItem } from '@define'
import { getRecommendTimes } from '@service'
import { VideoCard } from './VideoCard'
import * as styles from './ModalFeed.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

function ModalFeed({ show, onHide }: IProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 打开时判断深色模式等
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const bg = window.getComputedStyle(document.body)['background-color']
    const c = window.getComputedStyle(document.body)['color']

    wrapper.style.setProperty('--bg', bg)
    wrapper.style.setProperty('--c', c)
    wrapper.style.setProperty('background-color', 'var(--bg)')
    wrapper.style.setProperty('color', 'var(--c)')
  }, [show])

  const [items, setItems] = useSafeState<RecItem[]>([])

  const scrollerRef = useRef<HTMLDivElement>(null)
  const refresh = useMemoizedFn(async () => {
    // scroll to top
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }

    // load
    await delay(50)
    setItems(await getRecommendTimes(2))
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    const more = await getRecommendTimes(2)
    setItems((items) => [...items, ...more])
  })

  useLayoutEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      setItems([]) // reset data
      document.body.style.overflow = 'auto'
    }
  }, [show])

  const containerId = useId()
  const container = useMemo(() => {
    const div = document.createElement('div')
    div.setAttribute('data-id', 'modal-feed-' + containerId)
    document.body.appendChild(div)
    return div
  }, [])

  if (!show) {
    return null
  }

  return createPortal(
    <div className={styles.modalMask}>
      <div className={styles.modal} ref={wrapperRef}>
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
              <div className='loader' style={{ textAlign: 'center' }} key={0}>
                加载中...
              </div>
            }
          >
            <div className={`video-card-list is-full ${styles.videoCardList}`}>
              <div className='video-card-body more-class1 more-class2'>
                {items.map((item) => {
                  return <VideoCard key={item.param} item={item} />
                })}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>,
    container
  )
}

export default ModalFeed
