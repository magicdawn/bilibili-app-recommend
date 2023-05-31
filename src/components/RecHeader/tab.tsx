import { settings, useSettingsSnapshot } from '$settings'
import { hasLogined, useHasLogined } from '$utility'

export const TabValue = ['normal', 'onlyFollow', 'dynamic'] as const
export type TabType = typeof TabValue extends ReadonlyArray<infer T> ? T : never

export function useCurrentSourceTab(): TabType {
  const { onlyFollowMode, useDynamicApi } = useSettingsSnapshot()
  const logined = useHasLogined()

  if (!logined) return 'normal'
  if (onlyFollowMode) return 'onlyFollow'
  if (useDynamicApi) return 'dynamic'
  return 'normal'
}

/**
 * outside react
 */

export function getCurrentSourceTab(): TabType {
  const { onlyFollowMode, useDynamicApi } = settings
  const logined = hasLogined()
  if (!logined) return 'normal'
  if (onlyFollowMode) return 'onlyFollow'
  if (useDynamicApi) return 'dynamic'
  return 'normal'
}
