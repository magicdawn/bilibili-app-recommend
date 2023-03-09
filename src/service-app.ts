import { APP_NAME } from '$common'
import { toast } from '$utility/toast'
import { uniqBy } from 'lodash'
import pretry, { RetryError } from 'promise.retry'
import { format as fmt } from 'util'
import { AppRecItem, AppRecItemExtend, AppRecommendJson } from './define'
import { gmrequest, HOST_APP } from './request'

class RecReqError extends Error {
  json: AppRecommendJson
  constructor(json: AppRecommendJson) {
    super()
    Error.captureStackTrace(this, RecReqError)
    this.json = json
    this.message = json.message || JSON.stringify(json)
  }
}

export async function getRecommend() {
  // /x/feed/index
  const res = await gmrequest.get(HOST_APP + '/x/v2/feed/index', {
    responseType: 'json',
    params: {
      build: '1',
      mobi_app: 'android',
      idx: (Date.now() / 1000).toFixed(0) + '0' + (Math.random() * 10).toFixed(0),
    },
  })
  const json = res.data as AppRecommendJson

  // { "code": -663, "message": "鉴权失败，请联系账号组", "ttl": 1 }
  if (!json.data) {
    if (json.code === -663) {
      throw new RecReqError(json) // throw & retry
    }

    // 未知错误, 不重试
    toast(
      `${APP_NAME}: 未知错误, 请联系开发者\n\n  code=${json.code} message=${json.message || ''}`,
      '5s'
    )
    return []
  }

  const items = json?.data?.items || []
  return items
}

const tryfn = pretry(getRecommend, {
  times: 5,
  timeout: 2000,
  onerror(err, index) {
    console.info('[%s] tryGetRecommend onerror: index=%s', APP_NAME, index, err)
  },
})
export async function tryGetRecommend() {
  try {
    return await tryfn()
  } catch (e) {
    if (e instanceof RetryError) {
      console.error(e.errors)
      const msg = [
        fmt('请求出错, 已重试%s次:', e.times),
        ...e.errors.map((innerError, index) => fmt('  %s) %s', index + 1, innerError.message)),
        '',
        '请重新获取 access_key 后重试~',
      ].join('\n')
      toast(msg, '5s')
    }

    throw e
  }
}

// 一次10个不够, 多来几次
export async function _getRecommendTimes(times: number) {
  let list: AppRecItem[] = []

  // 并行: 快, 但是易出错
  const ps = new Array(times).fill(0).map((_) => tryGetRecommend())
  const results = await Promise.all(ps)
  list = results.reduce((ret, cur) => ret.concat(cur || []), [])

  // make api unique
  list = uniqBy(list, (item) => item.param)

  // add uuid
  // add api
  return list.map((item) => {
    return {
      ...item,
      api: 'app',
      uniqId: item.param + '-' + crypto.randomUUID(),
    } as AppRecItemExtend
  })
}

export async function _getRecommendForHome() {
  return _getRecommendTimes(2)
}
