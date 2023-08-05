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

export function filterRecItems(items: RecItemType[], tab: TabType) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  return items.filter((item) => {
    const { play, duration, recommendReason, goto } = normalizeCardData(item)
    const isFollowed = recommendReason === '已关注' || recommendReason?.includes('关注')

    /**
     * 已关注 Tab
     */
    if (tab === 'onlyFollow') {
      if (!isFollowed) return false
    }

    const isVideo = goto === 'av'
    const isPicture = goto === 'picture'
    // console.log('filter: goto = %s', goto)

    if (isVideo) return filterVideo()
    if (isPicture) return filterPicture()

    return true // just keep it

    function filterVideo() {
      // 不过滤已关注视频
      if (isFollowed && !settings.enableFilterForFollowedVideo) return true

      // paly
      if (
        settings.filterMinPlayCountEnabled &&
        settings.filterMinPlayCount &&
        typeof play === 'number' &&
        play < settings.filterMinPlayCount
      ) {
        return false
      }

      // duration
      if (
        settings.filterMinDurationEnabled &&
        settings.filterMinDuration &&
        duration &&
        duration < settings.filterMinDuration
      ) {
        return false
      }

      return true
    }

    function filterPicture() {
      if (settings.filterOutGotoTypePicture) {
        return false
      } else {
        return true
      }
    }
  })
}
