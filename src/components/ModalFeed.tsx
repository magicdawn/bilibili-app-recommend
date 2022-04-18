import { useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { useMemoizedFn, useSafeState } from 'ahooks'
import InfiniteScroll from 'react-infinite-scroller'
import { RecItem } from '@define'
import { VideoCard } from './VideoCard'
import { getRecommendTimes } from '@service'
import * as styles from './ModalFeed.module.less'
import delay from 'delay'

interface IProps {
  show: boolean
  onHide: () => void
}

function ModalFeed({ show, onHide }: IProps) {
  const wrapperRef = useRef<any>(null)

  // 打开时判断深色模式等
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const content = (wrapper.dialog as HTMLElement)?.querySelector<HTMLDivElement>('.modal-content')
    if (!content) return

    const bg = window.getComputedStyle(document.body)['background-color']
    const c = window.getComputedStyle(document.body)['color']

    content.style.setProperty('--bg', bg)
    content.style.setProperty('--c', c)
    content.style.setProperty('background-color', 'var(--bg)')
    content.style.setProperty('color', 'var(--c)')
  }, [show])

  const [items, setItems] = useSafeState<RecItem[]>([])

  const refresh = useMemoizedFn(async () => {
    // scroll to top
    const modalBody = (wrapperRef.current?.dialog as HTMLElement)?.querySelector<HTMLDivElement>(
      '.modal-body'
    )
    if (modalBody) {
      modalBody.scrollTop = 0
    }

    // load
    await delay(50)
    setItems(await getRecommendTimes(2))
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    const more = await getRecommendTimes(2)
    setItems((items) => [...items, ...more])
  })

  useEffect(() => {
    // reset
    if (!show) setItems([])
  }, [show])

  return (
    <Modal
      ref={wrapperRef}
      show={show}
      onHide={onHide}
      backdrop='static'
      className={styles.modal}
      dialogClassName={styles.modalDialog}
      contentClassName={styles.modalContent}
      scrollable={false}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title>推荐</Modal.Title>

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
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
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
      </Modal.Body>
    </Modal>
  )
}

export default ModalFeed
