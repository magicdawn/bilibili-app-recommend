/**
 * xx秒 -> xx:xx:xx
 */

import { padStart } from 'lodash'

export function getDurationStr(d?: number) {
  if (!d) return '00:00'

  const hour = Math.trunc(d / 3600)
  d -= hour * 3600

  const minute = Math.trunc(d / 60)
  d -= minute * 60

  const sec = d

  const arr = [hour, minute, sec]
  if (arr[0] === 0) arr.shift()

  const s = arr.map((num) => padStart(num.toString(), 2, '0')).join(':')
  return s
}

export function getCountStr(count?: number) {
  if (!count) return ''

  if (count <= 9999) {
    return count.toString()
  }

  let _10k = (count / 10000).toFixed(1)
  _10k = _10k.replace(/\.0$/, '') // 81.0 -> 81
  return `${_10k}万`
}

export function getCountFromStr(str: string) {
  if (!str) return undefined
  if (/^\d+$/.test(str)) return Number(str)
  if (/^\d+(\.\d+?)?万$/.test(str)) return Number(str.slice(0, -1)) * 10000
}

// console.log(getCountFromStr('10000'))
// console.log(getCountFromStr('1.2万'))
// console.log(getCountFromStr('2万'))
