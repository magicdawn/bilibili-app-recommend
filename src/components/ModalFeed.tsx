import { useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import * as styles from './ModalFeed.module.less'
import mockRecommendData from '@define/recommend.json'
import { VideoCard } from './VideoCard'
import { RecItem } from '@define'

interface IProps {
  show: boolean
  onHide: () => void
}

function ModalFeed({ show, onHide }: IProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const content = wrapper.querySelector<HTMLDivElement>('.modal-content')
    if (!content) return

    Object.assign(content.style, {
      backgroundColor: window.getComputedStyle(document.body)['background-color'],
      color: window.getComputedStyle(document.body)['color'],
    })
  }, [show, wrapperRef.current])

  return (
    <div ref={wrapperRef}>
      <Modal
        show={show}
        onHide={onHide}
        backdrop='static'
        className={styles.modal}
        dialogClassName={styles.modalDialog}
        contentClassName={styles.modalContent}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='video-card-list is-full'>
            <div className='video-card-body'>
              {mockRecommendData.data.map((item) => {
                return <VideoCard className={styles.card} key={item.param} item={item as RecItem} />
              })}
            </div>
          </div>
          <div className='list'>
            {/* {items.map((item) => {
              return <VideoCard key={item.param} item={item} />
            })} */}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default ModalFeed
