import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { settings } from '$settings'
import { normalizeCardData } from './normalize'

export function filterVideos(items: Array<PcRecItemExtend | AppRecItemExtend>) {
  if (!(settings.filterMinDurationEnabled || settings.filterMinPlayCountEnabled)) {
    return items
  }

  return items.filter((item) => {
    const { play, duration } = normalizeCardData(item)

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
