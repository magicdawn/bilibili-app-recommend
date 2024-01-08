import type { CSSProperties } from 'react'

export const borderRadiusIdentifier = '--video-card-border-radius'
export const borderRadiusValue = `var(${borderRadiusIdentifier})`
export const borderRadiusStyle: CSSProperties = {
  borderRadius: borderRadiusValue,
}

export const STAT_NUMBER_FALLBACK = '0'

export const AUTO_PAGE_FULLSCREEN = {
  key: 'auto-page-fullscreen',
  value: 'true',
} as const
