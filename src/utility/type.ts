import type { Interpolation, Theme } from '@emotion/react'

export type ArrayItem<T extends any[]> = T extends Array<infer Inner> ? Inner : never

export type TheCssType = Interpolation<Theme>
