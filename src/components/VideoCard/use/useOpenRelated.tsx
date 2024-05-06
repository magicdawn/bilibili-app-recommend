import { APP_NAME_ROOT_CLASSNAME, baseDebug } from '$common'
import { AntdApp } from '$components/AntdApp'
import type { RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { settings, useSettingsSnapshot } from '$modules/settings'
import createEmotion from '@emotion/css/create-instance'
import { useHover } from 'ahooks'
import { Button } from 'antd'
import { once } from 'lodash'
import type { MouseEventHandler } from 'react'
import RadixIconsOpenInNewWindow from '~icons/radix-icons/open-in-new-window'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import {
  VideoLinkOpenMode as Mode,
  VideoLinkOpenModeConfig as ModeConfig,
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  VideoLinkOpenMode,
  VideoLinkOpenModeKey,
} from '../index.shared'

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
      if (mode === Mode.NormalFullscreen) {
        u.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.Fullscreen)
      }
      if (mode === Mode.Popup) {
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
      [Mode.NormalFullscreen]: commonOpen,
      [Mode.Popup]: () => openInPipOrPopup(newHref),
      [Mode.Iina]: openInIINA,
    }
    handlers[mode]?.()
  })

  async function openInPipOrPopup(newHref: string) {
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

  function openPipWindow(newHref: string, pipWindow: Window) {
    const cssInsertContainer = pipWindow.document.head
    const { css, cache } = createEmotion({
      key: 'pip-window',
      container: cssInsertContainer,
    })

    const iframe = document.createElement('iframe')
    iframe.src = newHref
    pipWindow.document.body.append(iframe)

    const resetCls = css`
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      border: none;
    `
    pipWindow.document.body.classList.add(resetCls)
    iframe.classList.add(resetCls)

    const container = document.createElement('div')
    container.classList.add(APP_NAME_ROOT_CLASSNAME)
    pipWindow.document.body.appendChild(container)

    const root = createRoot(container)
    root.render(
      <AntdApp emotionCache={cache} styleProviderProps={{ container: cssInsertContainer }}>
        <CloseButton newHref={newHref} pipWindow={pipWindow} />
      </AntdApp>,
    )

    setTimeout(() => {
      // focus original window
      window.focus()
    }, 500)
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
    if (item.api === 'watchlater') usingHref = `/video/${item.bvid}`
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
      ? [
          { type: 'divider' as const },
          ...Object.values(VideoLinkOpenMode)
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
            }),
        ]
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

function CloseButton({ newHref, pipWindow }: { pipWindow: Window; newHref: string }) {
  const hovering = useHover(pipWindow.document.documentElement)

  const focusOnce = useMemo(() => {
    return once(() => {
      window.focus()
    })
  }, [])
  useKeyPress(
    ['leftarrow', 'rightarrow', 'uparrow', 'downawrrow', 'esc', 'tab'],
    (e) => {
      focusOnce()
    },
    {
      exactMatch: true,
      target: pipWindow.document.documentElement,
    },
  )

  return (
    <Button
      onClick={(e) => {
        pipWindow.close()
        const u = new URL(newHref)
        u.searchParams.delete(PLAYER_SCREEN_MODE)
        GM.openInTab(u.href)
      }}
      css={css`
        position: fixed;
        right: 10px;
        top: 10px;
        display: ${hovering ? 'flex' : 'none'};
        align-items: center;
        text-align: center;
        justify-content: center;
      `}
    >
      <RadixIconsOpenInNewWindow
        css={css`
          margin-right: 5px;
        `}
      />
      打开
    </Button>
  )
}
