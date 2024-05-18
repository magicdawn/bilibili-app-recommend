import { baseDebug } from '$common'
import { ETabType } from '$components/RecHeader/tab.shared'
import type { RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { dynamicFeedFilterStore } from '$modules/recommend/dynamic-feed'
import { settings, settings as settingsProxy } from '$modules/settings'
import { blacklistMids } from '$modules/user/relations/blacklist'
import { snapshot } from 'valtio'
import { CHARGE_ONLY_TEXT } from '../top-marks'
import { normalizeCardData } from './normalize'

const debug = baseDebug.extend('VideoCard:filter')

export function getFollowedStatus(recommendReason?: string): boolean {
  return !!recommendReason && ['已关注', '新关注'].includes(recommendReason)
}

/**
 * 用于快速判断是否应该启用过滤, 避免 normalizeData 等一些列操作
 */

export function anyFilterEnabled(tab: ETabType) {
  if (tab === ETabType.KeepFollowOnly) {
    return true
  }

  // common checks
  if (shouldEnableCommonChecks(tab)) {
    if (
      blacklistMids.size ||
      (settings.filterEnabled &&
        ((settings.filterByAuthorNameEnabled && settings.filterByAuthorNameKeywords.length > 0) ||
          (settings.filterByTitleEnabled && settings.filterByTitleKeywords.length > 0)))
    ) {
      return true
    }
  }

  // recommend
  if (tab === ETabType.RecommendApp || tab === ETabType.RecommendPc) {
    if (
      settings.filterEnabled &&
      (settings.filterMinDurationEnabled ||
        settings.filterMinPlayCountEnabled ||
        settings.filterOutGotoTypePicture)
    ) {
      return true
    }
  }

  // 动态过滤
  if (
    tab === ETabType.DynamicFeed &&
    dynamicFeedFilterStore.hasSelectedUp &&
    settings.hideChargeOnlyDynamicFeedVideos
  ) {
    return true
  }

  return false
}

function shouldEnableCommonChecks(tab: ETabType) {
  // expect
  // KeepFollowOnly = 'keep-follow-only',
  // DynamicFeed = 'dynamic-feed',
  // Watchlater = 'watchlater',
  // Fav = 'fav',
  return (
    [
      ETabType.RecommendApp,
      ETabType.RecommendPc,
      ETabType.PopularGeneral,
      ETabType.PopularWeekly,
      ETabType.Ranking,
    ] satisfies ETabType[]
  ).includes(tab)
}

export function filterRecItems(items: RecItemTypeOrSeparator[], tab: ETabType) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  const settings = snapshot(settingsProxy)

  return items.filter((item) => {
    // just keep it
    if (item.api === EApiType.Separator) return true

    const { play, duration, recommendReason, goto, authorName, authorMid, title, bvid, href } =
      normalizeCardData(item)
    const followed = getFollowedStatus(recommendReason)

    /**
     * 已关注 Tab
     */
    if (tab === 'keep-follow-only') {
      if (!followed) return false
    }

    function commonChecks() {
      // blacklist
      if (authorMid && blacklistMids.size) {
        if (blacklistMids.has(authorMid)) {
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
    }

    // expect
    // KeepFollowOnly = 'keep-follow-only',
    // DynamicFeed = 'dynamic-feed',
    // Watchlater = 'watchlater',
    // Fav = 'fav',
    if (shouldEnableCommonChecks(tab)) {
      if (commonChecks() === false) {
        return false
      }
    }

    // 动态过滤
    if (
      tab === ETabType.DynamicFeed &&
      dynamicFeedFilterStore.hasSelectedUp &&
      settings.hideChargeOnlyDynamicFeedVideos
    ) {
      if (recommendReason === CHARGE_ONLY_TEXT) {
        debug('filter out by dynamic-feed:hide-charge-only-rule: %s %o', recommendReason, {
          bvid,
          title,
        })
        return false
      }
    }

    // 推荐
    if (tab === ETabType.RecommendApp || tab === ETabType.RecommendPc) {
      const isVideo = goto === 'av'
      const isPicture = goto === 'picture'
      const isBangumi = goto === 'bangumi'
      if (isVideo) return filterVideo()
      if (isPicture) return filterPicture()
      if (isBangumi) return filterBangumi()
    }

    return true // just keep it

    function filterVideo() {
      // 不过滤已关注视频
      if (followed && !settings.enableFilterForFollowedVideo) return true

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
        if (followed && !settings.enableFilterForFollowedPicture) {
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
