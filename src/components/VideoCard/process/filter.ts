import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { settings } from '$settings'
import { normalizeCardData } from './normalize'

export function anyFilterEnabled() {
  return settings.filterMinDurationEnabled || settings.filterMinPlayCountEnabled
}

export function filterVideos(items: Array<PcRecItemExtend | AppRecItemExtend>) {
  if (!anyFilterEnabled()) {
    return items
  }

  return items.filter((item) => {
    const { play, duration, recommendReason } = normalizeCardData(item)

    if (!settings.enableFilterForFollowed) {
      const isFollowed = recommendReason === '已关注' || recommendReason?.includes('关注')
      if (isFollowed) return true
    }

    if (typeof play === 'number') {
      if (settings.filterMinPlayCountEnabled && settings.filterMinPlayCount) {
        if (play < settings.filterMinPlayCount) {
          return false
        }
      }
    }

    if (duration && settings.filterMinDurationEnabled && settings.filterMinDuration) {
      if (duration < settings.filterMinDuration) {
        return false
      }
    }

    return true
  })
}
