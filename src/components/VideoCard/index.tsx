import { APP_KEY_PREFIX, APP_NAME, baseDebug } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefState } from '$common/hooks/useRefState'
import { useDislikedReason } from '$components/ModalDislike'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentUsingTab, videoSourceTabState } from '$components/RecHeader/tab'
import { ETabType } from '$components/RecHeader/tab.shared'
import { type AppRecItemExtend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { dynamicFeedFilterSelectUp } from '$modules/recommend/dynamic-feed'
import { formatFavFolderUrl } from '$modules/recommend/fav'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { UserFavService, defaultFavFolderName } from '$modules/user/fav'
import { UserBlacklistService, useInBlacklist } from '$modules/user/relations/blacklist'
import { UserfollowService } from '$modules/user/relations/follow'
import { isFirefox } from '$platform'
import { Picture } from '$ui-components/Picture'
import { AntdMessage } from '$utility'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import delay from 'delay'
import { tryit } from 'radash'
import type { MouseEventHandler } from 'react'
import type { VideoData } from './card.service'
import { fetchVideoData, watchLaterAdd } from './card.service'
import { PreviewImage } from './child-components/PreviewImage'
import { VideoCardBottom } from './child-components/VideoCardBottom'
import { BlacklistCard, DislikedCard, SkeletonCard } from './child-components/other-type-cards'
import styles from './index.module.scss'
import type { VideoCardEmitter } from './index.shared'
import {
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  VideoLinkOpenMode,
  VideoLinkOpenModeConfig,
  VideoLinkOpenModeKey,
  borderRadiusStyle,
  defaultEmitter,
} from './index.shared'
import type { IVideoCardData } from './process/normalize'
import { normalizeCardData } from './process/normalize'
import { AppRecIconScaleMap, AppRecIconSvgNameMap, makeStatItem } from './stat-item'
import { useDislikeRelated } from './useDislikeRelated'
import { usePreviewAnimation } from './usePreviewAnimation'
import { useWatchlaterRelated } from './useWatchlaterRelated'

const debug = baseDebug.extend('components:VideoCard')

function copyContent(content: string) {
  GM.setClipboard(content)
  AntdMessage.success(`已复制: ${content}`)
}

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
            cardData={cardData}
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

export type VideoCardInnerProps = {
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
  const { autoPreviewWhenHover, accessKey } = useSettingsSnapshot()
  const authed = Boolean(accessKey)

  const {
    // video
    avid,
    bvid,
    goto,
    href,
    title,
    cover,
    duration,
    durationStr,
    recommendReason,

    // stat
    statItems,

    // author
    authorName,
    authorMid,
  } = cardData

  const isNormalVideo = goto === 'av'
  if (!['av', 'bangumi', 'picture'].includes(goto)) {
    console.warn(`[${APP_NAME}]: none (av,bangumi,picture) goto type %s`, goto, item)
  }

  const [videoData, setVideoData, accessVideoData] = useRefState<VideoData | null>(null)
  const isFetchingVideoData = useRef(false)
  const tryFetchVideoData = useMemoizedFn(async () => {
    if (videoData) return // already fetched
    if (isFetchingVideoData.current) return // fetching
    try {
      isFetchingVideoData.current = true
      setVideoData(await fetchVideoData(bvid))
    } finally {
      isFetchingVideoData.current = false
    }
  })

  /**
   * 预览 hover state
   */
  const videoPreviewWrapperRef = useRef<HTMLDivElement>(null)
  const {
    onStartPreviewAnimation,
    onHotkeyPreviewAnimation,
    previewProgress,
    previewT,
    isHovering,
    isHoveringAfterDelay,
    mouseEnterRelativeX,
  } = usePreviewAnimation({
    uniqId: item.uniqId,
    emitter,
    title,
    active,
    videoDuration: duration,
    tryFetchVideoData,
    accessVideoData,
    autoPreviewWhenHover,
    videoPreviewWrapperRef,
  })

  useUpdateEffect(() => {
    if (!active) return

    // update global item data for debug
    tryit(() => {
      ;(unsafeWindow as any)[`${APP_KEY_PREFIX}_activeItem`] = item
    })()

    // 自动开始预览
    if (settings.autoPreviewWhenKeyboardSelect) {
      tryFetchVideoData().then(() => {
        onStartPreviewAnimation()
      })
    }
  }, [active])

  // 稍候再看
  const { watchlaterIconEl, onToggleWatchLater, watchLaterAdded, hasWatchLaterEntry } =
    useWatchlaterRelated({
      item,
      cardData,
      onRemoveCurrent,
      active,
      isHoveringAfterDelay,
    })

  // 不喜欢
  const { dislikeIconEl, hasDislikeEntry, onTriggerDislike } = useDislikeRelated({
    item,
    authed,
    isHoveringAfterDelay,
  })

  // 充电专属
  const hasChargeTag = item.api === EApiType.Dynamic && recommendReason === '充电专属'

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
   * 花式打开
   */

  const onOpenWithMode = useMemoizedFn((mode?: VideoLinkOpenMode) => {
    const handlers: Record<VideoLinkOpenMode, () => void> = {
      [VideoLinkOpenMode.Normal]: onOpenNormal,
      [VideoLinkOpenMode.NormalFullscreen]: onOpenNormalFullscreen,
      [VideoLinkOpenMode.Popup]: onOpenInPopup,
      [VideoLinkOpenMode.Background]: onOpenInBackground,
      [VideoLinkOpenMode.Iina]: onOpenInIINA,
    }
    mode ||= settings.videoLinkOpenMode
    handlers[mode]?.()
  })

  const onOpenNormal = useMemoizedFn(() => {
    window.open(href, '_blank')
  })

  const onOpenNormalFullscreen = useMemoizedFn(() => {
    const u = new URL(href, location.href)
    u.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.Fullscreen)
    const newHref = u.href
    window.open(newHref, '_blank')?.focus()
  })

  const onOpenInPopup = useMemoizedFn(async () => {
    const u = new URL(href, location.href)
    u.searchParams.append(PLAYER_SCREEN_MODE, PlayerScreenMode.WebFullscreen)
    const newHref = u.href

    let popupWidth = 1000
    let popupHeight = Math.ceil((popupWidth / 16) * 9)

    // try detect 竖屏视频
    if (item.api === EApiType.App && item.uri?.startsWith('bilibili://')) {
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

    let pipWindow: Window | undefined
    try {
      // Open a Picture-in-Picture window.
      // https://developer.chrome.com/docs/web-platform/document-picture-in-picture
      // @ts-ignore
      pipWindow = await globalThis.documentPictureInPicture.requestWindow({
        width: popupWidth,
        height: popupHeight,
      })
    } catch (e) {
      // noop
    }

    // use pipWindow
    if (pipWindow) {
      // Move the player to the Picture-in-Picture window.
      const iframe = document.createElement('iframe')
      iframe.src = newHref
      // @ts-ignore
      iframe.style = 'width: 100%; height: 100%; border: none;'

      pipWindow.document.body.append(iframe)
      // @ts-ignore
      pipWindow.document.body.style = 'margin: 0; padding: 0; width: 100%; height: 100%;'
    }

    // use window.open popup
    else {
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

      debug('openInPopup: features -> %s', features)
      window.open(newHref, '_blank', features)
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

  const onOpenInIINA = useMemoizedFn(() => {
    let usingHref = href
    if (item.api === 'watchlater') usingHref = `/video/${item.bvid}`
    const fullHref = new URL(usingHref, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')
  })

  const handleVideoLinkClick: MouseEventHandler = useMemoizedFn((e) => {
    if (settings.videoLinkOpenMode !== VideoLinkOpenMode.Normal) {
      e.preventDefault()
      onOpenWithMode()
    }
  })

  /**
   * expose actions
   */

  useMittOn(emitter, 'open', onOpenWithMode)
  useMittOn(emitter, 'toggle-watch-later', () => onToggleWatchLater())
  useMittOn(emitter, 'trigger-dislike', () => onTriggerDislike())
  useMittOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useMittOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

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

  /**
   * blacklist
   */

  // 已关注 item.api 也为 'pc', 故使用 tab, 而不是 api 区分
  const tab = useCurrentUsingTab()
  const hasBlacklistEntry =
    tab === ETabType.RecommendApp ||
    tab === ETabType.RecommendPc ||
    tab === ETabType.PopularGeneral ||
    tab === ETabType.PopularWeekly

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
    if (!hasDynamicFeedFilterSelectUpEntry) return

    async function openInCurrentWindow() {
      dynamicFeedFilterSelectUp({
        upMid: Number(authorMid),
        upName: authorName,
        searchText: undefined,
      })
      videoSourceTabState.value = ETabType.DynamicFeed
      await delay(100)
      await onRefresh?.()
    }

    function openInNewWindow() {
      const u = `/?dyn-mid=${authorMid}`
      GM_openInTab(u, { insert: true, active: true })
    }

    openInNewWindow()
  })

  const contextMenus: MenuProps['items'] = useMemo(() => {
    const watchLaterLabel = watchLaterAdded ? '移除稍后再看' : '稍后再看'

    return [
      ...Object.values(VideoLinkOpenMode)
        .filter((mode) => typeof VideoLinkOpenModeConfig[mode].enabled === 'undefined')
        .map((mode) => {
          return {
            key: VideoLinkOpenModeKey[mode],
            label: VideoLinkOpenModeConfig[mode].label,
            icon: VideoLinkOpenModeConfig[mode].icon,
            onClick: () => onOpenWithMode(mode),
          }
        }),

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

      ...(Object.values(VideoLinkOpenMode).filter(
        (mode) =>
          typeof VideoLinkOpenModeConfig[mode].enabled === 'boolean' &&
          VideoLinkOpenModeConfig[mode].enabled,
      ).length
        ? [
            { type: 'divider' as const },
            ...Object.values(VideoLinkOpenMode)
              .filter(
                (mode) =>
                  typeof VideoLinkOpenModeConfig[mode].enabled === 'boolean' &&
                  VideoLinkOpenModeConfig[mode].enabled,
              )
              .map((mode) => {
                return {
                  key: VideoLinkOpenModeKey[mode],
                  label: VideoLinkOpenModeConfig[mode].label,
                  icon: VideoLinkOpenModeConfig[mode].icon,
                  onClick: () => onOpenWithMode(mode),
                }
              }),
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
              <Picture
                className='v-img bili-video-card__cover'
                style={{ borderRadius: 'inherit', overflow: 'hidden' }}
                src={`${cover}@672w_378h_1c_!web-home-common-cover`}
                imgProps={{
                  // in firefox, alt text is visible during loading
                  alt: isFirefox ? '' : title,
                }}
              />

              {/* <div className='v-inline-player'></div> */}

              {/* preview */}
              {/* follow-mouse or manual-control */}
              {(isHoveringAfterDelay || typeof previewProgress === 'number') && (
                <PreviewImage
                  videoDuration={duration}
                  pvideo={videoData?.videoshotData}
                  mouseEnterRelativeX={mouseEnterRelativeX}
                  previewProgress={previewProgress}
                  previewT={previewT}
                />
              )}

              {/* 稍后再看 */}
              {watchlaterIconEl}

              {/* 我不想看 */}
              {dislikeIconEl}

              {/* 充电专属 */}
              {hasChargeTag && (
                <div
                  className={styles.chargeTagWrapper}
                  css={css`
                    padding: 1px 6px 1px 4px;
                    font-size: 10px;
                    color: #fff;
                    text-align: center;
                    line-height: 17px;
                    border-radius: 2px;
                    margin-left: 4px;
                    white-space: nowrap;
                    background-color: #f69;
                    background-color: ${colorPrimaryValue};
                  `}
                >
                  <svg
                    width='16'
                    height='17'
                    viewBox='0 0 16 17'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M5.00014 14.9839C4.94522 15.1219 5.12392 15.2322 5.22268 15.1212L11.5561 8.00214C11.7084 7.83093 11.5869 7.56014 11.3578 7.56014H9.13662L11.6019 3.57178C11.7112 3.39489 11.584 3.16666 11.376 3.16666H7.4475C7.22576 3.16666 7.02737 3.30444 6.94992 3.51221L4.68362 9.59189C4.61894 9.76539 4.74725 9.95014 4.93241 9.95014H7.00268L5.00014 14.9839Z'
                      fill='white'
                    ></path>
                  </svg>
                  充电专属
                </div>
              )}
            </div>

            <div
              className='bili-video-card__mask'
              style={{ borderRadius: 'inherit', overflow: 'hidden' }}
            >
              <div className='bili-video-card__stats'>
                <div className='bili-video-card__stats--left'>
                  {statItems.map(({ field, value }) => (
                    <Fragment key={field}>
                      {makeStatItem({
                        text: value,
                        iconSvgName: AppRecIconSvgNameMap[field],
                        iconSvgScale: AppRecIconScaleMap[field],
                      })}
                    </Fragment>
                  ))}
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

      {/* bottom: after the cover */}
      <VideoCardBottom cardData={cardData} handleVideoLinkClick={handleVideoLinkClick} />
    </div>
  )
})
