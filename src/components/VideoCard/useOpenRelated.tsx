import { APP_NAME_ROOT_CLASSNAME, baseDebug } from '$common'
import { useColorPrimaryHex } from '$components/ModalSettings/theme.shared'
import type { RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { settings } from '$modules/settings'
import createEmotion, { type Emotion } from '@emotion/css/create-instance'
import type { MouseEventHandler } from 'react'
import RadixIconsOpenInNewWindow from '~icons/radix-icons/open-in-new-window'
import {
  VideoLinkOpenMode as Mode,
  VideoLinkOpenModeConfig as ModeConfig,
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  VideoLinkOpenMode,
  VideoLinkOpenModeKey,
} from './index.shared'

const debug = baseDebug.extend('VideoCard:useOpenRelated')

/**
 * 花式打开
 */

export function useOpenRelated({ href, item }: { href: string; item: RecItemType }) {
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
    if ((globalThis as any).documentPictureInPicture?.requestWindow) {
      try {
        // https://developer.chrome.com/docs/web-platform/document-picture-in-picture
        pipWindow = await (globalThis as any).documentPictureInPicture.requestWindow({
          width: popupWidth,
          height: popupHeight,
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
    const { css } = createEmotion({
      key: 'pip-window',
      container: pipWindow.document.head,
    })

    const Cls = {
      reset: css`
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      `,
      iframe: css`
        border: none;
      `,
    }

    pipWindow.document.body.classList.add(Cls.reset)

    const iframe = document.createElement('iframe')
    iframe.src = newHref
    iframe.classList.add(Cls.reset, Cls.iframe)
    pipWindow.document.body.append(iframe)

    const container = document.createElement('div')
    container.classList.add(APP_NAME_ROOT_CLASSNAME)
    pipWindow.document.body.appendChild(container)

    const root = createRoot(container)
    root.render(
      <>
        <CloseButton newHref={newHref} pipWindow={pipWindow} _css={css} />
      </>,
    )
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

  return {
    onOpenWithMode,
    handleVideoLinkClick,
    consistentOpenMenus,
    conditionalOpenMenus,
  }
}

function CloseButton({
  newHref,
  pipWindow,
  _css: css,
}: {
  pipWindow: Window
  newHref: string
  _css: Emotion['css']
}) {
  const [hovering, setHovering] = useState(false)
  useEffect(() => {
    const el = pipWindow.document.documentElement
    const on = () => setHovering(true)
    const off = () => setHovering(false)

    el.addEventListener('mouseenter', on)
    el.addEventListener('mouseleave', off)

    return () => {
      el.removeEventListener('mouseenter', on)
      el.addEventListener('mouseleave', off)
    }
  }, [])

  const colorPrimary = useColorPrimaryHex()

  return (
    <>
      {/* 没法用 StyleProvider, antd 样式不生效啊~ */}
      <button
        onClick={(e) => {
          pipWindow.close()
          const u = new URL(newHref)
          u.searchParams.delete(PLAYER_SCREEN_MODE)
          GM.openInTab(u.href)
        }}
        className={css`
          --ant-button-font-weight: 400;
          --ant-button-default-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
          --ant-button-primary-shadow: 0 2px 0 rgba(11, 99, 74, 0.16);
          --ant-button-danger-shadow: 0 2px 0 rgba(255, 38, 5, 0.06);
          --ant-button-primary-color: #fff;
          --ant-button-danger-color: #fff;
          --ant-button-border-color-disabled: #d9d9d9;
          --ant-button-default-ghost-color: #ffffff;
          --ant-button-ghost-bg: transparent;
          --ant-button-default-ghost-border-color: #ffffff;
          --ant-button-padding-inline: 15px;
          --ant-button-padding-inline-lg: 15px;
          --ant-button-padding-inline-sm: 7px;
          --ant-button-only-icon-size: 16px;
          --ant-button-only-icon-size-sm: 14px;
          --ant-button-only-icon-size-lg: 18px;
          --ant-button-group-border-color: #46b3a4;
          --ant-button-link-hover-bg: transparent;
          --ant-button-text-hover-bg: rgba(0, 0, 0, 0.06);
          --ant-button-default-color: rgba(0, 0, 0, 0.88);
          --ant-button-default-bg: #ffffff;
          --ant-button-default-border-color: #d9d9d9;
          --ant-button-default-border-color-disabled: #d9d9d9;
          --ant-button-default-hover-bg: #ffffff;
          --ant-button-default-hover-color: #46b3a4;
          --ant-button-default-hover-border-color: #46b3a4;
          --ant-button-default-active-bg: #ffffff;
          --ant-button-default-active-color: #178079;
          --ant-button-default-active-border-color: #178079;
          --ant-button-content-font-size: 14px;
          --ant-button-content-font-size-sm: 14px;
          --ant-button-content-font-size-lg: 16px;
          --ant-button-content-line-height: 1.5714285714285714;
          --ant-button-content-line-height-sm: 1.5714285714285714;
          --ant-button-content-line-height-lg: 1.5;
          --ant-button-padding-block: 4px;
          --ant-button-padding-block-sm: 0px;
          --ant-button-padding-block-lg: 7px;
          --ant-border-radius: 6px;
          --ant-line-width: 1px;
          --ant-line-type: solid;

          appearance: button;
          -webkit-appearance: button;

          font-size: 13px;
          line-height: 24px;

          display: ${hovering ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;

          background: var(--ant-button-default-bg);
          border-color: var(--ant-button-default-border-color);
          color: var(--ant-button-default-color);
          box-shadow: var(--ant-button-default-shadow);

          height: var(--ant-control-height);
          padding: var(--ant-button-padding-block) var(--ant-button-padding-inline);
          border-radius: var(--ant-border-radius);

          outline: none;
          font-weight: var(--ant-button-font-weight);
          white-space: nowrap;
          text-align: center;
          border: var(--ant-line-width) var(--ant-line-type) transparent;
          cursor: pointer;
          transition: all var(--ant-motion-duration-mid) var(--ant-motion-ease-in-out);
          user-select: none;
          touch-action: manipulation;
          box-sizing: border-box;

          position: fixed;
          right: 10px;
          top: 10px;

          /* &:hover {
            background: var(--ant-button-default-hover-bg);
            border-color: var(--ant-button-default-hover-border-color);
            color: var(--ant-button-default-hover-color);
            box-shadow: var(--ant-button-default-hover-shadow);
          } */
          &:hover {
            background: var(--ant-button-default-hover-bg);
            border-color: ${colorPrimary};
            color: ${colorPrimary};
          }
        `}
      >
        <RadixIconsOpenInNewWindow
          className={css`
            margin-right: 5px;
          `}
        />
        打开
      </button>
    </>
  )
}
