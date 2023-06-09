import { settings, useSettingsSnapshot } from '$settings'
import { hasLogined, useHasLogined } from '$utility'

export const TabConfig = [
  { key: 'normal', label: '推荐' },
  { key: 'onlyFollow', label: '已关注' },
  { key: 'dynamic', label: '动态' },
  { key: 'watchlater', label: '稍后再看' },
] as const

export const TAB_ALLOW_VALUES = TabConfig.map((x) => x.key)
export type TabType = typeof TAB_ALLOW_VALUES extends ReadonlyArray<infer T> ? T : never

export function useCurrentSourceTab(): TabType {
  const { videoSourceTab } = useSettingsSnapshot()
  const logined = useHasLogined()
  if (!TAB_ALLOW_VALUES.includes(videoSourceTab)) return 'normal' // invalid
  if (!logined) return 'normal' // not logined
  return videoSourceTab
}

/**
 * outside react
 */

export function getCurrentSourceTab(): TabType {
  const { videoSourceTab } = settings
  const logined = hasLogined()
  if (!TAB_ALLOW_VALUES.includes(videoSourceTab)) return 'normal' // invalid
  if (!logined) return 'normal' // not logined
  return videoSourceTab
}
