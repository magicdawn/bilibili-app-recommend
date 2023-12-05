/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/wbi.html#javascript
 */

import { HOST_API } from '$common'
import axios from 'axios'
import dayjs from 'dayjs'
import md5 from 'md5'
import ms from 'ms'

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
function getMixinKey(orig: string) {
  let temp = ''
  mixinKeyEncTab.forEach((n) => {
    temp += orig[n]
  })
  return temp.slice(0, 32)
}

// 为请求参数进行 wbi 签名
export async function encWbi(params: Record<string, string | number>) {
  const { img_key, sub_key } = await getWbiKeys()
  const mixin_key = getMixinKey(img_key + sub_key)

  const curr_time = Math.round(Date.now() / 1000)
  const chr_filter = /[!'()*]/g
  const query: string[] = []
  console.log(1)

  // 添加 wts 字段
  params = { ...params, wts: curr_time }

  // 按照 key 重排参数
  Object.keys(params)
    .sort()
    .forEach((key) => {
      query.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(
          // 过滤 value 中的 "!'()*" 字符
          params[key].toString().replace(chr_filter, ''),
        )}`,
      )
    })

  const queryStr = query.join('&')
  const wbi_sign = md5(queryStr + mixin_key) // 计算 w_rid

  // extra params
  return { wts: curr_time, w_rid: wbi_sign }
}

type Keys = { img_key: string; sub_key: string }

let keysCache: Keys | undefined
let keysCacheTs: number | undefined
let keysCacheDate: string | undefined

// 获取最新的 img_key 和 sub_key
async function getWbiKeys(): Promise<Keys> {
  const genDate = () => dayjs().format('YYYYMMDD')

  const shouldReuse =
    keysCache &&
    keysCacheTs &&
    keysCacheDate &&
    keysCacheDate === genDate() &&
    Date.now() - keysCacheTs <= ms('6h')

  if (shouldReuse) {
    return keysCache!
  }

  // 直接用 axios, 防止与 $request 循环依赖
  const res = await axios.get('/x/web-interface/nav', { baseURL: HOST_API })
  const json = res.data
  const img_url = json.data.wbi_img.img_url as string
  const sub_url = json.data.wbi_img.sub_url as string
  const keys = {
    img_key: img_url.slice(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')),
    sub_key: sub_url.slice(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.')),
  }

  // save cache
  keysCache = keys
  keysCacheDate = genDate()
  keysCacheTs = Date.now()

  return keys
}

// encWbi({ foo: '114', bar: '514', baz: 1919810 }).then((val) => {
//   console.log(111, val)
// })
