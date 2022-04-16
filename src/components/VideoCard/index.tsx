import { useEffect, useRef } from 'react'
import { useHover, useMemoizedFn, useSafeState } from 'ahooks'
import { getVideoData, VideoData } from './card.service'
import { RecItem } from '../../define/recommend'
import dayjs from 'dayjs'
import PreviewImage from './PreviewImage'
import * as styles from './index.module.less'

const currentYear = dayjs().format('YYYY')
const getCdate = (ctime?: number) => {
  if (!ctime) return ''

  const dayCtime = dayjs.unix(ctime)
  if (dayCtime.format('YYYY') === currentYear) {
    return dayCtime.format('M-D')
  } else {
    return dayCtime.format('YY-M-D')
  }
}

export function VideoCard({ item }: { item: RecItem }) {
  // 预览 hover state
  const videoPreviewWrapperRef = useRef(null)
  const isHovering = useHover(videoPreviewWrapperRef)

  // 稍后再看 hover state
  const watchLaterRef = useRef(null)
  const isWatchLaterHovering = useHover(watchLaterRef)

  const {
    param: id, // 视频 id
    title,
    cover,

    goto,

    play,
    like,
    coin,
    desc,
    danmaku,
    ctime,
    duration,

    // author
    name,
    face,
  } = item

  let cdate = getCdate(ctime)

  const [videoData, setVideoData] = useSafeState<VideoData | null>(null)
  useEffect(() => {
    // first
    if (isHovering) {
      ;(async () => {
        const data = await getVideoData(id)
        setVideoData(data)
      })()
    } else {
      //
    }

    return () => {
      // second
    }
  }, [isHovering])

  // 稍候再看
  const onWatchLater = useMemoizedFn(() => {
    //
  })

  // 不喜欢
  const onDislike = useMemoizedFn(() => {
    //
  })

  // 撤销不喜欢
  const onCancelDislike = useMemoizedFn(() => {
    //
  })

  const href = item.goto === 'av' ? `/video/av${id}` : item.uri

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
          href={href}
          target='_blank'
          data-mod='partition_recommend'
          data-idx='content'
          data-ext='click'
        >
          <div className='bili-video-card__image __scale-player-wrap' ref={videoPreviewWrapperRef}>
            <div className='bili-video-card__image--wrap' style={{ overflow: 'hidden' }}>
              <div
                className='bili-watch-later'
                style={{ display: isHovering ? 'flex' : 'none' }}
                ref={watchLaterRef}
                onClick={onWatchLater}
              >
                <svg className='bili-watch-later__icon'>
                  <use xlinkHref='#widget-watch-later'></use>
                </svg>
                <span
                  className='bili-watch-later__tip'
                  style={{ display: isWatchLaterHovering ? 'block' : 'none' }}
                >
                  稍后再看
                </span>
              </div>

              <picture className='v-img bili-video-card__cover'>
                <source srcSet={`${cover}@672w_378h_1c.webp`} type='image/webp' />
                <img src={`${cover}@672w_378h_1c.webp`} alt={title} loading='lazy' />
              </picture>

              <div className='v-inline-player'></div>

              {/* preview */}
              {isHovering && videoData?.pvideoData ? (
                <PreviewImage
                  className={styles.previewCardWrapper}
                  item={item}
                  pvideo={videoData?.pvideoData}
                />
              ) : null}
            </div>

            <div className='bili-video-card__mask'>
              <div className='bili-video-card__stats'>
                <div className='bili-video-card__stats--left'>
                  {/* 播放 */}
                  <span className='bili-video-card__stats--item'>
                    <svg className='bili-video-card__stats--icon'>
                      <use xlinkHref='#widget-play-count'></use>
                    </svg>
                    <span className='bili-video-card__stats--text'>
                      {/* 3.2万 */}
                      {/* TODO: format */}
                      {play}
                    </span>
                  </span>
                  {/* 点赞 */}
                  <span className='bili-video-card__stats--item'>
                    <svg className='bili-video-card__stats--icon'>
                      <use xlinkHref='#widget-agree'></use>
                    </svg>
                    <span className='bili-video-card__stats--text'>
                      {/* TODO: format */}
                      {like}
                    </span>
                  </span>
                </div>
                {/* 时长 */}
                <span className='bili-video-card__stats__duration'>
                  {/* 06:55 */}
                  {/* TODO: format */}
                  {duration}
                </span>
              </div>
            </div>
          </div>
        </a>

        <div className='bili-video-card__info __scale-disable'>
          <div className='bili-video-card__info--right'>
            <a
              href={href}
              target='_blank'
              data-mod='partition_recommend'
              data-idx='content'
              data-ext='click'
            >
              <h3 className='bili-video-card__info--tit' title={title}>
                {title}
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
                <span className='bili-video-card__info--author'>{name}</span>
                {cdate ? <span className='bili-video-card__info--date'>· {cdate}</span> : null}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
