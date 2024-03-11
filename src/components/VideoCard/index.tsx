import { APP_KEY_PREFIX, APP_NAME, OPERATION_FAIL_MSG, baseDebug } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import type { Reason } from '$components/ModalDislike'
import { delDislikeId, showModalDislike, useDislikedReason } from '$components/ModalDislike'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentSourceTab, videoSourceTabState } from '$components/RecHeader/tab'
import type { AppRecItem, AppRecItemExtend, RecItemType } from '$define'
import { ApiType } from '$define/index.shared'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { dynamicFeedFilterSelectUp } from '$modules/recommend/dynamic-feed'
import { formatFavFolderUrl } from '$modules/recommend/fav'
import { useWatchLaterState, watchLaterState } from '$modules/recommend/watchlater'
import { UserFavService, defaultFavFolderName } from '$modules/user/fav'
import { UserBlacklistService, useInBlacklist } from '$modules/user/relations/blacklist'
import { UserfollowService } from '$modules/user/relations/follow'
import { isFirefox, isMac, isSafari } from '$platform'
import { settings, useSettingsSnapshot } from '$settings'
import { AntdMessage } from '$utility'
import { toastRequestFail } from '$utility/toast'
import { formatCount } from '$utility/video'
import { css } from '@emotion/react'
import { useEventListener, useHover, useMemoizedFn, usePrevious, useUpdateEffect } from 'ahooks'
import type { MenuProps } from 'antd'
import { Avatar, Dropdown } from 'antd'
import delay from 'delay'
import { motion } from 'framer-motion'
import type { Emitter } from 'mitt'
import mitt from 'mitt'
import type { CSSProperties, ComponentProps, MouseEvent, MouseEventHandler } from 'react'
import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react'
import { PreviewImage } from './PreviewImage'
import { AppRecIconScaleMap, AppRecIconSvgNameMap } from './app-rec-icon'
import type { VideoData } from './card.service'
import { cancelDislike, getVideoData, watchLaterAdd, watchLaterDel } from './card.service'
import styles from './index.module.scss'
import {
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  STAT_NUMBER_FALLBACK,
  borderRadiusStyle,
} from './index.shared'
import type { IVideoCardData } from './process/normalize'
import { normalizeCardData } from './process/normalize'
import { usePreviewAnimation } from './usePreviewAnimation'

const debug = baseDebug.extend('components:VideoCard')

function copyContent(content: string) {
  GM.setClipboard(content)
  AntdMessage.success(`已复制: ${content}`)
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
  onRefresh?: OnRefresh
  emitter?: VideoCardEmitter
} & ComponentProps<'div'>

export const VideoCard = memo(function VideoCard({
  style,
  className,
  item,
  loading,
  active,
  onRemoveCurrent,
  onMoveToFirst,
  onRefresh,
  emitter,
  ...restProps
}: VideoCardProps) {
  // loading defaults to
  // true when item is not provided
  // false when item provided
  loading = loading ?? !item

  const dislikedReason = useDislikedReason(item?.api === 'app' && item.param)
  const cardData = useMemo(() => item && normalizeCardData(item), [item])
  const blacklisted = useInBlacklist(cardData?.authorMid)

  return (
    <div
      style={style}
      className={cx('bili-video-card', styles.biliVideoCard, className)}
      {...restProps}
    >
      {loading ? (
        <SkeletonCard loading={loading} />
      ) : (
        item &&
        cardData &&
        (dislikedReason ? (
          <DislikedCard
            item={item as AppRecItemExtend}
            emitter={emitter}
            dislikedReason={dislikedReason!}
          />
        ) : blacklisted ? (
          <BlacklistCard cardData={cardData} />
        ) : (
          <VideoCardInner
            item={item}
            cardData={cardData}
            active={active}
            emitter={emitter}
            onRemoveCurrent={onRemoveCurrent}
            onMoveToFirst={onMoveToFirst}
            onRefresh={onRefresh}
          />
        ))
      )}
    </div>
  )
})

