import { HOST_APP } from '$common'
import type { AppRecItem, AppRecItemExtend, RecItemType } from '$define'
import type { ipad } from '$define/app-recommend.ipad'
import { EApiType, EAppApiDevice } from '$define/index.shared'
import { getSettingsSnapshot } from '$modules/settings'
import { gmrequest } from '$request'
import { getHasLogined } from '$utility/cookie'
import { randomInt, shuffle, uniqBy } from 'es-toolkit'
import { times } from 'es-toolkit/compat'
import { QueueStrategy, type IService } from './_base'
import {
  DynamicFeedRecService,
  getDynamicFeedServiceConfig,
  type DynamicFeedServiceConfig,
} from './dynamic-feed'
import {
  DF_SELECTED_KEY_ALL,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
} from './dynamic-feed/store'
import { FavRecService, getFavServiceConfig, type FavServiceConfig } from './fav'
import { FavItemsOrder } from './fav/fav-enum'
import { WatchLaterRecService } from './watchlater'

type AppRecServiceConfig = ReturnType<typeof getAppRecServiceConfig>

export function getAppRecServiceConfig() {
  const snap = getSettingsSnapshot().appRecommend

  let deviceParamForApi: EAppApiDevice = snap.deviceParamForApi
  if (!Object.values(EAppApiDevice).includes(deviceParamForApi)) {
    deviceParamForApi = EAppApiDevice.ipad
  }

  return {
    deviceParamForApi,
    addOtherTabContents: snap.addOtherTabContents,
  }
}

export class AppRecService implements IService {
  static PAGE_SIZE = 20
  qs = new QueueStrategy<RecItemType>(AppRecInnerService.PAGE_SIZE)

  innerService: AppRecInnerService
  allServices: IService[] = []
  otherTabServices: IService[] = []

  constructor(public config: AppRecServiceConfig) {
    this.innerService = new AppRecInnerService(this.config.deviceParamForApi)
    this.allServices = [this.innerService]
    this.initOtherTabServices()
  }

  initOtherTabServices() {
    if (!getHasLogined()) return
    if (!this.config.addOtherTabContents) return

    let dynamicFeedService: IService
    let favService: IService
    let watchlaterService: IService
    {
      const config = Object.assign(getDynamicFeedServiceConfig(), {
        upMid: undefined,
        followGroupTagId: undefined,
        searchText: undefined,
        dynamicFeedVideoType: DynamicFeedVideoType.All,
        hideChargeOnlyVideos: true,
        filterMinDuration: DynamicFeedVideoMinDuration.All,
        filterMinDurationValue: 0,
        selectedKey: DF_SELECTED_KEY_ALL,
        viewingAll: true,
        viewingSomeUp: false,
        viewingSomeGroup: false,
        showLiveInDynamicFeed: true,
        whenViewAllEnableHideSomeContents: false,
        whenViewAllHideIds: new Set(),
        advancedSearch: false,
        searchCacheEnabled: false,
        forceUseMergeTime: false,
        startingOffset: undefined,
        minId: undefined,
        minTs: undefined,
      } satisfies DynamicFeedServiceConfig)
      dynamicFeedService = new DynamicFeedRecService(config)
    }
    {
      const config = Object.assign(getFavServiceConfig(), {
        selectedKey: 'all',
        itemsOrder: FavItemsOrder.Shuffle,
        selectedFavFolderId: undefined,
        selectedFavFolder: undefined,
        selectedFavCollectionId: undefined,
        selectedFavCollection: undefined,
        addSeparator: false,
      } satisfies Partial<FavServiceConfig>)
      favService = new FavRecService(config)
    }
    {
      watchlaterService = new WatchLaterRecService(false)
    }
    this.otherTabServices = [dynamicFeedService, favService, watchlaterService]

    const allServices: IService[] = []
    const rate = 7 / 3
    allServices.push(...this.otherTabServices)
    times(Math.round(rate * this.otherTabServices.length), () =>
      allServices.push(this.innerService),
    )
    this.allServices = shuffle(allServices)
  }

  get hasMore() {
    return (
      !!this.qs.bufferQueue.length ||
      this.innerService.hasMore ||
      this.otherTabServices.some((s) => s.hasMore)
    )
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.hasMore) return

    // fill if needed
    while (this.hasMore && this.qs.bufferQueue.length < AppRecService.PAGE_SIZE * 3) {
      const restServices = this.allServices.filter((s) => s.hasMore)
      if (!restServices.length) break
      const pickedServices = shuffle(restServices).slice(0, 3)
      const more = (
        await Promise.all(pickedServices.map(async (s) => (await s.loadMore(abortSignal)) || []))
      )
        .flat()
        .filter((x) => x.api !== EApiType.Separator)
      this.qs.bufferQueue.push(...more)
      this.qs.bufferQueue = shuffle(this.qs.bufferQueue)
    }

    // slice
    return this.qs.sliceFromQueue()
  }

  getRecommendTimes(times: number) {
    return this.innerService.getRecommendTimes(times)
  }
}

class AppRecInnerService implements IService {
  // 无法指定, 16 根据返回得到
  static PAGE_SIZE = 16

  constructor(public deviceParamForApi: EAppApiDevice) {}

  hasMore = true

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
      timeout: 20_000,
      responseType: 'json',
      params: {
        build: '1',
        ...platformParams,
        // idx: 返回的 items.idx 为传入 idx+1, idx+2, ...
        idx: Math.floor(Date.now() / 1000) + randomInt(1000),
      },
    })
    const json = res.data as ipad.AppRecommendJson

    // request fail
    if (!json.data) {
      throw new Error('Request fail with none invalid json', {
        cause: {
          type: 'invalid-json',
          statusCode: res.status,
          json,
        },
      })
    }

    const items = json?.data?.items || []
    return items
  }

  loadMore(abortSignal?: AbortSignal, times = 2) {
    return this.getRecommendTimes(times)
  }

  // 一次不够, 多来几次
  async getRecommendTimes(times: number) {
    let list: AppRecItem[] = []

    const parallel = async () => {
      list = (
        await Promise.all(
          new Array(times).fill(0).map(() => this.getRecommend(this.deviceParamForApi)),
        )
      ).flat()
    }
    const sequence = async () => {
      for (let x = 1; x <= times; x++) {
        list = list.concat(await this.getRecommend(this.deviceParamForApi))
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
        api: EApiType.AppRecommend,
        device: this.deviceParamForApi, // android | ipad
        uniqId: item.param + '-' + crypto.randomUUID(),
      } as AppRecItemExtend
    })
    return _list
  }
}
