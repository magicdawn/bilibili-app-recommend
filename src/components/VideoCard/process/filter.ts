import { baseDebug } from '$common'
import { ETab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { blacklistMids } from '$modules/bilibili/me/relations/blacklist'
import { isNormalRankingItem } from '$modules/rec-services/hot/ranking/category'
import { getSettingsSnapshot, settings } from '$modules/settings'
import { normalizeCardData } from './normalize'

const debug = baseDebug.extend('VideoCard:filter')

export function getFollowedStatus(recommendReason?: string): boolean {
  return !!recommendReason && ['已关注', '新关注'].includes(recommendReason)
}

/**
 * 用于快速判断是否应该启用过滤, 避免 normalizeData 等一些列操作
 */

export function anyFilterEnabled(tab: ETab) {
  if (tab === ETab.KeepFollowOnly) {
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
  if (tab === ETab.RecommendApp || tab === ETab.RecommendPc) {
    if (
      settings.filterEnabled &&
      (settings.filterMinDurationEnabled ||
        settings.filterMinPlayCountEnabled ||
        settings.filterOutGotoTypePicture)
    ) {
      return true
    }
  }

  return false
}

function shouldEnableCommonChecks(tab: ETab) {
  // except
  // KeepFollowOnly = 'keep-follow-only',
  // DynamicFeed = 'dynamic-feed',
  // Watchlater = 'watchlater',
  // Fav = 'fav',
  return ([ETab.RecommendApp, ETab.RecommendPc, ETab.Hot] satisfies ETab[]).includes(tab)
}

export function filterRecItems(items: RecItemTypeOrSeparator[], tab: ETab) {
  if (!anyFilterEnabled(tab)) {
    return items
  }

  const settings = getSettingsSnapshot()

  const blockUpMids = new Set<string>()
  const blockUpNames = new Set<string>()
  const regMidWithRemark = /^(?<mid>\d+)\([\S ]+\)$/
  const regMid = /^\d+$/
  settings.filterByAuthorNameKeywords.forEach((x) => {
    if (regMidWithRemark.test(x)) {
      const mid = regMidWithRemark.exec(x)?.groups?.mid
      if (mid) blockUpMids.add(mid)
    } else if (regMid.test(x)) {
      blockUpMids.add(x) // 会有纯数字的用户名么?
    } else {
      blockUpNames.add(x)
    }
  })

  const titleRegexList: RegExp[] = []
  const titleKeywordList: string[] = []
  settings.filterByTitleKeywords.forEach((keyword) => {
    if (keyword.startsWith('/') && keyword.endsWith('/')) {
      const regex = new RegExp(keyword.slice(1, -1), 'i')
      titleRegexList.push(regex)
    } else {
      titleKeywordList.push(keyword)
    }
  })

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
        settings.filterEnabled &&
        settings.filterByAuthorNameEnabled &&
        (blockUpMids.size || blockUpNames.size) &&
        (authorName || authorMid)
      ) {
        if (
          (authorName && blockUpNames.has(authorName)) ||
          (authorMid && blockUpMids.has(authorMid))
        ) {
          debug('filter out by author-rule: %o', {
            authorName,
            authorMid,
            rules: settings.filterByAuthorNameKeywords,
            blockUpMids,
            blockUpNames,
            bvid,
            title,
          })
          return false
        }
      }

      /**
       * title
       * 字面 title, 可能包含其他来源: 如 排行榜desc
       */
      let possibleTitles = [title]
      if (item.api === EApiType.Ranking && isNormalRankingItem(item) && item.desc) {
        possibleTitles.push(item.desc)
      }
      possibleTitles = possibleTitles.filter(Boolean)
      if (
        settings.filterEnabled &&
        settings.filterByTitleEnabled &&
        settings.filterByTitleKeywords.length &&
        possibleTitles.length
      ) {
        const titleHit = (title: string) =>
          titleKeywordList.some((keyword) => title.includes(keyword)) ||
          titleRegexList.some((regex) => regex.test(title))
        if (possibleTitles.some(titleHit)) {
          debug('filter out by title-rule: %o', {
            possibleTitles,
            rules: settings.filterByTitleKeywords,
            bvid,
          })
          return false
        }
      }
    }

    // except
    // KeepFollowOnly = 'keep-follow-only',
    // DynamicFeed = 'dynamic-feed',
    // Watchlater = 'watchlater',
    // Fav = 'fav',
    if (shouldEnableCommonChecks(tab)) {
      if (commonChecks() === false) {
        return false
      }
    }

    // 推荐
    if (tab === ETab.RecommendApp || tab === ETab.RecommendPc) {
      if (settings.filterEnabled) {
        const isVideo = goto === 'av'
        const isPicture = goto === 'picture'
        const isBangumi = goto === 'bangumi'
        if (isVideo) return filterVideo()
        if (isPicture) return filterPicture()
        if (isBangumi) return filterBangumi()
      }
    }

    return true // just keep it

    function filterVideo() {
      // 不过滤已关注视频
      if (followed && settings.exemptForFollowedVideo) return true

      // https://github.com/magicdawn/bilibili-app-recommend/issues/87
      // 反向推送, 蜜汁操作.
      if (recommendReason === '关注了你') {
        debug('filter out by recommendReason-rule: %s %o', recommendReason, {
          bvid,
          title,
        })
        return false
      }

      // play
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
        if (followed && settings.exemptForFollowedPicture) {
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
