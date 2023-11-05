/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APP.html#typescript-javascript
 */

import md5 from 'md5'

type Params = Record<string, any>

/**
 * 为请求参数进行 APP 签名
 */

export function appSign(params: Params, appkey: string, appsec: string) {
  params.appkey = appkey
  const searchParams = new URLSearchParams(params)
  searchParams.sort()
  return md5(searchParams.toString() + appsec)
}
