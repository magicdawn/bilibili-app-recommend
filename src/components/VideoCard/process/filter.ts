import type { TabType } from '$components/RecHeader/tab.shared'
import type { RecItemExtraType } from '$define'
import { ApiType } from '$define/index.shared'
import { settings } from '$modules/settings'
import { normalizeCardData } from './normalize'

export function anyFilterEnabled(tab: TabType) {
  return (
    tab === 'keep-follow-only' ||
    (settings.filterEnabled &&
      (settings.filterMinDurationEnabled ||
        settings.filterMinPlayCountEnabled ||
        settings.filterOutGotoTypePicture))
  )
}

export function filterRecItems(items: RecItemExtraType[], tab: TabType) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  return items.filter((item) => {
    // just keep it
    if (item.api === ApiType.separator) return true

    const { play, duration, recommendReason, goto } = normalizeCardData(item)
    const isFollowed = recommendReason === '已关注' || recommendReason?.includes('关注')

    /**
     * 已关注 Tab
     */
    if (tab === 'keep-follow-only') {
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
        // 不去掉已关注的图文
        if (isFollowed && !settings.enableFilterForFollowedPicture) {
          return true
        }
        return false
      } else {
        return true
      }
    }
  })
}
