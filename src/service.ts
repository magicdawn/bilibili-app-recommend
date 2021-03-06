import { RecItem, RecItemWithUniqId, RecommendJson } from './define'
import { gmrequest, HOST_APP } from './request'

export async function getRecommend() {
  const res = await gmrequest.get(HOST_APP + '/x/feed/index', {
    responseType: 'json',
    params: {
      build: '1',
      mobi_app: 'android',
      idx: (Date.now() / 1000).toFixed(0),
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
