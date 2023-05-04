/**
 * {
  "text": "2万点赞",
  "text_color": "#FFFFFFFF",
  "bg_color": "#FFFB9E60",
  "border_color": "#FFFB9E60",
  "text_color_night": "#E5E5E5",
  "bg_color_night": "#BC7A4F",
  "border_color_night": "#BC7A4F",
  "bg_style": 1
}

看不清啊~, 所以不用这个
background-color: rgba(255, 251, 158, 0.376);
color: rgb(255, 255, 255);
border-color: rgba(255, 251, 158, 0.376);
 */

import { Style } from '$define/app-recommend'
import { useIsDarkMode } from '$platform'
import { CSSProperties } from 'react'

export function useBadgeStyle(styleConfig?: Style) {
  const dark = useIsDarkMode()

  if (!styleConfig) return

  const {
    bg_color,
    bg_color_night,
    text_color,
    text_color_night,
    border_color,
    border_color_night,
    text,
    bg_style,
  } = styleConfig

  const backgroundColor = dark ? bg_color_night : bg_color
  const textColor = dark ? text_color_night : text_color
  const borderColor = dark ? border_color_night : border_color

  return {
    backgroundColor,
    color: textColor,
    borderColor,
  } as CSSProperties
}
