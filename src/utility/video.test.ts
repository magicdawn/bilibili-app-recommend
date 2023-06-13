import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { formatCount, formatTimeStamp, parseCount, parseDuration } from './video'

describe.concurrent('$utility/video', () => {
  it('.parseDuration', () => {
    expect(parseDuration('01:23')).to.equal(83)
    expect(parseDuration('00:01:23')).to.equal(83)
  })

  it('.parseCount', () => {
    expect(parseCount('10000')).to.equal(10000)
    expect(parseCount('1.2万')).to.equal(12000)
    expect(parseCount('2万')).to.equal(20000)
  })

  it('.formatCount', () => {
    expect(formatCount(10000)).to.equal('1万')
    expect(formatCount(12000)).to.equal('1.2万')
    expect(formatCount(20000)).to.equal('2万')
    expect(formatCount(1234)).to.equal('1234')
  })

  it('.formatTimeStamp', () => {
    const cur = Math.floor(Date.now() / 1000)
    expect(formatTimeStamp(cur)).to.equal(dayjs().format('M-D'))
    expect(formatTimeStamp(cur, true)).to.equal(dayjs().format('M-D HH:mm'))
  })
})
