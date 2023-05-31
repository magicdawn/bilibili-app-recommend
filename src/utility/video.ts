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
// console.log(parseDuration('01:23'))
// console.log(parseDuration('00:01:23'))

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

// console.log(getCountFromStr('10000'))
// console.log(getCountFromStr('1.2万'))
// console.log(getCountFromStr('2万'))

const currentYear = dayjs().format('YYYY')

export function formatTimeStamp(unixTs?: number) {
  if (!unixTs) return ''

  const dayCtime = dayjs.unix(unixTs)
  if (dayCtime.format('YYYY') === currentYear) {
    return dayCtime.format('M-D')
  } else {
    return dayCtime.format('YY-M-D')
  }
}
