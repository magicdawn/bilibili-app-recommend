import { getCurrentSourceTab } from '$components/RecHeader/tab'
import { RecItemType } from '$define'
import { settings } from '$settings'
import { normalizeCardData } from './normalize'

export function anyFilterEnabled() {
  return (
    settings.filterMinDurationEnabled ||
    settings.filterMinPlayCountEnabled ||
    settings.videoSourceTab === 'onlyFollow'
  )
}

export function filterVideos(items: RecItemType[]) {
  if (!anyFilterEnabled()) {
    return items
  }

  return items.filter((item) => {
    const { play, duration, recommendReason } = normalizeCardData(item)
    const isFollowed = recommendReason === '已关注' || recommendReason?.includes('关注')

    /**
     * 已关注模式
     */

    if (getCurrentSourceTab() === 'onlyFollow') {
      return isFollowed
    }

    /**
     * 推荐筛选
     */

    if (!settings.enableFilterForFollowed) {
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
