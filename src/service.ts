import axios from 'axios'
import gmAdapter from 'axios-userscript-adapter'
import { config } from '@settings'
import { RecommendJson } from '@define'

export const gmrequest = axios.create({ adapter: gmAdapter })

export async function getRecommend() {
  const res = await gmrequest.get('https://app.bilibili.com/x/feed/index', {
    params: {
      build: '1',
      mobi_app: 'android',
      idx: (Date.now() / 1000).toFixed(0),
      access_key: config.accessKey || '',
    },
  })

  const json = res.data as RecommendJson
  return json.data
}

export async function getHomeRecommend() {
  return getRecommendTimes(2)
}

// 一次10个不够, 多来几次
export async function getRecommendTimes(times: number) {
  const ps = new Array(times).fill(0).map((_) => getRecommend())
  const results = await Promise.all(ps)
  let list = results.reduce((ret, cur) => ret.concat(cur), [])

  // 去重
  // Warning: Encountered two children with the same key, `299170596`. Keys should be unique so that components maintain their identity across updates
  const set = new Set<string>()
  list = list.filter((item) => {
    const { param } = item
    if (set.has(param)) {
      console.log('[getRecommendTimes]: duplicate', item)
      return false
    } else {
      set.add(param)
      return true
    }
  })

  return list
}