const SkeletonCard = memo(function SkeletonCard({ loading }: { loading: boolean }) {
  const { styleFancy } = useSettingsSnapshot()

  return (
    <div
      className={cx('bili-video-card__skeleton', {
        hide: !loading,
        [styles.skeletonActive]: loading,
      })}
    >
      <div className='bili-video-card__skeleton--cover' style={borderRadiusStyle} />

      {!styleFancy && (
        <div className='bili-video-card__skeleton--info'>
          <div className='bili-video-card__skeleton--right'>
            <p className='bili-video-card__skeleton--text'></p>
            <p className='bili-video-card__skeleton--text short'></p>
            <p className='bili-video-card__skeleton--light'></p>
          </div>
        </div>
      )}
      {styleFancy && (
        <div className='bili-video-card__skeleton--info'>
          <div
            className='bili-video-card__skeleton--avatar'
            css={css`
              width: 32px;
              height: 32px;
              border-radius: 50%;
            `}
          />
          <div
            className='bili-video-card__skeleton--right'
            css={css`
              flex: 1;
              margin-left: 10px;
            `}
          >
            <p className='bili-video-card__skeleton--text'></p>
            <p className='bili-video-card__skeleton--text short'></p>
            <p className='bili-video-card__skeleton--light'></p>
            <p className='bili-video-card__skeleton--text tiny'></p>
          </div>
        </div>
      )}
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
      err = e as Error
    }

    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    success ? AntdMessage.success('已撤销') : AntdMessage.error(OPERATION_FAIL_MSG)
    if (success) {
      delDislikeId(item.param)
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

const BlacklistCard = memo(function BlacklistCard({ cardData }: { cardData: IVideoCardData }) {
  const { authorMid, authorFace, authorName } = cardData

  const onCancel = useMemoizedFn(async () => {
    if (!authorMid) return
    const success = await UserBlacklistService.remove(authorMid)
    if (success) AntdMessage.success(`已移出黑名单: ${authorName}`)
  })

  return (
    <div className={cx(styles.dislikedWrapper)}>
      <div className={styles.dislikeContentCover}>
        <div className={styles.dislikeContentCoverInner}>
          <IconPark name='PeopleDelete' size={32} className={styles.dislikeIcon} />
          <div className={styles.dislikeReason}>已拉黑</div>
          <div className={styles.dislikeDesc}>UP: {authorName}</div>
        </div>
      </div>
      <div className={styles.dislikeContentAction}>
        <button onClick={onCancel}>
          <IconPark name='Return' size='16' style={{ marginRight: 4, marginTop: -2 }} />
          撤销
        </button>
      </div>
    </div>
  )
})

type VideoCardInnerProps = {
  item: RecItemType
  cardData: IVideoCardData
  active?: boolean
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onRefresh?: OnRefresh
  emitter?: VideoCardEmitter
}
const VideoCardInner = memo(function VideoCardInner({
  item,
  cardData,
  active = false,
  onRemoveCurrent,
  onMoveToFirst,
  onRefresh,
  emitter = defaultEmitter,
}: VideoCardInnerProps) {
  const isPc = item.api === 'pc'
  const isApp = item.api === 'app'
  const isDynamic = item.api === 'dynamic'
  const isWatchlater = item.api === 'watchlater'
  const isFav = item.api === 'fav'

  const { styleFancy, coverUseAvif } = useSettingsSnapshot()

  let {
    // video
    avid,
    bvid,
    goto,
    href,
    title,
    titleRender,
    desc,
    cover,
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
    bangumiFollow,
    statItems,

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

  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const isFetchingVideoData = useRef(false)

  const tryFetchVideoData = useMemoizedFn(async () => {
    // already fetched
    if (videoData) return
    // fetching
    if (isFetchingVideoData.current) return

    try {
      isFetchingVideoData.current = true
      setVideoData(await getVideoData(bvid))
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
    { target: videoPreviewWrapperRef },
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
      ;(unsafeWindow as any)[`${APP_KEY_PREFIX}_activeItem`] = item
    } catch (e: any) {
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
  const watchLaterAddedPrevious = usePrevious(watchLaterAdd)

  const { accessKey } = useSettingsSnapshot()
  const authed = Boolean(accessKey)

  useEffect(() => {
    if (isHovering) tryFetchVideoData()
  }, [isHovering])

  /**
   * 稍候再看
   */

  const hasWatchLaterEntry = item.api !== 'app' || (item.api === 'app' && item.goto === 'av')

  const requestingWatchLaterApi = useRef(false)
  const onToggleWatchLater = useMemoizedFn(
    async (
      e?: MouseEvent,
      usingAction?: typeof watchLaterDel | typeof watchLaterAdd,
    ): Promise<{ success: boolean; targetState?: boolean }> => {
      e?.preventDefault()
      e?.stopPropagation()

      usingAction ??= watchLaterAdded ? watchLaterDel : watchLaterAdd
      if (usingAction !== watchLaterAdd && usingAction !== watchLaterDel) {
        throw new Error('unexpected usingAction provided')
      }

      if (requestingWatchLaterApi.current) return { success: false }
      requestingWatchLaterApi.current = true

      let success = false
      try {
        success = await usingAction(avid)
      } finally {
        requestingWatchLaterApi.current = false
      }

      const targetState = usingAction === watchLaterAdd ? true : false
      if (success) {
        if (targetState) {
          watchLaterState.bvidSet.add(bvid)
        } else {
          watchLaterState.bvidSet.delete(bvid)
        }

        // 稍后再看
        if (item.api === 'watchlater') {
          // when remove-watchlater for watchlater tab, remove this card
          if (!targetState) {
            await delay(100)
            onRemoveCurrent?.(item, cardData)
          }
        }
        // 其他 Tab
        else {
          AntdMessage.success(`已${targetState ? '添加' : '移除'}稍后再看`)
        }
      }

      return { success, targetState }
    },
  )

  /**
   * 不喜欢
   */
  const btnDislikeRef = useRef(null)
  const isBtnDislikeHovering = useHover(btnDislikeRef)
  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== 'app') {
        return AntdMessage.error('当前视频不支持提交「我不想看」')
      }
      if (!authed) {
        return AntdMessage.error('请先获取 access_key')
      }
      return
    }

    showModalDislike(item)
  })

  const playStr = useMemo(() => formatCount(play), [play])
  const likeStr = useMemo(() => formatCount(like), [like])
  const danmakuStr = useMemo(() => formatCount(danmaku), [danmaku])
  const _favoriteStr = useMemo(() => formatCount(favorite), [favorite])
  const favoriteStr = isPc ? likeStr : _favoriteStr

  const makeStatItem = ({
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
          style={{
            transform: iconSvgScale ? `scale(${iconSvgScale})` : undefined,
          }}
        >
          <use href={iconSvgName}></use>
        </svg>
        <span
          className='bili-video-card__stats--text'
          style={{ lineHeight: 'calc(var(--icon-size) + 1px)' }}
        >
          {text}
        </span>
      </span>
    )
  }

  /**
   * 收藏状态
   */
  const [favFolderNames, setFavFolderNames] = useState<string[] | undefined>(undefined)
  const [favFolderUrls, setFavFolderUrls] = useState<string[] | undefined>(undefined)
  const updateFavFolderNames = useMemoizedFn(async () => {
    // 只在「稍后再看」提供收藏状态
    if (item.api !== 'watchlater') return
    const result = await UserFavService.getVideoFavState(avid)
    if (result) {
      const { favFolderNames, favFolderUrls } = result
      setFavFolderNames(favFolderNames)
      setFavFolderUrls(favFolderUrls)
    }
  })

  /**
   * expose actions
   */

  const onOpen = useMemoizedFn(() => {
    window.open(href, '_blank')
  })

  const onOpenInPopup = useMemoizedFn(() => {
    let popupWidth = 1000
    let popupHeight = Math.ceil((popupWidth / 16) * 9)

    // try detect 竖屏视频
    if (item.api === ApiType.app && item.uri?.startsWith('bilibili://')) {
      const searchParams = new URL(item.uri).searchParams
      const playerWidth = Number(searchParams.get('player_width') || 0)
      const playerHeight = Number(searchParams.get('player_height') || 0)

      if (playerWidth && playerHeight && !isNaN(playerWidth) && !isNaN(playerHeight)) {
        // 竖屏视频
        if (playerWidth < playerHeight) {
          popupWidth = 720
          popupHeight = Math.floor((popupWidth / 9) * 16)
        }
      }
    }

    // 将 left 减去 50px，你可以根据需要调整这个值
    const left = (window.innerWidth - popupWidth) / 2
    const top = (window.innerHeight - popupHeight) / 2 - 50

    const features = [
      'popup=true',
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `left=${left}`,
      `top=${top}`,
    ].join(',')

    const u = new URL(href, location.href)
    u.searchParams.append(PLAYER_SCREEN_MODE, PlayerScreenMode.WebFullscreen)
    const newHref = u.href

    debug('openInPopup: features -> %s', features)
    window.open(newHref, '_blank', features)
  })

  const handleVideoLinkClick: MouseEventHandler = useMemoizedFn((e) => {
    if (settings.openVideoInPopupWhenClick) {
      e.preventDefault()
      onOpenInPopup()
      return
    }

    if (settings.openVideoAutoFullscreen) {
      e.preventDefault()
      const u = new URL(href, location.href)
      u.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.Fullscreen)
      const newHref = u.href
      window.open(newHref, '_blank')
      return
    }
  })

  const onOpenInBackground = useMemoizedFn(() => {
    // `/video/BV1234` when used in TamperMonkey, it relatives to extension root
    // see https://github.com/magicdawn/bilibili-app-recommend/issues/63
    const fullHref = new URL(href, location.href).href
    GM.openInTab(fullHref, {
      active: false,
      insert: true,
    })
  })

  useMittOn(emitter, 'open', onOpen)
  useMittOn(emitter, 'toggle-watch-later', () => onToggleWatchLater())
  useMittOn(emitter, 'trigger-dislike', () => onTriggerDislike())
  useMittOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useMittOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

  const hasDislikeEntry = isApp && authed && !!item.three_point?.dislike_reasons?.length

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

  /**
   * blacklist
   */

  // 已关注 item.api 也为 'pc', 故使用 tab, 而不是 api 区分
  const tab = useCurrentSourceTab()
  const hasBlacklistEntry =
    tab === 'recommend-app' ||
    tab === 'recommend-pc' ||
    tab === 'popular-general' ||
    tab === 'popular-weekly'

  const onBlacklistUp = useMemoizedFn(async () => {
    if (!authorMid) return AntdMessage.error('UP mid 为空!')
    const success = await UserBlacklistService.add(authorMid)
    if (success) {
      AntdMessage.success(`已加入黑名单: ${authorName}`)
    }
  })

  /**
   * unfollow
   */

  const hasUnfollowEntry =
    item.api === 'dynamic' ||
    ((item.api === 'app' || item.api === 'pc') && recommendReason === '已关注')
  const onUnfollowUp = useMemoizedFn(async () => {
    if (!authorMid) return
    const success = await UserfollowService.unfollow(authorMid)
    if (success) {
      AntdMessage.success('已取消关注')
    }
  })

  /**
   * 动态筛选
   */

  const hasDynamicFeedFilterSelectUpEntry =
    isNormalVideo && !!authorMid && !!authorName && !!onRefresh
  const onDynamicFeedFilterSelectUp = useMemoizedFn(async () => {
    if (!authorMid || !authorName) return
    dynamicFeedFilterSelectUp({ upMid: Number(authorMid), upName: authorName })
    videoSourceTabState.value = 'dynamic-feed'
    await delay(100)
    await onRefresh?.()
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
      {
        key: 'open-link-in-popup',
        label: '小窗打开',
        icon: <IconPark name='EfferentFour' size={15} />,
        onClick: onOpenInPopup,
      },
      {
        key: 'open-link-in-background',
        label: '后台打开',
        icon: <IconPark name='Split' size={15} />,
        onClick: onOpenInBackground,
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
      hasDynamicFeedFilterSelectUpEntry && {
        key: 'dymamic-feed-filter-select-up',
        label: '查看 UP 的动态',
        icon: <IconPark name='PeopleSearch' size={15} />,
        onClick: onDynamicFeedFilterSelectUp,
      },
      hasUnfollowEntry && {
        key: 'unfollow-up',
        label: '取消关注',
        icon: <IconPark name='PeopleMinus' size={15} />,
        onClick: onUnfollowUp,
      },
      hasBlacklistEntry && {
        key: 'blacklist-up',
        label: '将 UP 加入黑名单',
        icon: <IconPark name='PeopleDelete' size={15} />,
        onClick: onBlacklistUp,
      },
      item.api === 'watchlater' && {
        key: 'add-fav',
        icon: (
          <IconPark
            name='Star'
            size={15}
            {...(favFolderNames?.length
              ? {
                  theme: 'two-tone',
                  fill: ['currentColor', colorPrimaryValue],
                }
              : undefined)}
          />
        ),
        label: favFolderNames?.length
          ? `已收藏 ${favFolderNames.map((n) => `「${n}」`).join('')}`
          : '快速收藏',
        async onClick() {
          const hasFaved = Boolean(favFolderNames?.length)

          // 浏览收藏夹
          if (hasFaved) {
            favFolderUrls?.forEach((u) => {
              window.open(u, '_blank')
            })
          }

          // 快速收藏
          else {
            const success = await UserFavService.addFav(avid)
            if (success) {
              AntdMessage.success(`已加入收藏夹「${defaultFavFolderName}」`)
            }
          }
        },
      },
      hasWatchLaterEntry && {
        key: 'watchlater',
        label: watchLaterLabel,
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
            const { success } = await onToggleWatchLater(undefined, watchLaterAdd)
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
                const success = await UserFavService.removeFav(
                  item.folder.id,
                  `${item.id}:${item.type}`,
                )
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
  }, [
    item,
    hasWatchLaterEntry,
    watchLaterAdded,
    hasDislikeEntry,
    hasUnfollowEntry,
    hasBlacklistEntry,
    hasDynamicFeedFilterSelectUpEntry,
    favFolderNames,
    favFolderUrls,
  ])

  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    updateFavFolderNames()
  })

  // fallback to href
  const authorHref = authorMid ? `https://space.bilibili.com/${authorMid}` : href

  // firsr-line: title
  // second-line: desc
  // desc defaults to `author-name video-pub-date`
  desc ||= `${authorName}${pubdateDisplay ? ` · ${pubdateDisplay}` : ''}`
  const descTitle =
    authorName && pubdateDisplayTitle ? `${authorName} · ${pubdateDisplayTitle}` : desc

  return (
    <div
      data-bvid={bvid || ''}
      className='bili-video-card__wrap __scale-wrap'
      css={css`
        background-color: unset;
        position: static;
      `}
    >
      <Dropdown
        menu={{ items: contextMenus }}
        trigger={['contextMenu']}
        onOpenChange={onContextMenuOpenChange}
      >
        <a href={href} target='_blank' onClick={handleVideoLinkClick}>
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
                {!isSafari && coverUseAvif && (
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
                  loading='lazy'
                  // in firefox, alt text is visible during loading
                  alt={isFirefox ? '' : title}
                />
              </picture>

              {/* <div className='v-inline-player'></div> */}

              {/* preview */}
              {/* follow-mouse or manual-control */}
              {(isHovering || typeof previewAnimationProgress === 'number') && (
                <PreviewImage
                  videoDuration={duration}
                  pvideo={videoData?.videoshotData}
                  mouseEnterRelativeX={mouseEnterRelativeX}
                  previewAnimationProgress={previewAnimationProgress}
                />
              )}

              {/* 稍后再看 */}
              {hasWatchLaterEntry && (
                <div
                  className={`${styles.watchLater}`}
                  style={{
                    display: isHovering || active ? 'flex' : 'none',
                  }}
                  ref={watchLaterRef}
                  onClick={onToggleWatchLater}
                >
                  {watchLaterAdded ? (
                    <svg className={styles.watchLaterIcon} viewBox='0 0 200 200'>
                      <motion.path
                        d='M25,100 l48,48 a 8.5,8.5 0 0 0 10,0 l90,-90'
                        strokeWidth='20'
                        stroke='currentColor'
                        fill='transparent'
                        strokeLinecap='round'
                        {...(!watchLaterAddedPrevious
                          ? {
                              initial: { pathLength: 0 },
                              animate: { pathLength: 1 },
                            }
                          : undefined)}
                      />
                    </svg>
                  ) : (
                    <svg className={styles.watchLaterIcon}>
                      <use href={'#widget-watch-later'} />
                    </svg>
                  )}
                  {/* <use href={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} /> */}
                  <span
                    className={styles.watchLaterTip}
                    style={{ display: isWatchLaterHovering ? 'block' : 'none' }}
                  >
                    {watchLaterAdded ? '移除稍后再看' : '稍后再看'}
                  </span>
                </div>
              )}

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
                  {statItems?.length ? (
                    <>
                      {statItems.map(({ field, value }) => (
                        <Fragment key={field}>
                          {makeStatItem({
                            text: value,
                            iconSvgName: AppRecIconSvgNameMap[field],
                            iconSvgScale: AppRecIconScaleMap[field],
                          })}
                        </Fragment>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* 播放 */}
                      {makeStatItem({
                        text: playStr || STAT_NUMBER_FALLBACK,
                        iconSvgName: AppRecIconSvgNameMap.play,
                      })}
                      {/* 弹幕 */}
                      {makeStatItem({
                        text: danmakuStr || STAT_NUMBER_FALLBACK,
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

      {/* old, same as bilibili default */}
      {!styleFancy && (
        <div className='bili-video-card__info __scale-disable'>
          <div className='bili-video-card__info--right'>
            <a
              href={href}
              target='_blank'
              data-mod='partition_recommend'
              data-idx='content'
              data-ext='click'
              onClick={handleVideoLinkClick}
            >
              <h3 className='bili-video-card__info--tit' title={title}>
                {titleRender ?? title}
              </h3>
            </a>
            <p className='bili-video-card__info--bottom'>
              {isNormalVideo ? (
                <a
                  className='bili-video-card__info--owner'
                  href={authorHref}
                  target='_blank'
                  title={descTitle}
                >
                  {recommendReason ? (
                    <span className={styles.recommendReason}>{recommendReason}</span>
                  ) : (
                    <svg className='bili-video-card__info--owner__up'>
                      <use href='#widget-up'></use>
                    </svg>
                  )}
                  <span className='bili-video-card__info--author'>{desc}</span>
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
      )}

      {/* new, not so crowded */}
      {styleFancy && (
        <div
          css={css`
            display: flex;
            margin-top: 15px;
          `}
        >
          <a href={authorHref} target='_blank' onClick={handleVideoLinkClick}>
            {authorFace ? (
              <Avatar src={authorFace} />
            ) : (
              <Avatar>{authorName?.[0] || appBadgeDesc?.[0] || ''}</Avatar>
            )}
          </a>

          <div
            css={css`
              flex: 1;
              margin-left: 10px;
              overflow: hidden;
            `}
          >
            <a href={href} target='_blank'>
              <h3
                title={title}
                // className='bili-video-card__info--tit'
                css={css`
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  word-break: break-all;
                  line-break: anywhere;

                  color: var(--text1);
                  font-size: var(--title-font-size);
                  line-height: var(--title-line-height);
                  /* min-height: 48px; */
                `}
              >
                {titleRender ?? title}
              </h3>
            </a>

            <div
              css={css`
                margin-top: 4px;
                color: var(--text3);
                font-size: var(--subtitle-font-size);
              `}
            >
              {isNormalVideo ? (
                <>
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <a
                      className='bili-video-card__info--owner'
                      href={authorHref}
                      target='_blank'
                      title={descTitle}
                    >
                      <span className='bili-video-card__info--author'>{desc}</span>
                    </a>
                  </div>
                  {!!recommendReason && (
                    <div
                      className={styles.recommendReason}
                      css={css`
                        margin-top: 4px;
                        padding-left: 0;
                        max-width: 100%;
                      `}
                    >
                      {recommendReason}
                    </div>
                  )}
                </>
              ) : appBadge || appBadgeDesc ? (
                <a className='bili-video-card__info--owner' href={href} target='_blank'>
                  {!!appBadge && <span className={styles.badge}>{appBadge}</span>}
                  {!!appBadgeDesc && <span className={styles.bangumiDesc}>{appBadgeDesc}</span>}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
