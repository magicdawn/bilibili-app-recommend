import { APP_NAME } from '$common'
import { AntdTooltip } from '$components/AntdApp'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import {
  AndroidAppRecItemExtend,
  AppRecItemExtend,
  DynamicFeedItemExtend,
  IpadAppRecItemExtend,
  PcRecItemExtend,
  PopularGeneralItemExtend,
  RecItemType,
  WatchLaterItemExtend,
} from '$define'
import { FavItemExtend } from '$define/fav'
import { IconPark } from '$icon-park'
import { toHttps } from '$utility'
import {
  formatCount,
  formatDuration,
  formatTimeStamp,
  getVideoInvalidReason,
  parseCount,
  parseDuration,
} from '$utility/video'
import { BvCode } from '@mgdn/bvid'
import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { AppRecIconField, AppRecIconMap, getField } from '../app-rec-icon'
import { STAT_NUMBER_FALLBACK } from '../index.shared'

export type StatItemType = { field: AppRecIconField; value: string }

export interface IVideoCardData {
  // video
  avid: string
  bvid: string
  goto: string
  href: string
  title: string
  desc?: string
  titleRender?: ReactNode
  cover: string
  pubts?: number // unix timestamp
  pubdateDisplay?: string // for display
  pubdateDisplayTitle?: string
  duration: number
  durationStr: string
  recommendReason?: string
  invalidReason?: string // 已失效理由

  // stat
  play?: number
  like?: number
  coin?: number
  danmaku?: number
  favorite?: number
  bangumiFollow?: number
  statItems?: StatItemType[]

  // author
  authorName?: string
  authorFace?: string
  authorMid?: string

  // adpater specific
  appBadge?: string
  appBadgeDesc?: string
}

export function lookinto<T>(
  item: RecItemType,
  opts: {
    'pc': (item: PcRecItemExtend) => T
    'app': (item: AppRecItemExtend) => T
    'dynamic': (item: DynamicFeedItemExtend) => T
    'watchlater': (item: WatchLaterItemExtend) => T
    'fav': (item: FavItemExtend) => T
    'popular-general': (item: PopularGeneralItemExtend) => T
  }
): T {
  if (item.api === 'pc') return opts.pc(item)
  if (item.api === 'app') return opts.app(item)
  if (item.api === 'dynamic') return opts.dynamic(item)
  if (item.api === 'watchlater') return opts.watchlater(item)
  if (item.api === 'fav') return opts.fav(item)
  if (item.api === 'popular-general') return opts['popular-general'](item)

  throw new Error('unexpected api type')
}

export function normalizeCardData(item: RecItemType) {
  const ret = lookinto<IVideoCardData>(item, {
    'pc': apiPcAdapter,
    'app': apiAppAdapter,
    'dynamic': apiDynamicAdapter,
    'watchlater': apiWatchLaterAdapter,
    'fav': apiFavAdapter,
    'popular-general': apiPopularGeneralAdapter,
  })

  // handle mixed content
  if (ret.authorFace) ret.authorFace = toHttps(ret.authorFace)
  ret.cover = toHttps(ret.cover)

  return ret
}

export function apiAppAdapter(item: AppRecItemExtend): IVideoCardData {
  return item.device === 'android' ? apiAndroidAppAdapter(item) : apiIpadAppAdapter(item)
}

