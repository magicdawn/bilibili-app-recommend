import cx from 'classnames'
import { useMemoizedFn, useSafeState } from 'ahooks'
import { RecItem } from '@define'
import recommendData from '@define/recommend.json'
import { config } from '@settings'
import { VideoCard } from './VideoCard'
import * as styles from './section.module.less'
import { auth } from '@utility/auth'
import { useState } from 'react'

export function SectionRecommend() {
  const [accessKey, setAccessKey] = useState(config.access_key)

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

  return (
    <section className={cx('bili-grid no-margin', styles.grid)} data-area='App 推荐流'>
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
        <div className='area-header'>
          <div className='left'>
            <a id='影视' className='the-world area-anchor' data-id='25'></a>
            <svg className='icon'>
              <use xlinkHref='#channel-cinephile'></use>
            </svg>
            <a className='title' href='https://www.bilibili.com/v/cinephile' target='_blank'>
              <span>App 推荐流</span>
            </a>
          </div>

          <div className='right'>
            {!accessKey ? (
              <button className='primary-btn roll-btn' onClick={onGetAuth}>
                <span>获取 access_key</span>
              </button>
            ) : null}

            <button className='primary-btn roll-btn'>
              <svg style={{ transform: 'rotate(0deg)' }}>
                <use xlinkHref='#widget-roll'></use>
              </svg>
              <span>换一换</span>
            </button>

            <a
              className='primary-btn see-more'
              href='https://www.bilibili.com/v/cinephile'
              target='_blank'
            >
              <span>查看更多</span>
              <svg>
                <use xlinkHref='#widget-arrow'></use>
              </svg>
            </a>
          </div>
        </div>

        <div className='video-card-body'>
          {recommendData.data.map((item) => {
            return <VideoCard key={item.param} item={item as RecItem} />
          })}
        </div>
      </div>
    </section>
  )
}
