import { IconPark } from '$modules/icon/icon-park'
import { isMac } from '$platform'
import mitt, { type Emitter } from 'mitt'
import type { ReactNode } from 'react'
import BiPip from '~icons/bi/pip'
import RiFullscreenFill from '~icons/ri/fullscreen-fill'

export const borderRadiusIdentifier = '--video-card-border-radius'
export const borderRadiusValue = `var(${borderRadiusIdentifier})`
export const borderRadiusStyle: CSSProperties = {
  borderRadius: borderRadiusValue,
}

export const STAT_NUMBER_FALLBACK = '0'

export const PLAYER_SCREEN_MODE = 'player-screen-mode'

export enum PlayerScreenMode {
  Normal = 'normal',
  Wide = 'wide',
  WebFullscreen = 'web',
  Fullscreen = 'full',
}

export enum VideoLinkOpenMode {
  Normal = 'Normal',
  NormalWebFullscreen = 'NormalWebFullscreen',
  Popup = 'Popup',
  Background = 'Background',
  Iina = 'Iina',
}

export const VideoLinkOpenModeKey: Record<VideoLinkOpenMode, string> = Object.entries(
  VideoLinkOpenMode,
).reduce(
  (record, [key, value]) => {
    return { ...record, [value]: `LinkOpenMode.${key}` }
  },
  {} as Record<VideoLinkOpenMode, string>,
)

export type VideoLinkOpenModeConfigItem = {
  label: string
  icon: ReactNode
  desc?: ReactNode
  enabled?: boolean
}

export const VideoLinkOpenModeConfig: Record<VideoLinkOpenMode, VideoLinkOpenModeConfigItem> = {
  [VideoLinkOpenMode.Normal]: {
    icon: <IconPark name='EfferentFour' size={15} />,
    label: '打开',
    desc: '默认新窗口打开',
  },
  [VideoLinkOpenMode.NormalWebFullscreen]: {
    icon: <RiFullscreenFill width={15} height={15} />,
    label: '打开-网页全屏',
    desc: <>默认新窗口打开, 打开后自动网页全屏</>,
  },
  [VideoLinkOpenMode.Popup]: {
    icon: <BiPip width={13} height={13} />,
    label: '小窗打开',
    desc: (
      <>
        当{' '}
        <a
          href='https://developer.chrome.com/docs/web-platform/document-picture-in-picture'
          target='_blank'
        >
          画中画窗口 API
        </a>{' '}
        可用时, 会使用画中画窗口的形式: 窗口置顶 + 播放页网页全屏.
        <br />
        当该 API 不可用时, 会使用 popup window + 播放页网页全屏 的形式.
      </>
    ),
  },
  [VideoLinkOpenMode.Background]: {
    icon: <IconPark name='Split' size={15} />,
    label: '后台打开',
  },
  [VideoLinkOpenMode.Iina]: {
    icon: <IconPark name='PlayTwo' size={15} />,
    label: '在 IINA 中打开',
    enabled: isMac,
    desc: (
      <>
        <a
          href='https://github.com/magicdawn/bilibili-app-recommend/blob/main/notes/iina.md'
          target='_blank'
        >
          macOS IINA 设置教程
        </a>
      </>
    ),
  },
}

export type VideoCardEvents = {
  // for cancel card
  'cancel-dislike': void

  // for normal card
  'open': undefined
  'open-in-popup': undefined
  'toggle-watch-later': void
  'trigger-dislike': void
  'start-preview-animation': void
  'hotkey-preview-animation': void

  'mouseenter': string
  'mouseenter-other-card': string
}

export type VideoCardEmitter = Emitter<VideoCardEvents>

export const defaultEmitter = mitt<VideoCardEvents>()
