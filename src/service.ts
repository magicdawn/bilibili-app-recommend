import { toast } from '$utility/toast'
import { RecItem, RecItemWithUniqId, RecommendJson } from './define'
import { gmrequest, HOST_APP } from './request'
import pretry, { RetryError } from 'promise.retry'

const APP_NAME = 'bilibili-app-recommend'.toUpperCase()

class RecReqError extends Error {
  json: RecommendJson
  constructor(json: RecommendJson) {
    super()
    Error.captureStackTrace(this, RecReqError)
    this.json = json
  }
}

export async function getRecommend() {
  const res = await gmrequest.get(HOST_APP + '/x/feed/index', {
    responseType: 'json',
    params: {
      build: '1',
      mobi_app: 'android',
      idx: (Date.now() / 1000).toFixed(0) + '0' + (Math.random() * 10).toFixed(0),
    },
  })
  const json = res.data as RecommendJson

  // {
  //   "code": -663,
  //   "message": "鉴权失败，请联系账号组",
  //   "ttl": 1
  // }
  if (!json.data) {
    if (json.code === -663) {
      throw new RecReqError(json) // throw & retry
    }

    toast(
      `${APP_NAME}: 未知错误, 请联系开发者\n\n  code=${json.code} message=${json.message || ''}`,
      10e3
    )
    return []
  }

  const items = json.data
  return items
}

const tryfn = pretry(getRecommend, { times: 5, timeout: 2000 })
export async function tryGetRecommend() {
  try {
    return await tryfn()
  } catch (e) {
    if (e instanceof RetryError) {
      console.error(e.errors)
      toast(`请求出错, 请重试 !!!`)
    }

    throw e
  }
}

export async function getHomeRecommend() {
  return getRecommendTimes(2)
}

// 一次10个不够, 多来几次
export async function getRecommendTimes(times: number) {
  const ps = new Array(times).fill(0).map((_) => tryGetRecommend())
  const results = await Promise.all(ps)
  let list = results.reduce((ret, cur) => ret.concat(cur || []), [])

  // make api unique
  list = uniqRecList(list)

  // add uuid
  return list.map((item) => {
    return { ...item, uniqId: item.param + '-' + crypto.randomUUID() } as RecItemWithUniqId
  })
}

// 去重
// Warning: Encountered two children with the same key, `299170596`. Keys should be unique so that components maintain their identity across updates
export function uniqRecList<T extends RecItem>(list: T[]) {
  const set = new Set<string>()

  list = list.filter((item) => {
    const { param } = item

    if (set.has(param)) {
      console.log('[bilibili-app-recommend]: [uniqRecList]: duplicate', item)
      return false
    }

    set.add(param)
    return true
  })

  return list
}
