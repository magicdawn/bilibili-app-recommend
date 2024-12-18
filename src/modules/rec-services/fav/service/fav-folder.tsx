import { REQUEST_FAIL_MSG } from '$common'
import { C } from '$common/emotion-css'
import { CustomTargetLink } from '$components/VideoCard/use/useOpenRelated'
import type { ItemsSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { IconForOpenExternalLink, IconForPlayer } from '$modules/icon'
import { isWebApiSuccess, request } from '$request'
import { wrapWithIdbCache } from '$utility/idb'
import toast from '$utility/toast'
import { shuffle, uniqBy } from 'es-toolkit'
import ms from 'ms'
import { FavItemsOrder, handleItemsOrder } from '../fav-enum'
import { formatFavFolderUrl, formatFavPlaylistUrl } from '../fav-url'
import { type IFavInnerService } from '../index'
import { updateFavFolderMediaCount } from '../store'
import type { FavItemExtend } from '../types'
import type { FavFolder } from '../types/folders/list-all-folders'
import type { FavFolderDetailInfo, ResourceListJSON } from '../types/folders/list-folder-items'
import { FavItemsOrderSwitcher } from '../usage-info/fav-items-order'
import { FAV_PAGE_SIZE, favSeparatorCss } from './_base'

export function FavFolderSeparator({ service }: { service: FavFolderBasicService }) {
  return (
    <>
      <CustomTargetLink
        href={formatFavFolderUrl(service.entry.id, service.entry.attr)}
        css={favSeparatorCss.item}
      >
        <IconForOpenExternalLink css={C.size(16)} />
        {service.entry.title}
      </CustomTargetLink>
      <CustomTargetLink href={formatFavPlaylistUrl(service.entry.id)} css={favSeparatorCss.item}>
        <IconForPlayer css={C.size(16)} />
        播放全部
      </CustomTargetLink>
    </>
  )
}

const FAV_FOLDER_API_SUPPOETED_ORDER = [
  FavItemsOrder.FavTimeDesc,
  FavItemsOrder.PlayCountDesc,
  FavItemsOrder.PubTimeDesc,
] as const

type FavFolderApiSuppoetedOrder = (typeof FAV_FOLDER_API_SUPPOETED_ORDER)[number]

function isFavFolderApiSuppoetedOrder(order: FavItemsOrder): order is FavFolderApiSuppoetedOrder {
  return FAV_FOLDER_API_SUPPOETED_ORDER.includes(order)
}

export class FavFolderService implements IFavInnerService {
  basicService: FavFolderBasicService
  needLoadAll: boolean
  constructor(
    public entry: FavFolder,
    public addSeparator: boolean,
    public itemsOrder: FavItemsOrder,
  ) {
    if (this.itemsOrder === FavItemsOrder.Default) {
      throw new Error('this should not happen!')
    }

    if (isFavFolderApiSuppoetedOrder(this.itemsOrder)) {
      this.basicService = new FavFolderBasicService(this.entry, this.itemsOrder)
      this.needLoadAll = false
    } else {
      this.basicService = new FavFolderBasicService(this.entry)
      this.needLoadAll = true
    }
  }

  get hasMore() {
    if (this.addSeparator && !this.separatorAdded) return true
    if (this.needLoadAll) {
      if (!this.allItemsLoaded) return true
      return !!this.bufferQueue.length
    } else {
      return this.basicService.hasMore
    }
  }

  private separatorAdded = false
  private get separator(): ItemsSeparator {
    return {
      api: EApiType.Separator,
      uniqId: `fav-folder-${this.entry.id}`,
      content: <FavFolderSeparator service={this.basicService} />,
    }
  }

  async loadMore(abortSignal?: AbortSignal) {
    if (!this.hasMore) return

    if (this.addSeparator && !this.separatorAdded) {
      this.separatorAdded = true
      return [this.separator]
    }

    // load all
    if (this.needLoadAll) {
      if (!this.allItemsLoaded) await this.loadAllItems(abortSignal)

      // shuffle every time
      if (this.itemsOrder === FavItemsOrder.Shuffle) {
        this.bufferQueue = shuffle(this.bufferQueue)
      }

      const sliced = this.bufferQueue.slice(0, FAV_PAGE_SIZE)
      this.bufferQueue = this.bufferQueue.slice(FAV_PAGE_SIZE)
      return sliced
    }

    // normal
    else {
      const ret = await this.basicService.loadMore(abortSignal)
      if (ret?.length) await this.addToFetchAllItemsWithCache(ret)
      this.runSideEffects()
      return ret
    }
  }

  private allItemsLoaded = false
  private bufferQueue: FavItemExtend[] = []
  private async loadAllItems(abortSignal?: AbortSignal) {
    const allItems = await this.fetchAllItemsWithCache(abortSignal)
    this.bufferQueue = handleItemsOrder(allItems, this.itemsOrder)
    this.allItemsLoaded = true
    this.runSideEffects()
  }
  private __fetchAllItems = async (abortSignal?: AbortSignal) => {
    const allItems: FavItemExtend[] = []
    while (this.basicService.hasMore && !abortSignal?.aborted) {
      const items = (await this.basicService.loadMore()) || []
      allItems.push(...items)
    }
    return allItems
  }
  // __fetchAllItems will result multiple requests, so cache it
  private fetchAllItemsWithCache = wrapWithIdbCache({
    fn: this.__fetchAllItems,
    tableName: 'fav-folder-all-items',
    generateKey: () => `${this.entry.id}`,
    ttl: ms('5min'),
  })
  private addToFetchAllItemsWithCache = async (items: FavItemExtend[]) => {
    const { cache, generateKey, shouldReuseCached } = this.fetchAllItemsWithCache

    const cached = await cache.get(generateKey())
    if (!cached || !shouldReuseCached(cached)) return

    const newItems = uniqBy([...cached.val, ...items], (x) => x.bvid)
    await cache.set(generateKey(), { ...cached, val: newItems })
  }

  private runSideEffects() {
    if (typeof this.basicService.info?.media_count === 'number') {
      updateFavFolderMediaCount(this.entry.id, this.basicService.info.media_count)
    }
  }

  get extraUsageInfo() {
    return <FavItemsOrderSwitcher />
  }
}

export class FavFolderBasicService {
  constructor(
    public entry: FavFolder,
    public itemsOrder: FavFolderApiSuppoetedOrder = FavItemsOrder.FavTimeDesc,
  ) {
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo | undefined
  page = 0 // pages loaded

  async loadMore(abortSignal?: AbortSignal): Promise<FavItemExtend[] | undefined> {
    if (!this.hasMore) return

    // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
    const order = {
      [FavItemsOrder.FavTimeDesc]: 'mtime',
      [FavItemsOrder.PlayCountDesc]: 'view',
      [FavItemsOrder.PubTimeDesc]: 'pubtime',
    }[this.itemsOrder]

    const res = await request.get('/x/v3/fav/resource/list', {
      params: {
        media_id: this.entry.id,
        pn: this.page + 1, // start from 1
        ps: 20,
        keyword: '',
        order, // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
        type: '0', // unkown
        tid: '0', // 分区
        platform: 'web',
      },
    })

    const json = res.data as ResourceListJSON
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)
      return
    }

    this.page++
    this.hasMore = json.data.has_more
    this.info = json.data.info

    // 新建空收藏夹, medias = null
    let items = json.data.medias || []
    items = items.filter((item) => {
      if (item.title === '已失效视频') return false
      return true
    })

    return items.map((item) => {
      return {
        ...item,
        from: 'fav-folder',
        folder: this.info!,
        api: EApiType.Fav,
        uniqId: `fav-${this.info?.id}-${item.bvid}`,
      }
    })
  }
}
