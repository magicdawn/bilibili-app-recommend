import { AppRecItemExtend, PcDynamicFeedItemExtend, PcRecItemExtend } from '$define'
import { parseCount, parseDuration } from '$utility/video'
import { AppRecIconField, AppRecIconMap } from '../app-rec-icon'

export function normalizeCardData(
  item: PcRecItemExtend | AppRecItemExtend | PcDynamicFeedItemExtend
) {
  /**
   * raw data
   */

  const isPc = item.api === 'pc'
  const isApp = item.api === 'app'
  const isPcDynamic = item.api === 'pc-dynamic'

  const pcDynamicVideo = isPcDynamic ? item.modules.module_dynamic.major.archive : undefined

  // id = avid
  const id = isPc ? String(item.id) : isApp ? String(item.param) : String(pcDynamicVideo?.aid)
  const bvid = isPc ? item.bvid : isApp ? '' : pcDynamicVideo?.bvid
  const goto = isPc ? item.goto : isApp ? item.goto : 'av'

  const extractCountFor = (target: AppRecIconField) => {
    if (!isApp) return undefined

    const { cover_left_icon_1, cover_left_text_1, cover_left_icon_2, cover_left_text_2 } = item
    if (cover_left_icon_1 && AppRecIconMap[cover_left_icon_1] === target) {
      return parseCount(cover_left_text_1)
    }
    if (cover_left_icon_2 && AppRecIconMap[cover_left_icon_2] === target) {
      return parseCount(cover_left_text_2)
    }
  }

  // stat
  const play = isPc
    ? item.stat.view
    : isApp
    ? extractCountFor('play')
    : parseCount(pcDynamicVideo?.stat.play || '0')

  const like = isPc ? item.stat.like : undefined
  const coin = isPc ? undefined : undefined
  const danmaku = isPc
    ? item.stat.danmaku
    : isApp
    ? extractCountFor('danmaku')
    : parseCount(pcDynamicVideo?.stat.danmaku || '0')

  // video info
  const title = isPc || isApp ? item.title : pcDynamicVideo!.title
  const coverRaw = isPc ? item.pic : isApp ? item.cover : pcDynamicVideo!.cover
  const pubdate = isPc ? item.pubdate : isApp ? undefined : item.modules.module_author.pub_ts // 获取不到发布时间
  const duration =
    (isPc
      ? item.duration
      : isApp
      ? item.player_args?.duration
      : parseDuration(pcDynamicVideo?.duration_text)) || 0

  // video owner info
  const name = isPc ? item.owner.name : isApp ? item.args.up_name : item.modules.module_author.name
  const face = isPc ? item.owner.face : isApp ? undefined : item.modules.module_author.avatar
  const mid = isPc ? item.owner.mid : isApp ? item.args.up_id : item.modules.module_author.mid

  // bangumi
  const favorite = isPc ? undefined : isApp ? undefined : undefined
  const appBadge = isPc ? undefined : isApp ? item.badge : undefined
  const appBadgeDesc = isPc
    ? undefined
    : isApp
    ? item.desc_button?.text || item.desc || ''
    : undefined
  const appBadgeStyleConfig = isPc ? undefined : isApp ? item.badge_style : undefined

  // 推荐理由
  const recommendReason = isPc
    ? item.rcmd_reason?.content
    : isApp
    ? item.rcmd_reason
    : pcDynamicVideo?.badge.text
  const recommendReasonStyleConfig = isPc ? undefined : isApp ? item.rcmd_reason_style : undefined

  return {
    isPc,
    isApp,

    id,
    bvid,
    goto,

    play,
    like,
    coin,
    danmaku,

    title,
    coverRaw,
    pubdate,
    duration,

    name,
    face,
    mid,

    favorite,
    recommendReason,
    recommendReasonStyleConfig,

    appBadge,
    appBadgeDesc,
    appBadgeStyleConfig,
  }
}
