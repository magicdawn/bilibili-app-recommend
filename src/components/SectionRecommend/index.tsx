import cx from 'classnames'
import { useMemoizedFn, useMount, useSafeState, useToggle } from 'ahooks'
import { RecItem } from '@define'
import { useConfigStore } from '@settings'
import { auth, deleteAccessToken } from '@utility/auth'
import { getHomeRecommend } from '@service'
import { ModalFeed } from '../ModalFeed'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'
import { CollapseBtn, CollapseBtnRef } from '@components/CollapseBtn'
import { useCallback, useRef } from 'react'

export function SectionRecommend() {
  const collapseBtnRef = useRef<CollapseBtnRef>(null)
  const { accessKey } = useConfigStore()

  const onGetAuth = useMemoizedFn(async (refresh = false) => {
    const accessKey = await auth()
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

  const [items, setItems] = useSafeState<RecItem[]>([])
  const [loading, setLoading] = useSafeState(false)

  const refresh = useMemoizedFn(async () => {
    setLoading(true)
    try {
      const items = await getHomeRecommend()
      setItems(items)
    } finally {
      setLoading(false)
    }
  })

  useMount(async () => {
    refresh()
  })

  // FIXME: restore when release
  // const [showMore, setShowMore] = useSafeState(true)
  const [showMore, setShowMore] = useSafeState(false)

  const onSeeMore = useCallback(() => {
    setShowMore(true)
  }, [])
  const onModalFeedHide = useCallback(() => {
    setShowMore(false)
  }, [])

  return (
    <section className={cx('bili-grid no-margin', styles.grid)} data-area='推荐'>
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
                <button className='primary-btn roll-btn' onClick={onGetAuth}>
                  <span>获取 access_key</span>
                </button>
              </>
            ) : (
              <CollapseBtn ref={collapseBtnRef}>
                <button className='primary-btn roll-btn' onClick={onExplainAccessKey}>
                  <span>access_key 说明</span>
                </button>
                <button className='primary-btn roll-btn' onClick={() => onGetAuth(true)}>
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
          {items.map((item) => {
            return <VideoCard key={item.param} item={item} loading={loading} />
          })}
          {/* {mockRecommendData.data.map((item) => {
            // @ts-ignore
            return <VideoCard key={item.param} item={item} />
          })} */}
        </div>
      </div>
    </section>
  )
}
