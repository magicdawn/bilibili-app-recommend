import { baseDebug } from '$common'
import type { ETabType } from '$components/RecHeader/tab.shared'
import type { RecItemExtraType } from '$define'
import { EApiType } from '$define/index.shared'
import { settings, settings as settingsProxy } from '$modules/settings'
import { blacklistIds } from '$modules/user/relations/blacklist'
import { snapshot } from 'valtio'
import { normalizeCardData } from './normalize'

const debug = baseDebug.extend('VideoCard:filter')

export function anyFilterEnabled(tab: ETabType) {
  return (
    tab === 'keep-follow-only' ||
    (settings.filterEnabled &&
      (settings.filterMinDurationEnabled ||
        settings.filterMinPlayCountEnabled ||
        settings.filterOutGotoTypePicture ||
        (settings.filterByAuthorNameEnabled && settings.filterByAuthorNameKeywords.length > 0) ||
        (settings.filterByTitleEnabled && settings.filterByTitleKeywords.length > 0)))
  )
}

export function filterRecItems(items: RecItemExtraType[], tab: ETabType) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  const settings = snapshot(settingsProxy)

  return items.filter((item) => {
    // just keep it
    if (item.api === EApiType.Separator) return true

    const { play, duration, recommendReason, goto, authorName, authorMid, title, bvid, href } =
      normalizeCardData(item)
    const isFollowed = recommendReason === '已关注' || !!recommendReason?.endsWith('关注')

    /**
     * 已关注 Tab
     */
    if (tab === 'keep-follow-only') {
      if (!isFollowed) return false
    }

    const isVideo = goto === 'av'
    const isPicture = goto === 'picture'
    const isBangumi = goto === 'bangumi'
    // console.log('filter: goto = %s', goto)

    if (authorMid && blacklistIds.size) {
      if (blacklistIds.has(authorMid)) {
        debug('filter out by blacklist-rule: %s %o', authorMid, { bvid, title })
        return false
      }
    }

    // up
    if (
      settings.filterByAuthorNameEnabled &&
      settings.filterByAuthorNameKeywords.length &&
      (authorName || authorMid)
    ) {
      if (
        (authorName && settings.filterByAuthorNameKeywords.includes(authorName)) ||
        (authorMid && settings.filterByAuthorNameKeywords.includes(authorMid))
      ) {
        debug('filter out by author-rule: %o', {
          authorName,
          authorMid,
          rules: settings.filterByAuthorNameKeywords,
          bvid,
          title,
        })
        return false
      }
    }

    // title
    if (settings.filterByTitleEnabled && settings.filterByTitleKeywords.length && title) {
      if (
        settings.filterByTitleKeywords.some((keyword) => {
          if (keyword.startsWith('/') && keyword.endsWith('/')) {
            const regex = new RegExp(keyword.slice(1, -1), 'i')
            return regex.test(title)
          } else {
            return title.includes(keyword)
          }
        })
      ) {
        debug('filter out by title-rule: %o', {
          title,
          rules: settings.filterByTitleKeywords,
          bvid,
        })
        return false
      }
    }

    if (isVideo) return filterVideo()
    if (isPicture) return filterPicture()
    if (isBangumi) return filterBangumi()

    return true // just keep it

    function filterVideo() {
      // 不过滤已关注视频
      if (isFollowed && !settings.enableFilterForFollowedVideo) return true

      // https://github.com/magicdawn/bilibili-app-recommend/issues/87
      // 反向推送, 蜜汁操作.
      if (recommendReason === '关注了你') {
        debug('filter out by recommendReason-rule: %s %o', recommendReason, {
          bvid,
          title,
        })
        return false
      }

      // paly
      if (
        settings.filterMinPlayCountEnabled &&
        settings.filterMinPlayCount &&
        typeof play === 'number' &&
        play < settings.filterMinPlayCount
      ) {
        debug('filter out by min-play-count-rule: %s < %s, %o', play, settings.filterMinPlayCount, {
          bvid,
          title,
        })
        return false
      }

      // duration
      if (
        settings.filterMinDurationEnabled &&
        settings.filterMinDuration &&
        duration &&
        duration < settings.filterMinDuration
      ) {
        debug('filter out by min-duration-rule: %s < %s %o', duration, settings.filterMinDuration, {
          bvid,
          title,
        })
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
        debug('filter out by goto-type-picture-rule: %s %o', goto, {
          bvid,
          title,
        })
        return false
      } else {
        return true
      }
    }

    function filterBangumi() {
      if (settings.filterOutGotoTypeBangumi) {
        debug('filter out by goto-type-bangumi-rule: %s %o', goto, { title, href })
        return false
      }
      return true
    }
  })
}
