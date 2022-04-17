import cx from 'classnames'
import { useMemoizedFn, useMount, useSafeState } from 'ahooks'
import { RecItem } from '@define'
import { config } from '@settings'
import { VideoCard } from './VideoCard'
import * as styles from './section.module.less'
import { auth } from '@utility/auth'
import { getHomeRecommend } from '@service'

import mockRecommendData from '../define/recommend.json'
import { useState } from 'react'
import ModalFeed from './ModalFeed'

export function SectionRecommend() {
  const [accessKey, setAccessKey] = useSafeState(config.access_key)

  const onGetAuth = useMemoizedFn(async () => {
    if (config.access_key) {
      setAccessKey(config.access_key)
      return
    }

    const accessKey = await auth()
    if (accessKey) {
      setAccessKey(accessKey)
      return
    }
  })

  const [items, setItems] = useSafeState<RecItem[]>([])

  const refresh = useMemoizedFn(async () => {
    const items = await getHomeRecommend()
    setItems(items)
  })

  useMount(async () => {
    refresh()
  })

  const [showMore, setShowMore] = useState(false)

  const onSeeMore = useMemoizedFn(() => {
    setShowMore(true)
  })

  return (
    <section className={cx('bili-grid no-margin', styles.grid)} data-area='App 推荐流'>
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
        <div className='area-header'>
          <div className='left'>
            <a id='影视' className='the-world area-anchor' data-id='25'></a>
            <svg className='icon'>
              <use xlinkHref='#channel-cinephile'></use>
            </svg>
            <a className='title' href='#'>
              <span>App 推荐流</span>
            </a>
          </div>

          <div className='right'>
            {!accessKey ? (
              <button className='primary-btn roll-btn' onClick={onGetAuth}>
                <span>获取 access_key</span>
              </button>
            ) : null}

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

        <ModalFeed show={showMore} onHide={() => setShowMore(false)} />

        <div className='video-card-body more-class1 more-class2'>
          {items.map((item) => {
            return <VideoCard key={item.param} item={item} />
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
