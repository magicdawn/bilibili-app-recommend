import { PcRecItem, PcRecItemExtend, PcRecommendJson } from '$define'
import { settings } from '$settings'
import { uniqBy } from 'lodash'
import { request } from './request'

/**
 * 使用 web api 获取推荐
 */

export class PcRecService {
  static PAGE_SIZE = 14

  page = 0

  async getRecommend() {
    const curpage = ++this.page
    const res = await request.get('/x/web-interface/index/top/rcmd', {
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
    const items = json.data.item
    return items
  }

  async getRecommendTimes(times: number) {
    let list: PcRecItem[] = []

    const parallel = async () => {
      list = (await Promise.all(new Array(times).fill(0).map(() => this.getRecommend()))).flat()
    }
    const sequence = async () => {
      for (let x = 1; x <= times; x++) {
        list = list.concat(await this.getRecommend())
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
}
