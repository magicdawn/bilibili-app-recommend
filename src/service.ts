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
      access_key: config.access_key || '',
    },
  })

  const json = res.data as RecommendJson
  return json.data
}

// 一次10个不够
export async function getHomeRecommend() {
  const [arr1, arr2] = await Promise.all([getRecommend(), getRecommend()])
  return [...arr1, ...arr2]
}
