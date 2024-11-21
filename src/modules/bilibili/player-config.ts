import type { BiliPlayerConfig } from './player-config-types'

export function getBiliPlayerConfig(): BiliPlayerConfig | undefined {
  const key = 'bpx_player_profile'
  const str = localStorage.getItem(key)
  if (!str) return
  try {
    const val = JSON.parse(str) as BiliPlayerConfig
    return val
  } catch {
    return
  }
}

export function getBiliPlayerConfigAutoPlay(): boolean {
  const config = getBiliPlayerConfig()
  return !!config?.media.autoplay
}
