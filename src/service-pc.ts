import { PcRecItem, PcRecItemExtend, PcRecommendJson } from '$define'
import { settings } from '$settings'
import { uniqBy } from 'lodash'
import { HOST_API, request } from './request'

/**
 * 使用 web api 获取推荐
 */

export type PageRef = { page: number }

export const PAGE_SIZE = 14

async function getRecommend(pageRef: PageRef) {
  const curpage = pageRef.page++
  const res = await request.get('/x/web-interface/index/top/rcmd', {
    baseURL: HOST_API,
    withCredentials: true,
    params: {
      fresh_type: 3,
      version: 1,
      ps: PAGE_SIZE, // >14 errors
      fresh_idx: curpage,
      fresh_idx_1h: curpage,
      homepage_ver: 1,
    },
  })

  const json = res.data as PcRecommendJson
  const items = json.data.item
  return items
}

export async function _getRecommendTimes(times: number, pageRef: PageRef) {
  let list: PcRecItem[] = []

  const parallel = async () => {
    list = (await Promise.all(new Array(times).fill(0).map(() => getRecommend(pageRef)))).flat()
  }
  const sequence = async () => {
    for (let x = 1; x <= times; x++) {
      list = list.concat(await getRecommend(pageRef))
    }
  }

  await (settings.useParallelRequest ? parallel : sequence)()

  list = uniqBy(list, (item) => item.id)

  // 推荐理由补全
  list.forEach((item) => {
    if (item.rcmd_reason?.reason_type === 1) {
      item.rcmd_reason.content ||= '已关注'
    }
  })

  return list.map((item) => {
    return {
      ...item,
      uniqId: item.id + '-' + crypto.randomUUID(),
      api: 'pc',
    } as PcRecItemExtend
  })
}

export async function _getRecommendForHome(pageRef: PageRef) {
  return _getRecommendTimes(1, pageRef)
}
