import { baseDebug } from '$common'
import type { RankingItemExtendProps, RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import type { NormalRankingItem } from '$modules/recommend/ranking/api.normal-category'
import { RANKING_CATEGORIES_MAP, isNormalCategory } from '$modules/recommend/ranking/category'
import { settings, useSettingsSnapshot } from '$modules/settings'
import type { MouseEventHandler } from 'react'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import {
  VideoLinkOpenMode as Mode,
  VideoLinkOpenModeConfig as ModeConfig,
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  VideoLinkOpenMode,
  VideoLinkOpenModeKey,
} from '../index.shared'
import { openPipWindow } from './_pip-window'

const debug = baseDebug.extend('VideoCard:useOpenRelated')

/**
 * 花式打开
 */

export function useOpenRelated({
  href,
  item,
  actionButtonVisible,
}: {
  href: string
  item: RecItemType
  actionButtonVisible: boolean
}) {
  const { videoLinkOpenMode } = useSettingsSnapshot()

  function getHref(action?: (u: URL) => void) {
    const u = new URL(href, location.href)
    action?.(u)
    const newHref = u.href
    return newHref
  }

  const handleVideoLinkClick: MouseEventHandler = useMemoizedFn((e) => {
    if (settings.videoLinkOpenMode !== VideoLinkOpenMode.Normal) {
      e.preventDefault()
      onOpenWithMode()
    }
  })

  const onOpenWithMode = useMemoizedFn((mode?: Mode) => {
    mode ||= settings.videoLinkOpenMode

    const newHref = getHref((u) => {
      if (mode === Mode.Popup || mode === Mode.NormalWebFullscreen) {
        u.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.WebFullscreen)
      }
    })

    function commonOpen() {
      const active = mode !== Mode.Background
      GM.openInTab(newHref, {
        insert: true,
        active,
      })
    }

    const handlers: Record<Mode, () => void> = {
      [Mode.Normal]: commonOpen,
      [Mode.Background]: commonOpen,
      [Mode.NormalWebFullscreen]: commonOpen,
      [Mode.Popup]: () => openInPipOrPopup(newHref),
      [Mode.Iina]: openInIINA,
    }
    handlers[mode]?.()
  })

  async function openInPipOrPopup(newHref: string) {
    let popupWidth = 1000
    let popupHeight = Math.ceil((popupWidth / 16) * 9)

    /**
     * detect 竖屏视频
     */
    function handleVerticalVideo(w: number, h: number) {
      const maxHeight = Math.min(Math.floor(window.screen.availHeight * 0.8), 1000)
      const maxWidth = Math.floor((maxHeight / h) * w)
      popupWidth = Math.min(720, maxWidth)
      popupHeight = Math.floor((popupWidth / w) * h)
    }

    if (item.api === EApiType.App && item.uri?.startsWith('bilibili://')) {
      const searchParams = new URL(item.uri).searchParams
      const playerWidth = Number(searchParams.get('player_width') || 0)
      const playerHeight = Number(searchParams.get('player_height') || 0)
      if (playerWidth && playerHeight && !isNaN(playerWidth) && !isNaN(playerHeight)) {
        // 竖屏视频
        if (playerWidth < playerHeight) {
          handleVerticalVideo(playerWidth, playerHeight)
        }
      }
    }

    if (item.api === EApiType.Ranking && isNormalCategory(RANKING_CATEGORIES_MAP[item.slug])) {
      const _item = item as NormalRankingItem & RankingItemExtendProps
      const w = _item.dimension.width
      const h = _item.dimension.height
      if (w && h && !isNaN(w) && !isNaN(h)) {
        // 竖屏视频
        if (w < h) {
          handleVerticalVideo(w, h)
        }
      }
    }

    debug('openInPipOrPopup newHref=%s size=%sx%s', newHref, popupWidth, popupHeight)

    let pipWindow: Window | undefined
    if (window.documentPictureInPicture?.requestWindow) {
      try {
        // https://developer.chrome.com/docs/web-platform/document-picture-in-picture
        pipWindow = await window.documentPictureInPicture.requestWindow({
          width: popupWidth,
          height: popupHeight,
          disallowReturnToOpener: true,
        })
      } catch (e) {
        // noop
      }
    }

    if (pipWindow) {
      // use pipWindow
      openPipWindow(newHref, pipWindow)
    } else {
      // use window.open popup
      openPopupWindow(newHref, popupWidth, popupHeight)
    }
  }

  function openPopupWindow(newHref: string, popupWidth: number, popupHeight: number) {
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

  function openInIINA() {
    let usingHref = href
    if (item.api === EApiType.Watchlater) usingHref = `/video/${item.bvid}`
    const fullHref = new URL(usingHref, location.href).href
    const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`
    window.open(iinaUrl, '_self')
  }

  const consistentOpenMenus = useMemo(() => {
    return Object.values(VideoLinkOpenMode)
      .filter((mode) => typeof ModeConfig[mode].enabled === 'undefined')
      .map((mode) => {
        return {
          key: VideoLinkOpenModeKey[mode],
          label: ModeConfig[mode].label,
          icon: ModeConfig[mode].icon,
          onClick: () => onOpenWithMode(mode),
        }
      })
  }, [])

  const conditionalOpenMenus = useMemo(() => {
    return Object.values(Mode).filter(
      (mode) => typeof ModeConfig[mode].enabled === 'boolean' && ModeConfig[mode].enabled,
    ).length
      ? Object.values(VideoLinkOpenMode)
          .filter(
            (mode) => typeof ModeConfig[mode].enabled === 'boolean' && ModeConfig[mode].enabled,
          )
          .map((mode) => {
            return {
              key: VideoLinkOpenModeKey[mode],
              label: ModeConfig[mode].label,
              icon: ModeConfig[mode].icon,
              onClick: () => onOpenWithMode(mode),
            }
          })
      : []
  }, [])

  const openInPopupButtonEl = useMemo(() => {
    return (
      videoLinkOpenMode !== VideoLinkOpenMode.Popup && (
        <VideoCardActionButton
          visible={actionButtonVisible}
          inlinePosition={'right'}
          icon={ModeConfig.Popup.icon}
          tooltip={ModeConfig.Popup.label}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onOpenWithMode(VideoLinkOpenMode.Popup)
          }}
        />
      )
    )
  }, [videoLinkOpenMode, actionButtonVisible])

  const onOpenInPopup = useMemoizedFn(() => {
    onOpenWithMode(VideoLinkOpenMode.Popup)
  })

  return {
    onOpenWithMode,
    handleVideoLinkClick,
    consistentOpenMenus,
    conditionalOpenMenus,
    openInPopupButtonEl,
    onOpenInPopup,
  }
}
