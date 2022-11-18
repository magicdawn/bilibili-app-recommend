import { ModalConfig } from '$components/ModalConfig'
import { PureRecommend } from '$components/PureRecommend'
import { getHomeRecommend } from '$service'
import { config, useConfigSnapshot } from '$settings'
import Config from '@icon-park/react/lib/icons/Config'
import { useRequest } from 'ahooks'
import cx from 'classnames'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CollapseBtn, CollapseBtnRef } from '../CollapseBtn'
import { ModalFeed } from '../ModalFeed'
import { VideoCard } from '../VideoCard'
import { AccessKeyManage } from './AccessKeyManage'
import * as styles from './index.module.less'

export function RecHeader({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const { accessKey } = useConfigSnapshot()
  const collapseBtnRef = useRef<CollapseBtnRef>(null)

  const [showMore, setShowMore] = useState(() => config.initialShowMore)
  const onSeeMore = useCallback(() => {
    setShowMore(true)
  }, [])
  const onModalFeedHide = useCallback(() => {
    setShowMore(false)
  }, [])

  const [modalConfigVisible, setModalConfigVisible] = useState(false)
  const showModalConfig = useCallback(() => {
    setModalConfigVisible(true)
  }, [])
  const hideModalConfig = useCallback(() => {
    setModalConfigVisible(false)
  }, [])

  return (
    <>
      <div className='area-header'>
        <div className='left'>
          <a id='影视' className='the-world area-anchor' data-id='25'></a>
          <svg className='icon'>
            <use xlinkHref='#channel-cinephile'></use>
          </svg>
          <a className='title' href='#'>
            <span>推荐</span>
          </a>
        </div>

        <div className='right'>
          <button className={cx('primary-btn', styles.configBtn)} onClick={showModalConfig}>
            <Config theme='outline' size='24' fill='#333' className={styles.configIcon} />
          </button>

          {!accessKey ? (
            <AccessKeyManage />
          ) : (
            <CollapseBtn ref={collapseBtnRef}>
              <AccessKeyManage />
            </CollapseBtn>
          )}

          <button className='primary-btn roll-btn' onClick={onRefresh}>
            <svg style={{ transform: 'rotate(0deg)' }}>
              <use xlinkHref='#widget-roll'></use>
            </svg>
            <span>换一换</span>
          </button>

          <button className='primary-btn see-more' onClick={onSeeMore}>
            <span>查看更多</span>
            <svg>
              <use xlinkHref='#widget-arrow'></use>
            </svg>
          </button>
        </div>
      </div>
      <ModalFeed show={showMore} onHide={onModalFeedHide} />
      <ModalConfig show={modalConfigVisible} onHide={hideModalConfig} />
    </>
  )
}

export function SectionRecommend({ internalTesting = false }) {
  const { accessKey, pureRecommend } = useConfigSnapshot()
  const collapseBtnRef = useRef<CollapseBtnRef>(null)

  const skeletonPlaceholders = useMemo(() => {
    return new Array(20).fill(0).map(() => {
      return crypto.randomUUID()
    })
  }, [])

  const { data: items, loading, error, refresh } = useRequest(getHomeRecommend)

  // log error
  if (error) {
    console.error(error.stack || error)
  }

  const [showMore, setShowMore] = useState(() => config.initialShowMore)
  const onSeeMore = useCallback(() => {
    setShowMore(true)
  }, [])
  const onModalFeedHide = useCallback(() => {
    setShowMore(false)
  }, [])

  const [modalConfigVisible, setModalConfigVisible] = useState(false)
  const showModalConfig = useCallback(() => {
    setModalConfigVisible(true)
  }, [])
  const hideModalConfig = useCallback(() => {
    setModalConfigVisible(false)
  }, [])

  return (
    <section
      className={cx('bili-grid', { 'no-margin': !internalTesting }, styles.grid)}
      data-area='推荐'
    >
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
        <RecHeader onRefresh={refresh} />
        <div className='video-card-body more-class1 more-class2'>
          {loading || error
            ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
            : items!.map((item) => {
                return <VideoCard key={item.uniqId} item={item} />
              })}
        </div>
      </div>
    </section>
  )
}
