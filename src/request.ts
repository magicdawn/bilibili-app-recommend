import axios from 'axios'
import { config as $config } from './settings'

export const HOST_API = 'https://api.bilibili.com'
export const HOST_APP = 'https://app.bilibili.com'

export const request = axios.create({
  baseURL: HOST_API,
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

// 可以跨域
import gmAdapter from 'axios-userscript-adapter'
export const gmrequest = axios.create({ adapter: gmAdapter })

gmrequest.interceptors.request.use(
  function (config) {
    config.params = {
      access_key: $config.accessKey || '',
      ...config.params,
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
