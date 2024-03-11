import type { PcRecItem, PcRecItemExtend, PcRecommendJson } from '$define'
import { request } from '$request'
import { toast } from '$utility/toast'
import { uniqBy } from 'lodash'
import type { IService } from './base'

/**
 * 使用 web api 获取推荐
 */

export class PcRecService implements IService {
  static PAGE_SIZE = 14

  page = 0

  hasMore = true

  loadMore() {
    return this.getRecommendTimes(2)
  }

  async getRecommend(signal: AbortSignal | undefined = undefined) {
    const curpage = ++this.page // this has parallel call, can not ++ after success

    // /x/web-interface/index/top/rcmd
    // /x/web-interface/wbi/index/top/rcmd
    const res = await request.get('/x/web-interface/wbi/index/top/rcmd', {
      signal,
      params: {
        fresh_type: 3,
        version: 1,
        ps: PcRecService.PAGE_SIZE, // >14 errors
        fresh_idx: curpage,
        fresh_idx_1h: curpage,
        homepage_ver: 1,
      },
    })

    const json = res.data as PcRecommendJson
    if (!json.data?.item) {
      toast(json.message || 'API 请求没有返回结果')
    }

    const items = json.data?.item || []
    return items
  }

  async getRecommendTimes(times: number, signal: AbortSignal | undefined = undefined) {
    let list: PcRecItem[] = []

    const parallel = async () => {
      list = (
        await Promise.all(new Array(times).fill(0).map(() => this.getRecommend(signal)))
      ).flat()
    }
    const sequence = async () => {
      for (let x = 1; x <= times; x++) {
        list = list.concat(await this.getRecommend(signal))
      }
    }

    await (true ? parallel : sequence)()

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
}
