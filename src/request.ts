import axios from 'axios'
import { settings } from './settings'

export const HOST_API = 'https://api.bilibili.com'
export const HOST_APP = 'https://app.bilibili.com'

export const request = axios.create({
  baseURL: HOST_API,
  withCredentials: true,
})

request.interceptors.request.use(
  function (config) {
    if (!config.params?._) {
      config.params = { ...config.params, _: Date.now() }
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

/**
 * check json has {code: 0, message: "0"}
 */
export function isWebApiSuccess(json: any) {
  return json?.code === 0 && json?.message === '0'
}

// 可以跨域
import { appkey } from '$utility/auth'
import gmAdapter from 'axios-userscript-adapter'
export const gmrequest = axios.create({ adapter: gmAdapter })

gmrequest.interceptors.request.use(
  function (config) {
    config.params = {
      appkey,
      access_key: settings.accessKey || '',
      ...config.params,
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

gmrequest.interceptors.response.use((res) => {
  // content-type: "application/json; charset=utf-8"
  // responseData 是 ArrayBuffer
  if (res.config.responseType === 'json' && res.data && res.data instanceof ArrayBuffer) {
    const decoder = new TextDecoder()
    const u8arr = new Uint8Array(res.data)
    const text = decoder.decode(u8arr)
    res.data = text
    try {
      res.data = JSON.parse(text)
    } catch (e) {
      // noop
    }
  }
  return res
})
