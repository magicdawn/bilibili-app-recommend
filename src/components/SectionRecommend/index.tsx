import { getHomeRecommend } from '$service'
import { config, useConfigSnapshot } from '$settings'
import { auth, deleteAccessToken } from '$utility/auth'
import { useMemoizedFn, useRequest } from 'ahooks'
import cx from 'classnames'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CollapseBtn, CollapseBtnRef } from '../CollapseBtn'
import { ModalFeed } from '../ModalFeed'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'

export function SectionRecommend({ internalTesting = false }) {
  const collapseBtnRef = useRef<CollapseBtnRef>(null)
  const { accessKey } = useConfigSnapshot()

  const useAuthRequest = useRequest(auth, { manual: true })

  const onGetAuth = useMemoizedFn(async () => {
    const accessKey = await useAuthRequest.runAsync()
    if (accessKey) {
      collapseBtnRef.current?.set(false)
    }
  })

  const onDeleteAccessToken = deleteAccessToken

  const onExplainAccessKey = useMemoizedFn(() => {
    const explainUrl =
      'https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
    window.open(explainUrl, '_blank')
  })

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

  return (
    <section
      className={cx('bili-grid', { 'no-margin': !internalTesting }, styles.grid)}
      data-area='推荐'
    >
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
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
            {!accessKey ? (
              <>
                <button className='primary-btn roll-btn' onClick={onExplainAccessKey}>
                  <span>access_key 说明</span>
                </button>
                <button
                  className='primary-btn roll-btn'
                  onClick={onGetAuth}
                  disabled={useAuthRequest.loading}
                >
                  <span>获取 access_key</span>
                </button>
              </>
            ) : (
              <CollapseBtn ref={collapseBtnRef}>
                <button className='primary-btn roll-btn' onClick={onExplainAccessKey}>
                  <span>access_key 说明</span>
                </button>
                <button
                  className='primary-btn roll-btn'
                  onClick={() => onGetAuth()}
                  disabled={useAuthRequest.loading}
                >
                  <span>重新获取 access_key</span>
                </button>
                <button className='primary-btn roll-btn' onClick={onDeleteAccessToken}>
                  <span>删除 access_key</span>
                </button>
              </CollapseBtn>
            )}

            <button className='primary-btn roll-btn' onClick={refresh}>
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
