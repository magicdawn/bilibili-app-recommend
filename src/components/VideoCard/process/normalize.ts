import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { parseCount } from '$utility/video'
import { AppRecIconField, AppRecIconMap } from '../app-rec-icon'

export function normalizeCardData(item: PcRecItemExtend | AppRecItemExtend) {
  /**
   * raw data
   */

  const isPc = item.api === 'pc'
  const isApp = item.api === 'app'

  // id = avid
  const id = isPc ? String(item.id) : String(item.param)
  const bvid = isPc ? item.bvid : ''
  const goto = item.goto

  const extractCountFor = (target: AppRecIconField) => {
    if (isPc) return undefined

    const { cover_left_icon_1, cover_left_text_1, cover_left_icon_2, cover_left_text_2 } = item
    if (cover_left_icon_1 && AppRecIconMap[cover_left_icon_1] === target) {
      return parseCount(cover_left_text_1)
    }
    if (cover_left_icon_2 && AppRecIconMap[cover_left_icon_2] === target) {
      return parseCount(cover_left_text_2)
    }
  }

  // stat
  const play = isPc ? item.stat.view : extractCountFor('play')

  const like = isPc ? item.stat.like : undefined
  const coin = isPc ? undefined : undefined
  const danmaku = isPc ? item.stat.danmaku : extractCountFor('danmaku')

  // video info
  const title = item.title
  const coverRaw = isPc ? item.pic : item.cover
  const pubdate = isPc ? item.pubdate : undefined // 获取不到发布时间
  const duration = (isPc ? item.duration : item.player_args?.duration) || 0

  // video owner info
  const name = isPc ? item.owner.name : item.args.up_name
  const face = isPc ? item.owner.face : undefined
  const mid = isPc ? item.owner.mid : item.args.up_id

  // bangumi
  const favorite = isPc ? undefined : undefined
  const bangumiBadge = isPc ? undefined : item.badge
  const bangumiDesc = isPc ? undefined : item.desc_button?.text || ''

  // 推荐理由
  const rcmd_reason = isPc ? item.rcmd_reason?.content : item.rcmd_reason

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
    bangumiBadge,
    bangumiDesc,

    rcmd_reason,
  }
}
