import { CSSProperties } from 'react'

export const borderRadiusIdentifier = '--video-card-border-radius'
export const borderRadiusValue = `var(${borderRadiusIdentifier})`
export const borderRadiusStyle: CSSProperties = {
  borderRadius: borderRadiusValue,
}
