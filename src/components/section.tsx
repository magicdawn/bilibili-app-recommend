import React from 'react'
import { VideoCard } from './card'

export function SectionRecommend() {
  return (
    <section className='bili-grid no-margin' data-area='App推荐内容'>
      <div className='battle-area'>
        <div className='area-header'>
          <div className='left'>
            <a id='影视' className='the-world area-anchor' data-id='25'></a>
            <svg className='icon'>
              <use xlinkHref='#channel-cinephile'></use>
            </svg>
            <a className='title' href='https://www.bilibili.com/v/cinephile' target='_blank'>
              <span>App推荐内容</span>
            </a>
          </div>

          <div className='right'>
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

        <div className='battle-body'>
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
        </div>
      </div>
    </section>
  )
}
