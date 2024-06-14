import { APP_CLS_CARD, APP_CLS_GRID, APP_CLS_ROOT, APP_KEY_PREFIX, APP_NAME } from '$common'
import { C } from '$common/emotion-css'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useDislikedReason } from '$components/ModalDislike'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentUsingTab, videoSourceTabState } from '$components/RecHeader/tab'
import { ETab } from '$components/RecHeader/tab-enum'
import { isRanking, type AppRecItemExtend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { DislikeIcon, OpenExternalLinkIcon } from '$modules/icon'
import { IconPark } from '$modules/icon/icon-park'
import { dynamicFeedFilterSelectUp } from '$modules/rec-services/dynamic-feed'
import { formatFavFolderUrl } from '$modules/rec-services/fav'
import { UserFavService, defaultFavFolderName } from '$modules/rec-services/fav/user-fav.service'
import { settings, updateSettings, useSettingsSnapshot } from '$modules/settings'
import { UserBlacklistService, useInBlacklist } from '$modules/user/relations/blacklist'
import { UserfollowService } from '$modules/user/relations/follow'
import { isFirefox } from '$platform'
import { Picture } from '$ui-components/Picture'
import { AntdMessage, toast } from '$utility'
import type { TheCssType } from '$utility/type'
import { useLockFn } from 'ahooks'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import delay from 'delay'
import { tryit } from 'radash'
import type { CSSProperties } from 'react'
import type { VideoData } from './card.service'
import { fetchVideoData, isVideoshotDataValid, watchLaterAdd } from './card.service'
import { PreviewImage } from './child-components/PreviewImage'
import { VideoCardActionStyle } from './child-components/VideoCardActions'
import { VideoCardBottom } from './child-components/VideoCardBottom'
import { BlacklistCard, DislikedCard, SkeletonCard } from './child-components/other-type-cards'
import styles from './index.module.scss'
import type { VideoCardEmitter } from './index.shared'
import { borderRadiusValue, defaultEmitter } from './index.shared'
import { getFollowedStatus } from './process/filter'
import type { IVideoCardData } from './process/normalize'
import { normalizeCardData } from './process/normalize'
import { StatItemDisplay } from './stat-item'
import { ChargeOnlyTag, RankingNumMark, getHasChargeOnlyTag } from './top-marks'
import { useDislikeRelated } from './use/useDislikeRelated'
import { useOpenRelated } from './use/useOpenRelated'
import { usePreviewAnimation } from './use/usePreviewAnimation'
import { useWatchlaterRelated } from './use/useWatchlaterRelated'

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

  const dislikedReason = useDislikedReason(item?.api === EApiType.App && item.param)
  const cardData = useMemo(() => item && normalizeCardData(item), [item])
  const blacklisted = useInBlacklist(cardData?.authorMid)

  return (
    <div
      style={style}
      className={clsx('bili-video-card', styles.biliVideoCard, className)}
      data-bvid={cardData?.bvid}
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
  const { autoPreviewWhenHover, accessKey, styleNewCardStyle } = useSettingsSnapshot()
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
  const allowed = ['av', 'bangumi', 'picture', 'live']
  if (!allowed.includes(goto)) {
    console.warn(`[${APP_NAME}]: none (${allowed.join(',')}) goto type %s`, goto, item)
  }

  const videoDataBox = useRefStateBox<VideoData | null>(null)
  const tryFetchVideoData = useLockFn(async () => {
    if (!bvid) return // no bvid
    if (!bvid.startsWith('BV')) return // bvid invalid
    if (goto !== 'av') return // scrrenshot only for video
    if (videoDataBox.val && isVideoshotDataValid(videoDataBox.val.videoshotData)) return // already fetched
    videoDataBox.set(await fetchVideoData(bvid))
  })

  /**
   * 预览 hover state
   */
  const videoPreviewWrapperRef = useRef<HTMLElement | null>(null)

  function createRefCallback(role: 'card' | 'cover') {
    return function refCallback(el: HTMLElement | null) {
      if (styleNewCardStyle) {
        if (role === 'card') {
          videoPreviewWrapperRef.current = el
        }
      } else {
        if (role === 'cover') {
          videoPreviewWrapperRef.current = el
        }
      }
    }
  }

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
    videoDataBox,
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

  const actionButtonVisible = active || isHovering

  // 稍候再看
  const { watchlaterButtonEl, onToggleWatchLater, watchLaterAdded, hasWatchLaterEntry } =
    useWatchlaterRelated({
      item,
      cardData,
      onRemoveCurrent,
      actionButtonVisible,
    })

  // 不喜欢
  const { dislikeButtonEl, hasDislikeEntry, onTriggerDislike } = useDislikeRelated({
    item,
    authed,
    actionButtonVisible,
  })

  // 充电专属
  const hasChargeOnlyTag = getHasChargeOnlyTag(item, recommendReason)

  /**
   * 收藏状态
   */
  const [favFolderNames, setFavFolderNames] = useState<string[] | undefined>(undefined)
  const [favFolderUrls, setFavFolderUrls] = useState<string[] | undefined>(undefined)
  const updateFavFolderNames = useMemoizedFn(async () => {
    // 只在「稍后再看」提供收藏状态
    if (item.api !== 'watchlater') return
    if (!avid) return
    const result = await UserFavService.getVideoFavState(avid)
    if (result) {
      const { favFolderNames, favFolderUrls } = result
      setFavFolderNames(favFolderNames)
      setFavFolderUrls(favFolderUrls)
    }
  })

  // 打开视频卡片
  const {
    onOpenWithMode,
    handleVideoLinkClick,
    consistentOpenMenus,
    conditionalOpenMenus,
    openInPopupButtonEl,
    onOpenInPopup,
  } = useOpenRelated({
    href,
    item,
    cardData,
    actionButtonVisible,
  })

  /**
   * expose actions
   */

  useMittOn(emitter, 'open', onOpenWithMode)
  useMittOn(emitter, 'open-in-popup', onOpenInPopup)
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
    authorMid && (tab === ETab.RecommendApp || tab === ETab.RecommendPc || tab === ETab.Hot)

  const onBlacklistUp = useMemoizedFn(async () => {
    if (!authorMid) return AntdMessage.error('UP mid 为空!')
    const success = await UserBlacklistService.add(authorMid)
    if (success) {
      AntdMessage.success(`已加入黑名单: ${authorName}`)
    }
  })

  const onAddUpToFilterList = useMemoizedFn(async () => {
    if (!authorMid) return AntdMessage.error('UP mid 为空!')

    let content = `${authorMid}`
    if (authorName) content += `(${authorName})`

    if (settings.filterByAuthorNameKeywords.includes(content)) {
      return toast(`已在过滤名单中: ${content}`)
    }

    updateSettings({
      filterByAuthorNameKeywords: [...settings.filterByAuthorNameKeywords, content],
    })
    AntdMessage.success(`已加入过滤名单: ${content}, 刷新后生效~`)
  })

  /**
   * unfollow
   */

  const hasUnfollowEntry =
    item.api === EApiType.Dynamic ||
    ((item.api === EApiType.App || item.api === EApiType.Pc) && getFollowedStatus(recommendReason))
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

  const hasDynamicFeedFilterSelectUpEntry = isNormalVideo && !!authorMid && !!authorName
  const onDynamicFeedFilterSelectUp = useMemoizedFn(async (newWindow?: boolean) => {
    if (!hasDynamicFeedFilterSelectUpEntry) return

    async function openInCurrentWindow() {
      dynamicFeedFilterSelectUp({
        upMid: Number(authorMid),
        upName: authorName,
        searchText: undefined,
      })
      videoSourceTabState.value = ETab.DynamicFeed
      await delay(100)
      await onRefresh?.()
    }

    function openInNewWindow() {
      const u = `/?dyn-mid=${authorMid}`
      GM.openInTab(u, { insert: true, active: true })
    }

    // newWindow ??= tab !== ETab.DynamicFeed
    newWindow ??= true

    if (newWindow) {
      openInNewWindow()
    } else {
      openInCurrentWindow()
    }
  })

  const hasRankingNo = isRanking(item)

  type MenuArr = MenuProps['items']
  const contextMenus: MenuArr = useMemo(() => {
    const watchLaterLabel = watchLaterAdded ? '移除稍后再看' : '稍后再看'

    const divider = { type: 'divider' as const }

    const copyMenus: MenuArr = [
      {
        key: 'copy-link',
        label: '复制视频链接',
        icon: <IconPark name='Copy' size={15} />,
        onClick: onCopyLink,
      },
      bvid && {
        key: 'copy-bvid',
        label: '复制 BVID',
        icon: <IconPark name='Copy' size={15} />,
        onClick() {
          copyContent(bvid)
        },
      },
    ].filter(Boolean)

    const actionMenus: MenuArr = [
      hasDislikeEntry && {
        key: 'dislike',
        label: '我不想看',
        icon: <DislikeIcon width={15} height={15} />,
        onClick() {
          onTriggerDislike()
        },
      },
      hasDynamicFeedFilterSelectUpEntry && {
        key: 'dymamic-feed-filter-select-up',
        label: '查看 UP 的动态',
        icon: <IconPark name='PeopleSearch' size={15} />,
        onClick() {
          onDynamicFeedFilterSelectUp()
        },
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
      hasBlacklistEntry && {
        key: 'add-up-to-filterlist',
        label: '将 UP 加入过滤列表',
        icon: <IconPark name='PeopleDelete' size={15} />,
        onClick: onAddUpToFilterList,
      },
      item.api === EApiType.Watchlater && {
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
          if (!avid) return

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
      item.api === EApiType.Watchlater &&
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
    ].filter(Boolean)

    const favMenus: MenuArr =
      item.api === EApiType.Fav
        ? [
            {
              key: 'open-fav-folder',
              label: '浏览收藏夹',
              icon: <OpenExternalLinkIcon css={C.size(15)} />,
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
        : []

    return [
      ...consistentOpenMenus,

      copyMenus.length && divider,
      ...copyMenus,

      actionMenus.length && divider,
      ...actionMenus,

      favMenus.length && divider,
      ...favMenus,

      conditionalOpenMenus.length && divider,
      ...conditionalOpenMenus,
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
    consistentOpenMenus,
    conditionalOpenMenus,
  ])

  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    updateFavFolderNames()
  })

  // 一堆 selector 增加权重
  const prefixCls = `.${APP_CLS_ROOT} .${APP_CLS_GRID} .${APP_CLS_CARD}`
  const bottomReset =
    styleNewCardStyle &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `
  const coverRoundStyle: TheCssType = [
    css`
      ${prefixCls} & {
        overflow: hidden;
        border-radius: ${borderRadiusValue};
        ${bottomReset}
      }
    `,
  ]

  return (
    <div
      ref={createRefCallback('card')}
      className='bili-video-card__wrap __scale-wrap'
      css={css`
        background-color: unset;
        position: static;
        height: 100%;
      `}
    >
      <Dropdown
        menu={{ items: contextMenus }}
        trigger={['contextMenu']}
        onOpenChange={onContextMenuOpenChange}
      >
        <a
          ref={createRefCallback('cover')}
          href={href}
          target='_blank'
          css={css`
            position: relative;
            overflow: hidden;
          `}
          onClick={handleVideoLinkClick}
          onContextMenu={(e) => {
            // try to solve https://github.com/magicdawn/bilibili-app-recommend/issues/92
            // can't reproduce on macOS
            e.preventDefault()
          }}
        >
          <div
            data-as='overflow-boundary'
            className='bili-video-card__image'
            style={{ aspectRatio: '16 / 9' }}
            css={coverRoundStyle}
          >
            {/* __image--wrap 上有 padding-top: 56.25% = 9/16, 用于保持高度, 在 firefox 中有明显的文字位移 */}
            {/* picture: absolute, top:0, left: 0  */}
            {/* 故加上 aspect-ratio: 16/9 */}
            <div className='bili-video-card__image--wrap'>
              <Picture
                className='v-img bili-video-card__cover'
                src={`${cover}@672w_378h_1c_!web-home-common-cover`}
                imgProps={{
                  // in firefox, alt text is visible during loading
                  alt: isFirefox ? '' : title,
                }}
              />
            </div>
          </div>

          <div className='bili-video-card__stats' css={coverRoundStyle}>
            <div className='bili-video-card__stats--left'>
              {statItems.map(({ field, value }) => (
                <StatItemDisplay key={field} field={field} value={value} />
              ))}
            </div>

            {/* 时长 */}
            {/* 番剧没有 duration 字段 */}
            <span className='bili-video-card__stats__duration'>{isNormalVideo && durationStr}</span>
          </div>

          {/* preview: follow-mouse or manual-control */}
          {!!(
            (isHoveringAfterDelay || typeof previewProgress === 'number') &&
            videoDataBox.state?.videoshotData?.image?.length &&
            duration
          ) && (
            <PreviewImage
              videoDuration={duration}
              pvideo={videoDataBox.state?.videoshotData}
              mouseEnterRelativeX={mouseEnterRelativeX}
              previewProgress={previewProgress}
              previewT={previewT}
            />
          )}

          {dislikeButtonEl && (
            <div className='left-actions' css={VideoCardActionStyle.topContainer('left')}>
              {/* 我不想看 */}
              {dislikeButtonEl}
            </div>
          )}

          {(watchlaterButtonEl || openInPopupButtonEl) && (
            <div className='right-actions' css={VideoCardActionStyle.topContainer('right')}>
              {/* 稍后再看 */}
              {watchlaterButtonEl}
              {/* 小窗打开 */}
              {openInPopupButtonEl}
            </div>
          )}

          {/* 充电专属 */}
          {hasChargeOnlyTag && <ChargeOnlyTag />}

          {/* 排行榜 */}
          {hasRankingNo && <RankingNumMark item={item} />}
        </a>
      </Dropdown>

      {/* bottom: after the cover */}
      <VideoCardBottom
        item={item}
        cardData={cardData}
        handleVideoLinkClick={handleVideoLinkClick}
      />
    </div>
  )
})
