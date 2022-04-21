import axios from 'axios'
import LRUCache from 'lru-cache'
import { getCsrfToken } from '@utility'
import { PvideoJson } from '../../define/pvideo'
import { DmJson } from '../../define/dm'

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
  const json = res.data as PvideoJson

  // TODO: process errors

  return json.data
}

// dm
export async function dm(aid: string) {
  // 暂时没有支持弹幕预览, 不调用该接口
  return []

  const res = await request.get('/x/v2/dm/ajax', { params: { aid } })
  const json = res.data as DmJson

  // TODO: process errors

  return json.data
}

export const cache = new LRUCache<string, VideoData>({ max: 200 })

export type VideoData = {
  pvideoData: PvideoJson['data']
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

/**
 * 添加 "稍后再看"
 */

function watchLaterFactory(action: 'add' | 'del') {
  return async function watchLaterOp(id: string) {
    const form = new FormData()
    form.append('aid', id)
    form.append('csrf', getCsrfToken())

    const res = await request.post('/x/v2/history/toview/' + action, form, {
      withCredentials: true,
    })

    // {
    //     "code": 0,
    //     "message": "0",
    //     "ttl": 1
    // }
    const json = res.data
    const success = json?.code === 0 && json?.message === '0'
    return success
  }
}

export const watchLaterAdd = watchLaterFactory('add')
export const watchLaterDel = watchLaterFactory('del')
