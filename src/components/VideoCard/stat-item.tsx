import { formatCount } from '$utility/video'
import type { ReactNode } from 'react'
import { STAT_NUMBER_FALLBACK } from './index.shared'

export const AllowedStatItemFields = [
  'play',
  'danmaku',
  'like',
  'bangumi:follow',
  'favorite',
  'coin',
  'live:viewed-by', // 直播: 多少人看过
] as const

export type StatItemField = (typeof AllowedStatItemFields)[number]

export type StatItemType = {
  field: StatItemField
  value: number | string | undefined
}
export function defineStatItem(item: StatItemType) {
  return item
}
export function defineStatItems(items: StatItemType[]) {
  return items
}

/**
 * how to render these stat items
 */
export const StatFieldConfig: Record<
  StatItemField,
  { svgHref?: string; svgScale?: number; render?: (props: { className?: string }) => ReactNode }
> = {
  'play': { svgHref: '#widget-video-play-count' }, // or #widget-play-count,
  'danmaku': { svgHref: '#widget-video-danmaku' },
  'like': { svgHref: '#widget-agree' },
  'bangumi:follow': { svgHref: '#widget-followed', svgScale: 1.3 },
  'favorite': { svgHref: '#widget-favorite', svgScale: 0.9 },
  'coin': { svgHref: '#widget-coin' },
  'live:viewed-by': {
    render({ className }) {
      return <IconParkOutlinePreviewOpen className={className} />
    },
  },
}

/**
 * app 接口返回的 icon 是数字 (id), 映射成 field(play / like ...), field 映射成 svg-icon
 */
export const AppRecStatItemFieldMap: Record<number, StatItemField> = {
  1: 'play',
  2: 'like', // 没出现过, 猜的
  3: 'danmaku',
  4: 'bangumi:follow', // 追番
  20: 'like', // 动态点赞
}
export function getField(id: number) {
  return AppRecStatItemFieldMap[id] || AppRecStatItemFieldMap[1] // 不认识的图标id, 使用 play
}

export function StatItemDisplay({ field, value }: StatItemType) {
  const text = value
  const usingText = useMemo(() => {
    if (typeof text === 'number' || (text && /^\d+$/.test(text))) {
      return formatCount(Number(text)) ?? STAT_NUMBER_FALLBACK
    } else {
      return text ?? STAT_NUMBER_FALLBACK
    }
  }, [text])

  const svgClassName = 'bili-video-card__stats--icon'
  const icon: ReactNode = useMemo(() => {
    const { svgHref, svgScale, render } = StatFieldConfig[field]
    if (render) {
      return render({ className: svgClassName })
    }
    if (svgHref) {
      return (
        <svg
          className={svgClassName}
          style={{ transform: svgScale ? `scale(${svgScale})` : undefined }}
        >
          <use href={svgHref}></use>
        </svg>
      )
    }
  }, [field])

  return (
    <span className='bili-video-card__stats--item'>
      {icon}
      <span
        className='bili-video-card__stats--text'
        style={{ lineHeight: 'calc(var(--icon-size) + 1px)' }}
      >
        {usingText}
      </span>
    </span>
  )
}
