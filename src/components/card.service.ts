import axios from 'axios'
import LRUCache from 'lru-cache'
import { DmJson } from '../define/dm'
import { RecommendJson } from '../define/recommend'

export const HOST_API = 'https://api.bilibili.com'
export const request = axios.create({
  baseURL: HOST_API,
})

// Add a request interceptor
request.interceptors.request.use(
  function (config) {
    if (!config.params?._) {
      config.params = { ...config.params, _: Date.now() }
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()
// 视频预览
export async function pvideo(aid: string) {
  const res = await request.get('/pvideo', { params: { aid } })
  const json = res.data as RecommendJson

  // TODO: process errors

  return json.data
}

// dm
export async function dm(aid: string) {
  const res = await request.get('/x/v2/dm/ajax', { params: { aid } })
  const json = res.data as DmJson

  // TODO: process errors

  return json.data
}

export const cache = new LRUCache<string, VideoData>({ max: 200 })

export type VideoData = {
  pvideoData: RecommendJson['data']
  dmData: DmJson['data']
}

export async function getVideoData(id: string) {
  if (cache.has(id)) {
    return cache.get(id) as VideoData
  }

  const [pvideoData, dmData] = await Promise.all([pvideo(id), dm(id)])
  cache.set(id, { pvideoData, dmData })

  return { pvideoData, dmData }
}
