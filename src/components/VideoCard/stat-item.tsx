/**
 * app 接口返回的 icon 是数字 (id), 映射成 field(play / like ...), field 映射成 svg-icon
 */

import { formatCount } from '$utility/video'
import { STAT_NUMBER_FALLBACK } from './index.shared'
import type { StatItemType } from './process/normalize'

export const AppRecIconSvgNameMap = {
  play: '#widget-video-play-count', // or #widget-play-count
  danmaku: '#widget-video-danmaku',
  like: '#widget-agree',
  bangumiFollow: '#widget-followed',
  favorite: '#widget-favorite',
  coin: '#widget-coin',
}

export type AppRecIconField = keyof typeof AppRecIconSvgNameMap

// app icon
export const AppRecIconMap: Record<number, keyof typeof AppRecIconSvgNameMap> = {
  1: 'play',
  2: 'like', // 没出现过, 猜的
  3: 'danmaku',
  4: 'bangumiFollow', // 追番
  20: 'like', // 动态点赞
}

export const AppRecIconScaleMap: Partial<Record<keyof typeof AppRecIconSvgNameMap, number>> = {
  bangumiFollow: 1.3,
  favorite: 0.9,
}

export function getField(id: number) {
  return AppRecIconMap[id] || AppRecIconMap[1] // 不认识的图标id, 使用 play
}

const getSvgName = (id: number) => {
  return AppRecIconSvgNameMap[getField(id)]
}
const getSvgScale = (id: number) => {
  const key = AppRecIconMap[id] // 不认识的图标id, 使用 undefined
  if (!key) return
  return AppRecIconScaleMap[key]
}

export function statItemForId(id: number) {
  return {
    iconSvgName: getSvgName(id),
    iconSvgScale: getSvgScale(id),
  }
}

export function StatItemDisplay({ field, value }: StatItemType) {
  const text = value
  const iconSvgName = AppRecIconSvgNameMap[field]
  const iconSvgScale = AppRecIconScaleMap[field]

  let _text: string
  if (typeof text === 'number' || (text && /^\d+$/.test(text))) {
    _text = formatCount(Number(text)) ?? STAT_NUMBER_FALLBACK
  } else {
    _text = text ?? STAT_NUMBER_FALLBACK
  }

  return (
    <span className='bili-video-card__stats--item'>
      <svg
        className='bili-video-card__stats--icon'
        style={{
          transform: iconSvgScale ? `scale(${iconSvgScale})` : undefined,
        }}
      >
        <use href={iconSvgName}></use>
      </svg>
      <span
        className='bili-video-card__stats--text'
        style={{ lineHeight: 'calc(var(--icon-size) + 1px)' }}
      >
        {_text}
      </span>
    </span>
  )
}
