import { APP_KEY_PREFIX, APP_NAME } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import { AntdTooltip } from '$components/AntdApp'
import { Reason, dislikedIds, showModalDislike, useDislikedReason } from '$components/ModalDislike'
import { colorPrimaryValue } from '$components/ModalSettings/theme'
import { AppRecItem, AppRecItemExtend, RecItemType } from '$define'
import { IconPark } from '$icon-park'
import { isMac, isSafari } from '$platform'
import { formatFavFolderUrl } from '$service/fav'
import { useWatchLaterState, watchLaterState } from '$service/watchlater'
import { settings, useSettingsSnapshot } from '$settings'
import { toast, toastOperationFail, toastRequestFail } from '$utility/toast'
import { formatCount } from '$utility/video'
import {
  useEventListener,
  useGetState,
  useHover,
  useMemoizedFn,
  useRafState,
  useUnmountedRef,
  useUpdateEffect,
} from 'ahooks'
import { Dropdown, MenuProps } from 'antd'
import cx from 'classnames'
import delay from 'delay'
import mitt, { Emitter } from 'mitt'
import {
  CSSProperties,
  ComponentProps,
  MouseEvent,
  RefObject,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { PreviewImage } from './PreviewImage'
import { AppRecIconSvgNameMap, statItemForId } from './app-rec-icon'
import {
  VideoData,
  cancelDislike,
  getVideoData,
  getVideoFavState,
  removeFav,
  watchLaterAdd,
  watchLaterDel,
} from './card.service'
import styles from './index.module.less'
import { IVideoCardData, normalizeCardData } from './process/normalize'

const toHttps = (url: string) => (url || '').replace(/^http:\/\//, 'https://')

function copyContent(content: string) {
  GM.setClipboard(content)
  toast(`已复制: ${content}`)
}

export type VideoCardEvents = {
  // for cancel card
  'cancel-dislike': void | undefined

  // for normal card
  'open': void | undefined
  'toggle-watch-later': void | undefined
  'trigger-dislike': void | undefined
  'start-preview-animation': void | undefined
  'hotkey-preview-animation': void | undefined
}

export type VideoCardEmitter = Emitter<VideoCardEvents>

const defaultEmitter = mitt<VideoCardEvents>()

export type VideoCardProps = {
  style?: CSSProperties
  className?: string
  loading?: boolean
  active?: boolean // 键盘 active
  item?: RecItemType
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  emitter?: VideoCardEmitter
} & ComponentProps<'div'>

const borderRadiusStyle: CSSProperties = {
  borderRadius: 'var(--video-card-border-radius)',
}

export const VideoCard = memo(function VideoCard({
  style,
  className,
  item,
  loading,
  active,
  onRemoveCurrent,
  onMoveToFirst,
  emitter,
  ...restProps
}: VideoCardProps) {
  // loading defaults to
  // true when item is not provided
  // false when item provided
  loading = loading ?? !item

  const skeleton = (
    <div
      className={cx('bili-video-card__skeleton', {
        hide: !loading,
        [styles.skeletonActive]: loading,
      })}
    >
      <div className='bili-video-card__skeleton--cover' style={borderRadiusStyle} />
      <div className='bili-video-card__skeleton--info'>
        <div className='bili-video-card__skeleton--right'>
          <p className='bili-video-card__skeleton--text'></p>
          <p className='bili-video-card__skeleton--text short'></p>
          <p className='bili-video-card__skeleton--light'></p>
        </div>
      </div>
    </div>
  )

  const dislikedReason = useDislikedReason(item?.api === 'app' && item.param)

  return (
    <div
      style={style}
      className={cx('bili-video-card', styles.biliVideoCard, className)}
      {...restProps}
    >
      {skeleton}
      {!loading &&
        item &&
        (dislikedReason ? (
          <DislikedCard
            item={item as AppRecItemExtend}
            emitter={emitter}
            dislikedReason={dislikedReason!}
          />
        ) : (
          <VideoCardInner
            item={item!}
            active={active}
            emitter={emitter}
            onRemoveCurrent={onRemoveCurrent}
            onMoveToFirst={onMoveToFirst}
          />
        ))}
    </div>
  )
})

const DislikedCard = memo(function DislikedCard({
  dislikedReason,
  item,
  emitter = defaultEmitter,
}: {
  item: AppRecItem
  dislikedReason: Reason
  emitter?: VideoCardEmitter
}) {
  const onCancelDislike = useMemoizedFn(async () => {
    if (!dislikedReason?.id) return

    let success = false
    let err: Error | undefined
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

  useMittOn(emitter, 'cancel-dislike', onCancelDislike)

  return (
    <div className={cx(styles.dislikedWrapper)}>
      <div className={styles.dislikeContentCover}>
        <div className={styles.dislikeContentCoverInner}>
          <IconPark name='DistraughtFace' size={32} className={styles.dislikeIcon} />
          <div className={styles.dislikeReason}>{dislikedReason?.name}</div>
          <div className={styles.dislikeDesc}>{dislikedReason?.toast || '将减少此类内容推荐'}</div>
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
  item: RecItemType
  active?: boolean
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  emitter?: VideoCardEmitter
}
const VideoCardInner = memo(function VideoCardInner({
  item,
  active = false,
  onRemoveCurrent,
  onMoveToFirst,
  emitter = defaultEmitter,
}: VideoCardInnerProps) {
  const isPc = item.api === 'pc'
  const isApp = item.api === 'app'
  const isDynamic = item.api === 'dynamic'
  const isWatchlater = item.api === 'watchlater'
  const isFav = item.api === 'fav'

  const cardData = useMemo(() => normalizeCardData(item), [item])
  const {
    // video
    avid,
    bvid,
    goto,
    href,
    title,
    titleRender,
    coverRaw,
    pubdateDisplay,
    pubdateDisplayTitle,
    duration,
    durationStr,
    recommendReason,
    invalidReason,

    // stat
    play,
    like,
    coin,
    danmaku,
    favorite,

    // author
    authorName,
    authorFace,
    authorMid,

    // adpater specific
    appBadge,
    appBadgeDesc,
  } = cardData

  const isNormalVideo = goto === 'av'
  if (!['av', 'bangumi', 'picture'].includes(goto)) {
    console.warn(`[${APP_NAME}]: none (av,bangumi,picture) goto type %s`, goto, item)
  }

  /**
   * transformed
   */
  const cover = useMemo(() => toHttps(coverRaw), [coverRaw])

  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const isFetchingVideoData = useRef(false)

  const tryFetchVideoData = useMemoizedFn(async () => {
    // already fetched
    if (videoData) return
    // fetching
    if (isFetchingVideoData.current) return

    try {
      isFetchingVideoData.current = true
      setVideoData(await getVideoData(avid))
    } finally {
      isFetchingVideoData.current = false
    }
  })

  /**
   * 预览 hover state
   */

  const videoPreviewWrapperRef = useRef<HTMLDivElement>(null)
  const [mouseEnterRelativeX, setMouseEnterRelativeX] = useState<number | undefined>(undefined)
  useEventListener(
    'mouseenter',
    (e: MouseEvent) => {
      const rect = videoPreviewWrapperRef.current?.getBoundingClientRect()
      if (!rect) return

      // https://github.com/alibaba/hooks/blob/v3.7.0/packages/hooks/src/useMouse/index.ts#L62
      const { x } = rect
      const relativeX = e.pageX - window.pageXOffset - x
      setMouseEnterRelativeX(relativeX)
    },
    { target: videoPreviewWrapperRef }
  )
  const isHovering = useHover(videoPreviewWrapperRef)
  const { autoPreviewWhenHover } = useSettingsSnapshot()

  const { onStartPreviewAnimation, onHotkeyPreviewAnimation, previewAnimationProgress } =
    usePreviewAnimation({
      bvid,
      title,
      autoPreviewWhenHover,
      active,
      tryFetchVideoData,
      videoPreviewWrapperRef,
    })

  useUpdateEffect(() => {
    if (!active) return

    // update global item data for debug
    try {
      unsafeWindow[`${APP_KEY_PREFIX}_activeItem`] = item
    } catch (e) {
      console.warn('set unsafeWindow activeItem error')
      console.warn(e.stack || e)
    }

    // 自动开始预览
    if (settings.autoPreviewWhenKeyboardSelect) {
      onStartPreviewAnimation()
    }
  }, [active])

  // 稍后再看 hover state
  const watchLaterRef = useRef(null)
  const isWatchLaterHovering = useHover(watchLaterRef)

  // watchLater added
  const watchLaterAdded = useWatchLaterState(bvid)

  const { accessKey } = useSettingsSnapshot()
  const authed = Boolean(accessKey)

  useEffect(() => {
    if (isHovering) tryFetchVideoData()
  }, [isHovering])

  /**
   * 稍候再看
   */

  const requestingWatchLaterApi = useRef(false)
  const onToggleWatchLater = useMemoizedFn(
    async (e?: MouseEvent, usingAction?: typeof watchLaterDel | typeof watchLaterAdd) => {
      e?.preventDefault()

      usingAction ??= watchLaterAdded ? watchLaterDel : watchLaterAdd
      if (usingAction !== watchLaterAdd && usingAction !== watchLaterDel) {
        throw new Error('unexpected usingAction provided')
      }

      if (requestingWatchLaterApi.current) return
      requestingWatchLaterApi.current = true

      let success = false
      try {
        success = await usingAction(avid)
      } finally {
        requestingWatchLaterApi.current = false
      }

      if (success) {
        const targetState = usingAction === watchLaterAdd ? true : false
        if (targetState) {
          watchLaterState.bvidSet.add(bvid)
        } else {
          watchLaterState.bvidSet.delete(bvid)
        }

        // when remove-watchlater for watchlater tab, remove this card
        if (item.api === 'watchlater' && targetState === false) {
          await delay(100)
          onRemoveCurrent?.(item, cardData)
        }
      }

      return success
    }
  )

  /**
   * 不喜欢
   */
  const btnDislikeRef = useRef(null)
  const isBtnDislikeHovering = useHover(btnDislikeRef)
  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()

    if (!hasDislikeEntry) {
      if (item.api !== 'app') {
        return toast('当前视频不支持提交「我不想看」')
      }
      if (!authed) {
        return toast('请先获取 access_key')
      }
      return
    }

    showModalDislike(item)
  })

  const playStr = useMemo(() => formatCount(play), [play])
  const likeStr = useMemo(() => formatCount(like), [like])
  const _favoriteStr = useMemo(() => formatCount(favorite), [favorite])
  const favoriteStr = isPc ? likeStr : _favoriteStr

  const statItem = ({
    text,
    iconSvgName,
    iconSvgScale,
  }: {
    text: string
    iconSvgName: string
    iconSvgScale?: number
  }) => {
    return (
      <span className='bili-video-card__stats--item'>
        <svg
          className='bili-video-card__stats--icon'
          style={{ transform: iconSvgScale ? `scale(${iconSvgScale})` : undefined }}
        >
          <use href={iconSvgName}></use>
        </svg>
        <span className='bili-video-card__stats--text'>{text}</span>
      </span>
    )
  }

  /**
   * 收藏状态
   */
  const [favFolderNames, setFavFolderNames] = useState<string[] | undefined>(undefined)
  const updateFavFolderNames = useMemoizedFn(async () => {
    // 只在「稍后再看」提供收藏状态
    if (item.api !== 'watchlater') return
    const names = await getVideoFavState(avid)
    if (names) {
      setFavFolderNames(names)
    }
  })

  /**
   * expose actions
   */

  const onOpen = useMemoizedFn(() => {
    window.open(href, '_blank')
  })

  useMittOn(emitter, 'open', onOpen)
  useMittOn(emitter, 'toggle-watch-later', () => onToggleWatchLater())
  useMittOn(emitter, 'trigger-dislike', () => onTriggerDislike())
  useMittOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useMittOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

  const hasDislikeEntry = isApp && authed

  /**
   * context menu
   */

  const onCopyLink = useMemoizedFn(() => {
    let content = href
    if (href.startsWith('/')) {
      content = new URL(href, location.href).href
    }
    copyContent(content)
  })

  const onOpenInIINA = useMemoizedFn(() => {
    let usingHref = href
    if (item.api === 'watchlater') usingHref = `/video/${item.bvid}`
    const fullHref = new URL(usingHref, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')
  })

  const contextMenus: MenuProps['items'] = useMemo(() => {
    const watchLaterLabel = watchLaterAdded ? '移除稍后再看' : '稍后再看'

    return [
      {
        key: 'open-link',
        label: '打开',
        icon: <IconPark name='EfferentFour' size={15} />,
        onClick: onOpen,
      },

      { type: 'divider' as const },
      {
        key: 'copy-link',
        label: '复制视频链接',
        icon: <IconPark name='Copy' size={15} />,
        onClick: onCopyLink,
      },
      {
        key: 'copy-bvid',
        label: '复制 BVID',
        icon: <IconPark name='Copy' size={15} />,
        onClick() {
          copyContent(bvid)
        },
      },

      { type: 'divider' as const },
      hasDislikeEntry && {
        key: 'dislike',
        label: '我不想看',
        icon: <IconPark name='DislikeTwo' size={15} />,
        onClick() {
          onTriggerDislike()
        },
      },
      {
        key: 'watchlater',
        label:
          item.api === 'watchlater' && favFolderNames ? (
            <AntdTooltip
              title={
                <>
                  {favFolderNames.length
                    ? `已收藏在${favFolderNames.map((n) => `「${n}」`).join('')}`
                    : '未收藏'}
                </>
              }
              placement='right'
            >
              <span
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {watchLaterLabel}
                <IconPark
                  name='Star'
                  size={15}
                  style={{ marginLeft: 15 }}
                  {...(favFolderNames.length
                    ? {
                        theme: 'two-tone',
                        fill: ['currentColor', colorPrimaryValue],
                      }
                    : undefined)}
                />
              </span>
            </AntdTooltip>
          ) : (
            watchLaterLabel
          ),
        icon: <IconPark name={watchLaterAdded ? 'Delete' : 'FileCabinet'} size={15} />,
        onClick() {
          onToggleWatchLater()
        },
      },
      item.api === 'watchlater' &&
        watchLaterAdded && {
          key: 'watchlater-readd',
          label: '重新添加稍候再看 (移到最前)',
          icon: <IconPark name='AddTwo' size={15} />,
          async onClick() {
            const success = await onToggleWatchLater(undefined, watchLaterAdd)
            if (!success) return
            onMoveToFirst?.(item, cardData)
          },
        },

      ...(item.api === 'fav'
        ? [
            { type: 'divider' as const },
            {
              key: 'open-fav-folder',
              label: '浏览收藏夹',
              icon: <IconPark name='EfferentFour' size={15} />,
              onClick() {
                const { id } = item.folder
                const url = formatFavFolderUrl(id)
                window.open(url, '_blank')
              },
            },
            {
              key: 'remove-fav',
              label: '移除收藏',
              icon: <IconPark name='Delete' size={15} />,
              async onClick() {
                if (item.api !== 'fav') return
                const success = await removeFav(item.folder.id, `${item.id}:${item.type}`)
                if (success) {
                  onRemoveCurrent?.(item, cardData)
                }
              },
            },
          ]
        : []),

      ...(isMac
        ? [
            { type: 'divider' as const },
            {
              key: 'open-in-iina',
              label: '在 IINA 中打开',
              icon: <IconPark name='PlayTwo' size={15} />,
              onClick: onOpenInIINA,
            },
          ]
        : []),
    ].filter(Boolean)
  }, [item, watchLaterAdded, hasDislikeEntry, favFolderNames])

  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    updateFavFolderNames()
  })

  return (
    <div className='bili-video-card__wrap __scale-wrap'>
      <Dropdown
        menu={{ items: contextMenus }}
        trigger={['contextMenu']}
        onOpenChange={onContextMenuOpenChange}
      >
        <a href={href} target='_blank'>
          <div
            className='bili-video-card__image __scale-player-wrap'
            ref={videoPreviewWrapperRef}
            style={{ ...borderRadiusStyle, aspectRatio: '16 / 9' }}
          >
            {/* __image--wrap 上有 padding-top: 56.25% = 9/16, 用于保持高度, 在 firefox 中有明显的文字位移 */}
            {/* picture: absolute, top:0, left: 0  */}
            {/* 故加上 aspect-ratio: 16/9 */}
            <div className='bili-video-card__image--wrap' style={{ borderRadius: 'inherit' }}>
              <picture
                className='v-img bili-video-card__cover'
                style={{ borderRadius: 'inherit', overflow: 'hidden' }}
              >
                {!isSafari && (
                  <source
                    srcSet={`${cover}@672w_378h_1c_!web-home-common-cover.avif`}
                    type='image/avif'
                  />
                )}
                <source
                  srcSet={`${cover}@672w_378h_1c_!web-home-common-cover.webp`}
                  type='image/webp'
                />
                <img
                  src={`${cover}@672w_378h_1c_!web-home-common-cover`}
                  loading='eager'
                  // in firefox, alt text is visible during loading
                  // alt={title}
                />
              </picture>

              {/* <div className='v-inline-player'></div> */}

              {/* preview */}
              {/* follow-mouse or manual-control */}
              {(isHovering || typeof previewAnimationProgress === 'number') && (
                <PreviewImage
                  videoDuration={duration}
                  pvideo={videoData?.pvideoData}
                  mouseEnterRelativeX={mouseEnterRelativeX}
                  previewAnimationProgress={previewAnimationProgress}
                />
              )}

              {/* 稍后再看 */}
              <div
                className={`bili-watch-later ${styles.watchLater}`}
                style={{
                  display: isHovering || active ? 'flex' : 'none',
                }}
                ref={watchLaterRef}
                onClick={onToggleWatchLater}
              >
                <svg className='bili-watch-later__icon'>
                  <use href={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} />
                </svg>
                <span
                  className='bili-watch-later__tip'
                  style={{ display: isWatchLaterHovering ? 'block' : 'none' }}
                >
                  {watchLaterAdded ? '移除稍后再看' : '稍后再看'}
                </span>
              </div>

              {/* 我不想看 */}
              {hasDislikeEntry && (
                <div
                  ref={btnDislikeRef}
                  className={styles.btnDislike}
                  onClick={onTriggerDislike}
                  style={{ display: isHovering ? 'flex' : 'none' }}
                >
                  <svg className={styles.btnDislikeIcon}>
                    <use href='#widget-close'></use>
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

            <div
              className='bili-video-card__mask'
              style={{ borderRadius: 'inherit', overflow: 'hidden' }}
            >
              <div className='bili-video-card__stats'>
                <div className='bili-video-card__stats--left'>
                  {isPc ? (
                    <>
                      {/* 播放 */}
                      {statItem({ text: playStr, iconSvgName: AppRecIconSvgNameMap.play })}
                      {/* 点赞 */}
                      {statItem({
                        text: goto === 'av' ? likeStr : favoriteStr,
                        iconSvgName: AppRecIconSvgNameMap.like,
                      })}
                    </>
                  ) : isApp ? (
                    <>
                      {item.cover_left_text_1 &&
                        statItem({
                          ...statItemForId(item.cover_left_icon_1),
                          text:
                            goto === 'picture'
                              ? item.cover_left_text_1 +
                                (item.cover_left_1_content_description || '')
                              : item.cover_left_text_1,
                        })}
                      {item.cover_left_text_2 &&
                        statItem({
                          ...statItemForId(item.cover_left_icon_2),
                          text:
                            goto === 'picture'
                              ? item.cover_left_text_2 +
                                (item.cover_left_2_content_description || '')
                              : item.cover_left_text_2,
                        })}
                    </>
                  ) : (
                    <>
                      {/* 播放 */}
                      {statItem({ text: playStr, iconSvgName: AppRecIconSvgNameMap.play })}
                      {/* 弹幕 */}
                      {statItem({
                        text: (danmaku || 0).toString(),
                        iconSvgName: AppRecIconSvgNameMap.danmaku,
                      })}
                    </>
                  )}
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
      </Dropdown>

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
              {titleRender ?? title}
            </h3>
          </a>
          <p className='bili-video-card__info--bottom'>
            {isNormalVideo ? (
              <a
                className='bili-video-card__info--owner'
                href={`//space.bilibili.com/${authorMid}`}
                target='_blank'
                data-mod='partition_recommend'
                data-idx='content'
                data-ext='click'
                title={`${authorName} ${pubdateDisplayTitle || pubdateDisplay}`}
              >
                {recommendReason ? (
                  <span className={styles.recommendReason}>{recommendReason}</span>
                ) : (
                  <svg className='bili-video-card__info--owner__up'>
                    <use href='#widget-up'></use>
                  </svg>
                )}

                <span className='bili-video-card__info--author'>{authorName}</span>
                {pubdateDisplay && (
                  <span className='bili-video-card__info--date'>· {pubdateDisplay}</span>
                )}
              </a>
            ) : appBadge || appBadgeDesc ? (
              <a className='bili-video-card__info--owner' href={href} target='_blank'>
                <span className={styles.badge}>{appBadge || ''}</span>
                <span className={styles.bangumiDesc}>{appBadgeDesc || ''}</span>
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  )
})

/**
 * 自动以动画方式预览
 */

function usePreviewAnimation({
  bvid,
  title,
  autoPreviewWhenHover,
  active,
  tryFetchVideoData,
  videoPreviewWrapperRef,
}: {
  bvid: string
  title: string
  autoPreviewWhenHover: boolean
  active: boolean
  tryFetchVideoData: () => Promise<void>
  videoPreviewWrapperRef: RefObject<HTMLDivElement>
}) {
  const DEBUG_ANIMATION = process.env.NODE_ENV !== 'production' && false

  const [previewAnimationProgress, setPreviewAnimationProgress] = useRafState<number | undefined>(
    undefined
  )

  const [mouseMoved, setMouseMoved] = useState(false)

  // 在 pvideodata 加载的时候, useHover 会有变化, so 使用 mouseenter/mouseleave 自己处理
  const isHovering = useRef(false)
  const startByHover = useRef(false)

  useEventListener(
    'mouseenter',
    (e) => {
      isHovering.current = true

      if (autoPreviewWhenHover && !idRef.current) {
        DEBUG_ANIMATION &&
          console.log(
            `[${APP_NAME}]: [animation] mouseenter onStartPreviewAnimation bvid=%s title=%s`,
            bvid,
            title
          )
        onStartPreviewAnimation(true)
      }
    },
    { target: videoPreviewWrapperRef }
  )
  useEventListener(
    'mouseleave',
    (e) => {
      isHovering.current = false
    },
    { target: videoPreviewWrapperRef }
  )

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      setMouseMoved(true)
      if (!autoPreviewWhenHover) {
        stopAnimation()
      }
    },
    { target: videoPreviewWrapperRef }
  )

  const unmounted = useUnmountedRef()

  // raf id
  const idRef = useRef<number | undefined>(undefined)

  // 停止动画
  //  鼠标动了
  //  不再 active
  //  组件卸载了
  const shouldStopAnimation = useMemoizedFn(() => {
    if (unmounted.current) return true

    // mixed keyboard & mouse control
    if (autoPreviewWhenHover) {
      if (startByHover.current) {
        if (!isHovering.current) return true
      } else {
        if (!active) return true
      }
    }
    // normal keyboard control
    else {
      if (!active) return true
      if (mouseMoved) return true
    }

    return false
  })

  const stopAnimation = useMemoizedFn((isClear = false) => {
    if (!isClear && DEBUG_ANIMATION) {
      console.log(`[${APP_NAME}]: [animation] stopAnimation: %o`, {
        autoPreviewWhenHover,
        unmounted: unmounted.current,
        isHovering: isHovering.current,
        active,
        mouseMoved,
      })
    }

    if (idRef.current) cancelAnimationFrame(idRef.current)
    idRef.current = undefined
    setPreviewAnimationProgress(undefined)
    setAnimationPaused(false)
  })

  const [animationPaused, setAnimationPaused, getAnimationPaused] = useGetState(false)

  const resumeAnimationInner = useRef<(progress: number) => void>()

  const onHotkeyPreviewAnimation = useMemoizedFn(() => {
    // console.log('hotkey preview', animationPaused)

    if (!idRef.current) {
      onStartPreviewAnimation()
      return
    }

    // toggle
    setAnimationPaused((val) => !val)

    if (animationPaused) {
      // to resume
      resumeAnimationInner.current?.(previewAnimationProgress || 0)
    } else {
      // to pause
    }
  })

  const getProgress = useMemoizedFn(() => {
    return previewAnimationProgress || 0
  })

  const onStartPreviewAnimation = useMemoizedFn((_startByHover = false) => {
    startByHover.current = _startByHover
    setMouseMoved(false)
    setAnimationPaused(false)
    tryFetchVideoData()
    stopAnimation(true) // clear existing
    setPreviewAnimationProgress((val) => (typeof val === 'undefined' ? 0 : val)) // get rid of undefined

    // ms
    const runDuration = 8e3
    const updateProgressInterval = () =>
      typeof settings.autoPreviewUpdateInterval === 'number'
        ? settings.autoPreviewUpdateInterval
        : 400

    let start = performance.now()
    let lastUpdateAt = 0

    // 闭包这里获取不到最新 previewAnimationProgress
    resumeAnimationInner.current = () => {
      start = performance.now() - getProgress() * runDuration
    }

    function frame(t: number) {
      // console.log('in raf run %s', t)

      // 停止动画
      if (shouldStopAnimation()) {
        stopAnimation()
        return
      }

      const update = () => {
        const elapsed = performance.now() - start
        const p = Math.min((elapsed % runDuration) / runDuration, 1)
        // console.log('p', p)
        setPreviewAnimationProgress(p)
      }

      if (!getAnimationPaused()) {
        if (updateProgressInterval()) {
          if (!lastUpdateAt || performance.now() - lastUpdateAt >= updateProgressInterval()) {
            lastUpdateAt = performance.now()
            update()
          }
        } else {
          update()
        }
      }

      idRef.current = requestAnimationFrame(frame)
    }

    idRef.current = requestAnimationFrame(frame)
  })

  return { onHotkeyPreviewAnimation, onStartPreviewAnimation, previewAnimationProgress }
}
