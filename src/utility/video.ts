import dayjs from 'dayjs'

/**
 * '01:23' -> 83 (s)
 */
export function parseDuration(d?: string) {
  if (!d) return 0

  const units = [1, 60, 360]
  const splited = d
    .split(':')
    .map((s) => Number(s))
    .reverse()

  const total = splited.reduce((total, cur, index) => {
    return total + cur * units[index]
  }, 0)

  return total
}

/**
 * xx秒 -> xx:xx:xx
 */
export function formatDuration(d?: number) {
  d ||= 0
  return dayjs.duration(d || 0, 'seconds').format(d >= 3600 ? 'HH:mm:ss' : 'mm:ss')
}

export function formatCount(count?: number) {
  if (!count) return ''

  if (count <= 9999) {
    return count.toString()
  }

  let _10k = (count / 10000).toFixed(1)
  _10k = _10k.replace(/\.0$/, '') // 81.0 -> 81
  return `${_10k}万`
}

export function parseCount(str: string) {
  if (!str) return undefined
  if (str === '-') return 0 // -弹幕, 即 0弹幕
  if (/^\d+$/.test(str)) return Number(str)
  if (/^\d+(\.\d+?)?万$/.test(str)) return Number(str.slice(0, -1)) * 10000
}

const currentYear = dayjs().format('YYYY')

export function formatTimeStamp(unixTs?: number, includeTime = false) {
  if (!unixTs) return ''

  const t = dayjs.unix(unixTs)
  const extraFormat = includeTime ? ' HH:mm' : ''
  if (t.format('YYYY') === currentYear) {
    return t.format('M-D' + extraFormat)
  } else {
    return t.format('YY-M-D' + extraFormat)
  }
}

// https://socialsisteryi.github.io/bilibili-API-collect/docs/video/attribute_data.html#state%E5%AD%97%E6%AE%B5%E5%80%BC-%E7%A8%BF%E4%BB%B6%E7%8A%B6%E6%80%81
export const VideoStateMap = {
  '1': '橙色通过',
  '0': '开放浏览',
  '-1': '待审',
  '-2': '被打回',
  '-3': '网警锁定',
  '-4': '被锁定',
  '-5': '管理员锁定',
  '-6': '修复待审',
  '-7': '暂缓审核',
  '-8': '补档待审',
  '-9': '等待转码',
  '-10': '延迟审核',
  '-11': '视频源待修',
  '-12': '转储失败',
  '-13': '允许评论待审',
  '-14': '临时回收站',
  '-15': '分发中',
  '-16': '转码失败',
  '-20': '创建未提交',
  '-30': '创建已提交',
  '-40': '定时发布',
  '-100': '用户删除',
}

// true: valid
// string: invalid reason
export function getVideoInvalidReason(state: number | undefined): string | undefined {
  if (typeof state === 'undefined') return // unkown
  if (state >= 0) return // valid
  return VideoStateMap[state]
}
