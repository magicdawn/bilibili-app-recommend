import mitt, { type Emitter } from 'mitt'

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

export type VideoCardEvents = {
  // for cancel card
  'cancel-dislike': void | undefined

  // for normal card
  'open': void | undefined
  'toggle-watch-later': void | undefined
  'trigger-dislike': void | undefined
  'start-preview-animation': void | undefined
  'hotkey-preview-animation': void | undefined

  'mouseenter': string
  'mouseenter-other-card': string
}

export type VideoCardEmitter = Emitter<VideoCardEvents>

export const defaultEmitter = mitt<VideoCardEvents>()
