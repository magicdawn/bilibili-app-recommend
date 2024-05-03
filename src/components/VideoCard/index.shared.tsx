import { IconPark } from '$icon-park'
import { isMac } from '$platform'
import mitt, { type Emitter } from 'mitt'
import type { ReactNode } from 'react'

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
  NormalFullscreen = 'NormalFullscreen',
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
  [VideoLinkOpenMode.NormalFullscreen]: {
    icon: <IconPark name='EfferentFour' size={15} />,
    label: '打开-全屏',
    desc: '默认新窗口打开, 打开后自动全屏; 注: 由于浏览器限制, 需要任意用户交互(如鼠标移动 / 鼠标点击 / 键盘按键)才能自动全屏',
  },
  [VideoLinkOpenMode.Popup]: {
    icon: <IconPark name='EfferentFour' size={15} />,
    label: '小窗打开',
  },
  [VideoLinkOpenMode.Background]: {
    icon: <IconPark name='Split' size={15} />,
    label: '后台打开',
  },
  [VideoLinkOpenMode.Iina]: {
    icon: <IconPark name='PlayTwo' size={15} />,
    label: '在 IINA 中打开',
    enabled: isMac,
  },
}

export type VideoCardEvents = {
  // for cancel card
  'cancel-dislike': void

  // for normal card
  'open': undefined
  'toggle-watch-later': void
  'trigger-dislike': void
  'start-preview-animation': void
  'hotkey-preview-animation': void

  'mouseenter': string
  'mouseenter-other-card': string
}

export type VideoCardEmitter = Emitter<VideoCardEvents>

export const defaultEmitter = mitt<VideoCardEvents>()
