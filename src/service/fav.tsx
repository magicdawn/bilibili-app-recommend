import { FavItemExtend } from '$define/fav'
import { FavFolderListAllItem, FavFolderListAllJson } from '$define/fav/folder-list-all'
import { FavFolderDetailInfo, ResourceListJSON } from '$define/fav/resource-list'
import { isWebApiSuccess, request } from '$request'
import { settings } from '$settings'
import { getUid, toast } from '$utility'
import { css } from '@emotion/react'
import { Tag } from 'antd'
import { shuffle } from 'lodash'
import { ReactNode } from 'react'
import { IService } from './base'

export function formatFavFolderUrl(id: number) {
  const uid = getUid()
  return `https://space.bilibili.com/${uid}/favlist?fid=${id}`
}

export class FavService implements IService {
  static PAGE_SIZE = 20

  useShuffle: boolean
  constructor() {
    this.useShuffle = settings.shuffleForFav
  }

  folderServices: FavFolderService[] = []
  bufferQueue: FavItemExtend[] = []
  total = 0

  returnedItems: FavItemExtend[] = []
  private doReturnItems(items: FavItemExtend[] | undefined) {
    this.returnedItems = this.returnedItems.concat(items || [])
    return items
  }

  // full-list = returnedItems + bufferQueue + folderServices.more
  restore() {
    this.bufferQueue = [...this.returnedItems, ...this.bufferQueue]
    this.returnedItems = []
  }

  get folderHasMore() {
    return this.folderServices.some((s) => s.hasMore)
  }
  get hasMore() {
    return this.bufferQueue.length > 0 || this.folderHasMore
  }

  get usageInfo(): ReactNode {
    if (!this.foldersLoaded) return
    return (
      <Tag
        color='success'
        css={css`
          margin-left: 15px;
          cursor: pointer;
        `}
      >
        收藏夹({this.folderServices.length}) 收藏({this.total})
      </Tag>
    )
  }

  async loadMore() {
    if (!this.foldersLoaded) await this.getAllFolders()
    if (!this.hasMore) return

    const sliceFromQueue = () => {
      if (this.bufferQueue.length) {
        const sliced = this.bufferQueue.slice(0, FavService.PAGE_SIZE)
        this.bufferQueue = this.bufferQueue.slice(FavService.PAGE_SIZE)
        return this.doReturnItems(sliced)
      }
    }

    /**
     * in sequence order
     */

    if (!this.useShuffle) {
      // from queue if queue not empty
      if (this.bufferQueue.length) {
        return sliceFromQueue()
      }
      // api request
      const service = this.folderServices.find((s) => s.hasMore)
      if (!service) return
      const items = await service.loadMore()
      return this.doReturnItems(items)
    }

    /**
     * in shuffle order
     */

    if (this.bufferQueue.length < FavService.PAGE_SIZE) {
      // 1.fill queue
      while (this.folderHasMore && this.bufferQueue.length < 100) {
        const restServices = this.folderServices.filter((s) => s.hasMore)
        const pickedServices = shuffle(restServices).slice(0, 5)
        const fetched = (
          await Promise.all(pickedServices.map(async (s) => (await s.loadMore()) || []))
        ).flat()
        this.bufferQueue = [...this.bufferQueue, ...fetched]
      }
      // 2.shuffle
      this.bufferQueue = shuffle(this.bufferQueue)
    }

    // next: take from queue
    return sliceFromQueue()
  }

  foldersLoaded = false
  async getAllFolders() {
    const res = await request.get('/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid: getUid(),
      },
    })

    const json = res.data as FavFolderListAllJson
    const folders = json.data.list

    this.foldersLoaded = true
    this.folderServices = folders.map((f) => new FavFolderService(f))
    this.total = folders.reduce((count, f) => count + f.media_count, 0)
  }
}

export class FavFolderService {
  entry: FavFolderListAllItem
  constructor(entry: FavFolderListAllItem) {
    this.entry = entry
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo | undefined
  page = 0

  async loadMore(): Promise<FavItemExtend[] | undefined> {
    if (!this.hasMore) return

    const res = await request.get('/x/v3/fav/resource/list', {
      params: {
        media_id: this.entry.id,
        pn: ++this.page, // start from 1
        ps: 20,
        keyword: '',
        order: 'mtime', // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
        type: '0', // unkown
        tid: '0', // 分区
        platform: 'web',
      },
    })

    const json = res.data as ResourceListJSON
    if (!isWebApiSuccess(json)) {
      toast(json.message)
      return
    }

    this.hasMore = json.data.has_more
    this.info = json.data.info

    let items = json.data.medias
    items = items.filter((item) => {
      if (item.title === '已失效视频') return false
      return true
    })

    return items.map((item) => {
      return {
        ...item,
        folder: this.info!,
        api: 'fav',
        uniqId: `fav-${this.info?.id}-${item.bvid}`,
      }
    })
  }
}
