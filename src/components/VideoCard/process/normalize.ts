import { APP_NAME } from '$common'
import { AppRecItemExtend, DynamicFeedItemExtend, PcRecItemExtend, RecItemType } from '$define'
import { BvCode } from '$utility/bv'
import { formatDuration, parseCount, parseDuration } from '$utility/video'
import { AppRecIconField, AppRecIconMap } from '../app-rec-icon'

export interface IVideoCardData {
  // video
  avid: string
  bvid: string
  goto: string
  href: string
  title: string
  coverRaw: string
  pubdate?: number
  duration: number
  durationStr: string
  recommendReason?: string

  // stat
  play?: number
  like?: number
  coin?: number
  danmaku?: number
  favorite?: number

  // author
  authorName?: string
  authorFace?: string
  authorMid?: string

  // adpater specific
  appBadge?: string
  appBadgeDesc?: string
}

export function normalizeCardData(item: RecItemType) {
  /**
   * raw data
   */

  const isPc = item.api === 'pc'
  const isApp = item.api === 'app'
  const isDynamic = item.api === 'dynamic'

  if (isPc) return apiPcAdapter(item)
  if (isApp) return apiAppAdapter(item)
  return apiDynamicAdapter(item)

  function lookinto<T>({
    pc,
    app,
    dynamic,
  }: {
    pc: (item: PcRecItemExtend) => T
    app: (item: AppRecItemExtend) => T
    dynamic: (item: DynamicFeedItemExtend) => T
  }) {
    if (isPc) return pc(item)
    if (isApp) return app(item)
    return dynamic(item)
  }
}

export function apiPcAdapter(item: PcRecItemExtend): IVideoCardData {
  return {
    // video
    avid: String(item.id),
    bvid: item.bvid,
    goto: item.goto,
    href: item.goto === 'av' ? `/video/${item.bvid}/` : item.uri,
    title: item.title,
    coverRaw: item.pic,
    pubdate: item.pubdate,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.rcmd_reason?.content,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    coin: undefined,
    danmaku: item.stat.danmaku,
    favorite: undefined,

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

export function apiAppAdapter(item: AppRecItemExtend): IVideoCardData {
  const extractCountFor = (target: AppRecIconField) => {
    const { cover_left_icon_1, cover_left_text_1, cover_left_icon_2, cover_left_text_2 } = item
    if (cover_left_icon_1 && AppRecIconMap[cover_left_icon_1] === target) {
      return parseCount(cover_left_text_1)
    }
    if (cover_left_icon_2 && AppRecIconMap[cover_left_icon_2] === target) {
      return parseCount(cover_left_text_2)
    }
  }

  const avid = item.param
  const bvid = BvCode.av2bv(Number(item.param))

  const href = (() => {
    // valid uri
    if (item.uri.startsWith('http://') || item.uri.startsWith('https://')) {
      return item.uri
    }

    // more see https://github.com/magicdawn/bilibili-app-recommend/issues/23#issuecomment-1533079590

    if (item.goto === 'av') {
      return `/video/${bvid}/`
    }

    if (item.goto === 'bangumi') {
      console.warn(`[${APP_NAME}]: bangumi uri should not starts with 'bilibili://': %s`, item.uri)
      return item.uri
    }

    // goto = picture, 可能是专栏 or 动态
    // 动态的 url 是 https://t.bilibili.com, 使用 uri
    // 专栏的 url 是 bilibili://article/<id>
    if (item.goto === 'picture') {
      const id = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)?.[1]
      if (id) return `/read/cv${id}`
      return item.uri
    }

    return item.uri
  })()

  return {
    // video
    avid,
    bvid,
    goto: item.goto,
    href,
    title: item.title,
    coverRaw: item.cover,
    pubdate: undefined,
    duration: item.player_args?.duration || 0,
    durationStr: formatDuration(item.player_args?.duration),
    recommendReason: item.rcmd_reason,

    // stat
    play: extractCountFor('play'),
    like: undefined,
    coin: undefined,
    danmaku: extractCountFor('danmaku'),
    favorite: undefined,

    // author
    authorName: item.args.up_name,
    authorFace: undefined,
    authorMid: String(item.args.up_id!),

    appBadge: item.badge,
    appBadgeDesc: item.desc_button?.text || item.desc || '',
  }
}

export function apiDynamicAdapter(item: DynamicFeedItemExtend): IVideoCardData {
  const v = item.modules.module_dynamic.major.archive
  const author = item.modules.module_author

  return {
    // video
    avid: v.aid,
    bvid: v.bvid,
    goto: 'av',
    href: `/video/${v.bvid}/`,
    title: v.title,
    coverRaw: v.cover,
    pubdate: item.modules.module_author.pub_ts,
    duration: parseDuration(v.duration_text) || 0,
    durationStr: v.duration_text,
    recommendReason: v.badge.text,

    // stat
    play: parseCount(v.stat.play),
    danmaku: parseCount(v.stat.danmaku),
    like: undefined,
    coin: undefined,
    favorite: undefined,

    // author
    authorName: author.name,
    authorFace: author.face,
    authorMid: author.mid.toString(),
  }
}
