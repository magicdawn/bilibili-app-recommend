import { dislikedIds, Reason, showModalDislike, useDislikedReason } from '$components/ModalDislike'
import { RecItem } from '$define/recommend'
import { IconPark } from '$icon-park'
import { useSettingsSnapshot, settings } from '$settings'
import { toast, toastOperationFail, toastRequestFail } from '$utility/toast'
import { getCountStr, getDurationStr } from '$utility/video'
import { useEventListener, useHover, useMemoizedFn } from 'ahooks'
import cx from 'classnames'
import dayjs from 'dayjs'
import {
  ComponentProps,
  CSSProperties,
  memo,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  cancelDislike,
  getVideoData,
  VideoData,
  watchLaterAdd,
  watchLaterDel,
} from './card.service'
import styles from './index.module.less'
import { PreviewImage } from './PreviewImage'

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

const toHttps = (url: string) => url.replace(/^http:\/\//, 'https://')

type VideoCardProps = {
  style?: CSSProperties
  className?: string
  item?: RecItem
  loading?: boolean
} & ComponentProps<'div'>

export const VideoCard = memo(function VideoCard({
  style,
  className,
  item,
  loading,
  ...restProps
}: VideoCardProps) {
  // loading defaults to
  // true when item is not provided
  // false when item provided
  loading = loading ?? !item

  const skeleton = (
    <div className={cx('bili-video-card__skeleton', { hide: !loading })}>
      <div className='bili-video-card__skeleton--cover'></div>
      <div className='bili-video-card__skeleton--info'>
        <div className='bili-video-card__skeleton--right'>
          <p className='bili-video-card__skeleton--text'></p>
          <p className='bili-video-card__skeleton--text short'></p>
          <p className='bili-video-card__skeleton--light'></p>
        </div>
      </div>
    </div>
  )

  const dislikedReason = useDislikedReason(item?.param)

  return (
    <div
      style={style}
      className={cx('bili-video-card', styles.biliVideoCard, className)}
      data-report='partition_recommend.content'
      {...restProps}
    >
      {skeleton}
      {!loading &&
        item &&
        (dislikedReason ? (
          <DislikedCard item={item} dislikedReason={dislikedReason!} />
        ) : (
          <VideoCardInner item={item} />
        ))}
    </div>
  )
})

type DisabledCardProps = {
  item: RecItem
  dislikedReason: Reason
}
const DislikedCard = memo(function DislikedCard({ dislikedReason, item }: DisabledCardProps) {
  const onCancelDislike = useMemoizedFn(async () => {
    if (!dislikedReason?.id) return

    let success = false
    let err: Error | null = null
    try {
      success = await cancelDislike(item, dislikedReason.id)
    } catch (e) {
      err = e
    }

    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    success ? toast('已撤销') : toastOperationFail()
    if (success) {
      dislikedIds.delete(item.param)
    }
  })

  return (
    <div className={cx(styles.dislikedWrapper)}>
      <div className={styles.dislikeContentCover}>
        <div className={styles.dislikeContentCoverInner}>
          <IconPark name='DistraughtFace' size={32} className={styles.dislikeIcon} />
          <div className={styles.dislikeReason}>{dislikedReason?.name}</div>
          <div className={styles.dislikeDesc}>将减少此类内容推荐</div>
        </div>
      </div>
      <div className={styles.dislikeContentAction}>
        <button onClick={onCancelDislike}>
          <IconPark name='Return' size='16' style={{ marginRight: 4, marginTop: -2 }} />
          撤销
        </button>
      </div>
    </div>
  )
})

type VideoCardInnerProps = {
  item: RecItem
}
const VideoCardInner = memo(function VideoCardInner({ item }: VideoCardInnerProps) {
  // 预览 hover state
  const videoPreviewWrapperRef = useRef<HTMLDivElement>(null)
  const [enterMousePosition, setEnterMousePosition] = useState<{
    width: number
    height: number
    relativeX: number
  }>(() => ({ width: 0, height: 0, relativeX: 0 }))
  useEventListener(
    'mouseenter',
    (e: MouseEvent) => {
      const rect = videoPreviewWrapperRef.current?.getBoundingClientRect()
      if (!rect) return

      const { width, height, x } = rect
      setEnterMousePosition({
        width,
        height,
        // https://github.com/alibaba/hooks/blob/v3.7.0/packages/hooks/src/useMouse/index.ts#L62
        relativeX: e.pageX - window.pageXOffset - x,
      })
    },
    { target: videoPreviewWrapperRef }
  )
  const isHovering = useHover(videoPreviewWrapperRef)

  // 稍后再看 hover state
  const watchLaterRef = useRef(null)
  const isWatchLaterHovering = useHover(watchLaterRef)

  // watchLater added
  const [watchLaterAdded, setWatchLaterAdded] = useState(false)

  const { accessKey } = useSettingsSnapshot()
  const authed = Boolean(accessKey)

  const {
    param: id, // 视频 id
    title,
    cover: coverRaw,

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
    mid,

    // bangumi
    favorite,
    badge,

    // 推荐理由
    rcmd_reason,
  } = item

  const cdate = useMemo(() => getCdate(ctime), [ctime])
  const cover = useMemo(() => toHttps(coverRaw), [coverRaw])

  const [videoData, videoDataChange] = useState<VideoData | null>(null)
  const [isFetchingVideoData, isFetchingVideoDataChange] = useState(false)

  const tryFetchVideoData = useMemoizedFn(async () => {
    // already fetched
    if (videoData) return

    // fetching
    if (isFetchingVideoData) return

    try {
      isFetchingVideoDataChange(true)
      const data = await getVideoData(id)
      videoDataChange(data)
    } finally {
      isFetchingVideoDataChange(false)
    }
  })

  useEffect(() => {
    if (isHovering) tryFetchVideoData()
  }, [isHovering])

  /**
   * 稍候再看
   */

  let requesting = false
  const onToggleWatchLater = useMemoizedFn(async (e: MouseEvent) => {
    e.preventDefault()

    if (requesting) return
    requesting = true

    const fn = watchLaterAdded ? watchLaterDel : watchLaterAdd
    let successed = false
    try {
      successed = await fn(id)
    } finally {
      requesting = false
    }

    if (successed) {
      setWatchLaterAdded((val) => !val)
    }
  })

  /**
   * 不喜欢
   */
  const btnDislikeRef = useRef(null)
  const isBtnDislikeHovering = useHover(btnDislikeRef)
  const onTriggerDislike = useMemoizedFn((e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    showModalDislike(item)
  })

  const isBangumi = item.goto === 'bangumi'
  const isNormalVideo = item.goto === 'av'

  const href = isNormalVideo ? `/video/av${id}` : item.uri
  const durationStr = useMemo(() => getDurationStr(duration), [duration])
  const playStr = useMemo(() => getCountStr(play), [play])
  const likeStr = useMemo(() => getCountStr(like), [like])
  const favoriteStr = useMemo(() => getCountStr(favorite), [favorite])

  const onContextMenu = useMemoizedFn((e: MouseEvent) => {
    if (!settings.openInIINAWhenRightClick) return

    const fullHref = new URL(href, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')

    e.preventDefault()
  })

  return (
    <div className='bili-video-card__wrap __scale-wrap' onContextMenu={onContextMenu}>
      <a
        href={href}
        target='_blank'
        data-mod='partition_recommend'
        data-idx='content'
        data-ext='click'
      >
        <div className='bili-video-card__image __scale-player-wrap' ref={videoPreviewWrapperRef}>
          <div className={cx('bili-video-card__image--wrap', styles.imageWrapper)}>
            <picture className='v-img bili-video-card__cover'>
              <source srcSet={`${cover}@672w_378h_1c.webp`} type='image/webp' />
              <img src={`${cover}@672w_378h_1c.webp`} alt={title} loading='lazy' />
            </picture>

            {/* <div className='v-inline-player'></div> */}

            {/* preview */}
            {isHovering && (
              <PreviewImage
                item={item}
                pvideo={videoData?.pvideoData}
                enterCursorState={enterMousePosition}
              />
            )}

            {/* 稍后再看 */}
            <div
              className={`bili-watch-later ${styles.watchLater}`}
              style={{ display: isHovering ? 'flex' : 'none' }}
              ref={watchLaterRef}
              onClick={onToggleWatchLater}
            >
              <svg className='bili-watch-later__icon'>
                <use xlinkHref={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} />
              </svg>
              <span
                className='bili-watch-later__tip'
                style={{ display: isWatchLaterHovering ? 'block' : 'none' }}
              >
                {watchLaterAdded ? '移除' : '稍后再看'}
              </span>
            </div>

            {/*  我不想看 */}
            {authed && (
              <div
                ref={btnDislikeRef}
                className={styles.btnDislike}
                onClick={onTriggerDislike}
                style={{ display: isHovering ? 'flex' : 'none' }}
              >
                <svg className={styles.btnDislikeIcon}>
                  <use xlinkHref='#widget-close'></use>
                </svg>
                <span
                  className={styles.btnDislikeTip}
                  style={{ display: isBtnDislikeHovering ? 'block' : 'none' }}
                >
                  我不想看
                </span>
              </div>
            )}
          </div>

          <div className='bili-video-card__mask'>
            <div className='bili-video-card__stats'>
              <div className='bili-video-card__stats--left'>
                {/* 播放 */}
                <span className='bili-video-card__stats--item'>
                  <svg className='bili-video-card__stats--icon'>
                    <use xlinkHref='#widget-play-count'></use>
                  </svg>
                  <span className='bili-video-card__stats--text'>{playStr}</span>
                </span>

                {/* 点赞 */}
                <span className='bili-video-card__stats--item'>
                  {goto === 'av' ? (
                    <>
                      <svg className='bili-video-card__stats--icon'>
                        <use xlinkHref='#widget-agree'></use>
                      </svg>
                      <span className='bili-video-card__stats--text'>{likeStr}</span>
                    </>
                  ) : (
                    <>
                      <svg className='bili-video-card__stats--icon'>
                        <use xlinkHref='#widget-agree'></use>
                      </svg>
                      <span className='bili-video-card__stats--text'>{favoriteStr}</span>
                    </>
                  )}
                </span>
              </div>

              {/* 时长 */}
              {/* 番剧没有 duration 字段 */}
              <span className='bili-video-card__stats__duration'>
                {isNormalVideo && durationStr}
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
            {isNormalVideo && (
              <a
                className='bili-video-card__info--owner'
                href={`//space.bilibili.com/${mid}`}
                target='_blank'
                data-mod='partition_recommend'
                data-idx='content'
                data-ext='click'
              >
                {rcmd_reason?.content ? (
                  <span className={styles.recommendReason}>{rcmd_reason.content}</span>
                ) : (
                  <svg className='bili-video-card__info--owner__up'>
                    <use xlinkHref='#widget-up'></use>
                  </svg>
                )}

                <span className='bili-video-card__info--author'>{name}</span>
                {cdate && <span className='bili-video-card__info--date'>· {cdate}</span>}
              </a>
            )}

            {isBangumi && (
              <a className='bili-video-card__info--owner' href={href} target='_blank'>
                <span className={styles.badge}>{badge}</span>
                <span className={styles.bangumiDesc}>{desc}</span>
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  )
})
