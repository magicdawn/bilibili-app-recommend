import { APP_NAME, HOST_APP } from '$common'
import type { AppRecItem, AppRecItemExtend, AppRecommendJson } from '$define'
import type { ipad } from '$define/app-recommend.ipad'
import { EAppApiDevice } from '$define/index.shared'
import { settings } from '$modules/settings'
import { gmrequest } from '$request'
import { toast } from '$utility/toast'
import { random, uniqBy } from 'lodash'
import pretry from 'promise.retry'
import { QueueStrategy, type IService } from './_base'

class RecReqError extends Error {
  json: AppRecommendJson
  constructor(json: AppRecommendJson) {
    super()
    this.json = json
    this.message = json.message || JSON.stringify(json)
    Error.captureStackTrace(this, RecReqError)
  }
}

export class AppRecService implements IService {
  // 无法指定, 16 根据返回得到
  static PAGE_SIZE = 16

  hasMore = true
  qs = new QueueStrategy<AppRecItemExtend>(AppRecService.PAGE_SIZE)

  private async getRecommend(device: EAppApiDevice) {
    let platformParams: Record<string, string | number> = {}
    if (device === EAppApiDevice.android) {
      platformParams = { mobi_app: 'android' }
    }
    if (device === EAppApiDevice.ipad) {
      // has avatar, date, etc. see BewlyBewly's usage
      platformParams = { mobi_app: 'iphone', device: 'pad' }
    }

    // /x/feed/index
    const res = await gmrequest.get(HOST_APP + '/x/v2/feed/index', {
      responseType: 'json',
      params: {
        build: '1',
        ...platformParams,
        // idx: 返回的 items.idx 为传入 idx+1, idx+2, ...
        idx: Math.floor(Date.now() / 1000) + random(1000, false),
      },
    })
    const json = res.data as ipad.AppRecommendJson

    // { "code": -663, "message": "鉴权失败，请联系账号组", "ttl": 1 }
    if (!json.data) {
      if (json.code === -663) {
        throw new RecReqError(json) // throw & retry
      }
      // 未知错误, 不重试
      toast(
        `${APP_NAME}: 未知错误, 请联系开发者\n\n  code=${json.code} message=${json.message || ''}`,
        5000,
      )
      return []
    }

    const items = json?.data?.items || []
    return items
  }

  private tryGetRecommend = pretry(this.getRecommend, {
    times: 5,
    timeout: 2000,
    onerror(err, index) {
      console.info('[%s] tryGetRecommend onerror: index=%s', APP_NAME, index, err)
    },
  })

  loadMore() {
    return this.getRecommendTimes(2)
  }

  // 一次不够, 多来几次
  async getRecommendTimes(times: number) {
    if (this.qs.bufferQueue.length) {
      return this.qs.sliceFromQueue()
    }

    let list: AppRecItem[] = []

    let device: EAppApiDevice = settings.appApiDecice
    if (device !== EAppApiDevice.ipad && device !== EAppApiDevice.android) {
      device = EAppApiDevice.ipad
    }

    const parallel = async () => {
      list = (
        await Promise.all(new Array(times).fill(0).map(() => this.tryGetRecommend(device)))
      ).flat()
    }
    const sequence = async () => {
      for (let x = 1; x <= times; x++) {
        list = list.concat(await this.tryGetRecommend(device))
      }
    }

    // 并行: 快,but 好多重复啊
    await (true ? parallel : sequence)()

    // rm ad & unsupported card_type
    list = list.filter((item) => {
      // ad
      // card_type & card_goto exists, goto may exists
      if (item.card_goto?.includes('ad')) return false
      if (item.goto?.includes('ad')) return false
      if ((item as any).ad_info) return false

      // unsupported: bannner
      if ((item.card_goto as string | undefined) === 'banner') return false

      return true
    })

    // unique in method level
    list = uniqBy(list, (item) => item.param)

    // add uuid
    // add api
    const _list = list.map((item) => {
      return {
        ...item,
        api: 'app',
        device, // android | ipad
        uniqId: item.param + '-' + crypto.randomUUID(),
      } as AppRecItemExtend
    })
    return this.qs.doReturnItems(_list)
  }
}
