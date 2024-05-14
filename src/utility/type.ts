import type { Interpolation, Theme } from '@emotion/react'
import type { MenuProps } from 'antd'

export type ArrayItem<T extends any[]> = T extends Array<infer Inner> ? Inner : never

export type TheCssType = Interpolation<Theme>

export type AntdMenuItemType = ArrayItem<Exclude<MenuProps['items'], undefined>>
