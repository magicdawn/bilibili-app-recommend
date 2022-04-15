export function VideoCard() {
  return (
    <div className='bili-video-card' data-report='partition_recommend.content'>
      <div className='bili-video-card__skeleton hide'>
        <div className='bili-video-card__skeleton--cover'></div>
        <div className='bili-video-card__skeleton--info'>
          <div className='bili-video-card__skeleton--right'>
            <p className='bili-video-card__skeleton--text'></p>
            <p className='bili-video-card__skeleton--text short'></p>
            <p className='bili-video-card__skeleton--light'></p>
          </div>
        </div>
      </div>

      <div className='bili-video-card__wrap __scale-wrap'>
        <a
          href='//www.bilibili.com/video/BV1Tq4y1v7u7'
          target='_blank'
          data-mod='partition_recommend'
          data-idx='content'
          data-ext='click'
        >
          <div className='bili-video-card__image __scale-player-wrap'>
            <div className='bili-video-card__image--wrap'>
              <div className='bili-watch-later' style={{ display: 'none' }}>
                <svg className='bili-watch-later__icon'>
                  <use xlinkHref='#widget-watch-later'></use>
                </svg>
                <span className='bili-watch-later__tip' style={{ display: 'none' }}></span>
              </div>

              <picture className='v-img bili-video-card__cover'>
                <source
                  srcSet='//i0.hdslb.com/bfs/archive/5d73a5c69b5c15839f7036bb4c938cdcfcf46f93.jpg@672w_378h_1c.webp'
                  type='image/webp'
                />
                <img
                  src='//i0.hdslb.com/bfs/archive/5d73a5c69b5c15839f7036bb4c938cdcfcf46f93.jpg@672w_378h_1c'
                  alt='善恶终有报，天道好轮回'
                  loading='lazy'
                />
              </picture>

              <div className='v-inline-player'></div>
            </div>

            <div className='bili-video-card__mask'>
              <div className='bili-video-card__stats'>
                <div className='bili-video-card__stats--left'>
                  <span className='bili-video-card__stats--item'>
                    <svg className='bili-video-card__stats--icon'>
                      <use xlinkHref='#widget-play-count'></use>
                    </svg>
                    <span className='bili-video-card__stats--text'>3.2万</span>
                  </span>
                  <span className='bili-video-card__stats--item'>
                    <svg className='bili-video-card__stats--icon'>
                      <use xlinkHref='#widget-agree'></use>
                    </svg>
                    <span className='bili-video-card__stats--text'>1955</span>
                  </span>
                </div>
                <span className='bili-video-card__stats__duration'>06:55</span>
              </div>
            </div>
          </div>
        </a>

        <div className='bili-video-card__info __scale-disable'>
          <div className='bili-video-card__info--right'>
            <a
              href='//www.bilibili.com/video/BV1Tq4y1v7u7'
              target='_blank'
              data-mod='partition_recommend'
              data-idx='content'
              data-ext='click'
            >
              <h3 className='bili-video-card__info--tit' title='善恶终有报，天道好轮回'>
                善恶终有报，天道好轮回
              </h3>
            </a>
            <p className='bili-video-card__info--bottom'>
              <a
                className='bili-video-card__info--owner'
                href='//space.bilibili.com/248381012'
                target='_blank'
                data-mod='partition_recommend'
                data-idx='content'
                data-ext='click'
              >
                <svg className='bili-video-card__info--owner__up'>
                  <use xlinkHref='#widget-up'></use>
                </svg>
                <span className='bili-video-card__info--author'>海绵宝宝能吃吗</span>
                <span className='bili-video-card__info--date'>· 3-21</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
