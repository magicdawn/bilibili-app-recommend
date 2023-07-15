import { TabType } from '$components/RecHeader/tab'
import { RecItemType } from '$define'
import { settings } from '$settings'
import { normalizeCardData } from './normalize'

export function anyFilterEnabled(tab: TabType) {
  return (
    tab === 'onlyFollow' ||
    settings.filterMinDurationEnabled ||
    settings.filterMinPlayCountEnabled ||
    settings.filterOutGotoTypePicture
  )
}

export function filterVideos(items: RecItemType[], tab: TabType) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  return items.filter((item) => {
    const { play, duration, recommendReason, goto } = normalizeCardData(item)
    const isFollowed = recommendReason === '已关注' || recommendReason?.includes('关注')

    /**
     * 已关注模式
     */

    if (tab === 'onlyFollow') {
      return isFollowed
    }

    /**
     * 过滤范围
     */

    if (!settings.enableFilterForFollowed) {
      if (isFollowed) return true
    }

    /**
     * 过滤条件
     */

    if (
      settings.filterMinPlayCountEnabled &&
      settings.filterMinPlayCount &&
      typeof play === 'number' &&
      play < settings.filterMinPlayCount
    ) {
      return false
    }

    if (
      settings.filterMinDurationEnabled &&
      settings.filterMinDuration &&
      duration &&
      duration < settings.filterMinDuration
    ) {
      return false
    }

    if (settings.filterOutGotoTypePicture && goto === 'picture') {
      return false
    }

    return true
  })
}