export function apiAndroidAppAdapter(item: AndroidAppRecItemExtend): IVideoCardData {
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
    cover: item.cover,
    pubts: undefined,
    pubdateDisplay: undefined,
    duration: item.player_args?.duration || 0,
    durationStr: formatDuration(item.player_args?.duration),
    recommendReason: item.rcmd_reason,

    // stat
    play: extractCountFor('play'),
    like: undefined,
    coin: undefined,
    danmaku: extractCountFor('danmaku'),
    favorite: undefined,
    bangumiFollow: extractCountFor('bangumiFollow'),

    // e.g 2023-09-17
    // cover_left_1_content_description: "156点赞"
    // cover_left_icon_1: 20
    // cover_left_text_1: "156"
    statItems: [
      item.cover_left_text_1 && {
        field: getField(item.cover_left_icon_1),
        value: item.cover_left_text_1,
      },
      item.cover_left_text_2 && {
        field: getField(item.cover_left_icon_2),
        value: item.cover_left_text_2,
      },
    ].filter(Boolean),

    // author
    authorName: item.args.up_name,
    authorFace: undefined,
    authorMid: String(item.args.up_id!),

    appBadge: item.badge,
    appBadgeDesc: item.desc_button?.text || item.desc || '',
  }
}
export function apiIpadAppAdapter(item: IpadAppRecItemExtend): IVideoCardData {
  const extractCountFor = (target: AppRecIconField) => {
    const { cover_left_text_1, cover_left_text_2, cover_left_text_3 } = item
    const arr = [cover_left_text_1, cover_left_text_2, cover_left_text_3].filter(Boolean)
    if (target === 'play') {
      const text = arr.find((text) => /观看|播放$/.test(text))
      if (!text) return
      const rest = text.replace(/观看|播放$/, '')
      return parseCount(rest)
    }

    if (target === 'danmaku') {
      const text = arr.find((text) => /弹幕$/.test(text))
      if (!text) return
      const rest = text.replace(/弹幕$/, '')
      return parseCount(rest)
    }

    if (target === 'bangumiFollow') {
      const text = arr.find((text) => /追剧$/.test(text))
      if (!text) return
      const rest = text.replace(/追剧$/, '')
      return parseCount(rest)
    }
  }

  const avid = item.param
  const bvid = item.bvid || BvCode.av2bv(Number(item.param))

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

  // stat
  const play = extractCountFor('play')
  const like = undefined
  const coin = undefined
  const danmaku = extractCountFor('danmaku')
  const favorite = undefined
  const bangumiFollow = extractCountFor('bangumiFollow')
  const statItems: StatItemType[] = [
    { field: 'play', value: formatCount(play) || STAT_NUMBER_FALLBACK },
    typeof danmaku === 'number'
      ? { field: 'danmaku', value: formatCount(danmaku) || STAT_NUMBER_FALLBACK }
      : { field: 'bangumiFollow', value: formatCount(bangumiFollow) || STAT_NUMBER_FALLBACK },
  ]

  return {
    // video
    avid,
    bvid,
    goto: item.goto,
    href,
    title: item.title,
    desc: item.desc,
    cover: item.cover,
    pubts: undefined,
    pubdateDisplay: undefined,
    duration: item.player_args?.duration || 0,
    durationStr: formatDuration(item.player_args?.duration),
    recommendReason: item.bottom_rcmd_reason || item.top_rcmd_reason, // TODO: top_rcmd_reason

    // stat
    play,
    like,
    coin,
    danmaku,
    favorite,
    bangumiFollow,
    statItems,

    // author
    authorName: item.args.up_name,
    authorFace: item.avatar.cover,
    authorMid: String(item.args.up_id || ''),

    appBadge: item.cover_badge,
    appBadgeDesc: item.desc,
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
    cover: item.pic,
    pubts: item.pubdate,
    pubdateDisplay: formatTimeStamp(item.pubdate),
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.rcmd_reason?.content,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    coin: undefined,
    danmaku: item.stat.danmaku,
    favorite: undefined,
    statItems: [
      { field: 'play', value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK },
      { field: 'like', value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK },
    ] as StatItemType[],

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

export function apiDynamicAdapter(item: DynamicFeedItemExtend): IVideoCardData {
  const v = item.modules.module_dynamic.major.archive
  const author = item.modules.module_author

  const oneDayAgo = dayjs().subtract(2, 'days').unix()
  const pubdateDisplay = (() => {
    const ts = author.pub_ts
    if (ts > oneDayAgo) {
      return author.pub_time
    } else {
      return formatTimeStamp(ts)
    }
  })()

  return {
    // video
    avid: v.aid,
    bvid: v.bvid,
    goto: 'av',
    href: `/video/${v.bvid}/`,
    title: v.title,
    cover: v.cover,
    pubts: author.pub_ts,
    pubdateDisplay,
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

export function apiWatchLaterAdapter(item: WatchLaterItemExtend): IVideoCardData {
  const invalidReason = getVideoInvalidReason(item.state)
  const title = `${item.viewed ? '【已观看】· ' : ''}${item.title}`
  const titleRender: ReactNode = invalidReason ? (
    <AntdTooltip
      title={<>视频已失效, 原因: {invalidReason}</>}
      align={{ offset: [0, -5] }}
      placement='topLeft'
    >
      <del>
        {item.viewed ? '【已观看】· ' : ''}
        {item.title}`
      </del>
    </AntdTooltip>
  ) : undefined

  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    goto: 'av',
    href: item.uri,
    title,
    titleRender,
    cover: item.pic,
    pubts: item.pubdate,
    pubdateDisplay: formatTimeStamp(item.pubdate),
    pubdateDisplayTitle: `${formatTimeStamp(item.pubdate, true)} 发布, ${formatTimeStamp(
      item.add_at,
      true
    )} 添加稍后再看`,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: `${formatTimeStamp(item.add_at)} · 稍后再看`,
    invalidReason,

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

export function apiFavAdapter(item: FavItemExtend): IVideoCardData {
  return {
    // video
    avid: String(item.id),
    bvid: item.bvid,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: `【${item.folder.title}】· ${item.title}`,
    titleRender: (
      <>
        【
        <IconPark
          name='Star'
          size={16}
          theme='two-tone'
          fill={['currentColor', colorPrimaryValue]}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            marginLeft: 10,
            marginRight: 4,
            marginTop: -4,
          }}
        />
        {item.folder.title}】· {item.title}
      </>
    ),
    cover: item.cover,
    pubts: item.pubtime,
    pubdateDisplay: formatTimeStamp(item.pubtime),
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: `${formatTimeStamp(item.fav_time)} · 收藏`,

    // stat
    play: item.cnt_info.play,
    like: undefined,
    coin: undefined,
    danmaku: item.cnt_info.danmaku,
    favorite: item.cnt_info.collect,

    // author
    authorName: item.upper.name,
    authorFace: item.upper.face,
    authorMid: String(item.upper.mid),
  }
}

export function apiPopularGeneralAdapter(item: PopularGeneralItemExtend): IVideoCardData {
  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: item.title,
    cover: item.pic,
    pubts: item.pubdate,
    pubdateDisplay: formatTimeStamp(item.pubdate),
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.rcmd_reason?.content,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    coin: undefined,
    danmaku: item.stat.danmaku,
    favorite: undefined,
    statItems: [
      { field: 'play', value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK },
      { field: 'like', value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK },
      { field: 'danmaku', value: formatCount(item.stat.danmaku) || STAT_NUMBER_FALLBACK },
    ] as StatItemType[],

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}
