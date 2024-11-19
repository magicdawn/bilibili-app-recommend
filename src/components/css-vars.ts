import { APP_NAMESPACE } from '$common'
import { tweakColorWithOklch } from '$utility/css'

export const borderRadiusIdentifier = '--video-card-border-radius'
export const borderRadiusValue = `var(${borderRadiusIdentifier})`

export const colorPrimaryIdentifier = `--${APP_NAMESPACE}-color-primary`
export const colorPrimaryValue = `var(${colorPrimaryIdentifier})`

export const bgIdentifier = `--${APP_NAMESPACE}-bg`
export const bgValue = `var(${bgIdentifier})`

export const borderColorIdentifier = `--${APP_NAMESPACE}-border-color`
export const borderColorValue = `var(${borderColorIdentifier})`

/**
 * 写死的话 (dark ? '#333' : styleUseWhiteBackground ? '#eee' : '#e5e6e7')
 * 切换 dark-mode 边框显得太突兀
 */

export function getBorderColor(darkMode: boolean, styleUseWhiteBackground: boolean) {
  if (darkMode) {
    return tweakColorWithOklch(bgValue, { deltaL: 0.07 }) // #222 -> #333
  } else {
    return tweakColorWithOklch(bgValue, { deltaL: -0.05 }) // #fff -> #eee
  }
}
