import { FavItemExtend } from '$define/fav'
import { FavFolderListAllItem, FavFolderListAllJson } from '$define/fav/folder-list-all'
import { FavFolderDetailInfo, ResourceListJSON } from '$define/fav/resource-list'
import { isWebApiSuccess, request } from '$request'
import { settings } from '$settings'
import { parseCookie, toast } from '$utility'
import { shuffle } from 'lodash'

export class FavService {
  folderServices: FavFolderService[] = []

  get hasMore() {
    return this.folderServices.some((s) => s.hasMore)
  }

  async loadMore() {
    if (!this.foldersLoaded) await this.getAllFolders()
    if (!this.hasMore) return

    const service = this.folderServices.find((s) => s.hasMore)
    if (!service) return

    const items = await service.loadMore()
    return items
  }

  foldersLoaded = false
  async getAllFolders() {
    const mid = parseCookie().DedeUserID
    const res = await request.get('/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid: mid,
      },
    })

    const json = res.data as FavFolderListAllJson

    let folders = json.data.list
    if (settings.shuffleForFav) {
      folders = shuffle(folders)
    }

    this.foldersLoaded = true
    this.folderServices = folders.map((f) => new FavFolderService(f))
  }
}

export class FavFolderService {
  entry: FavFolderListAllItem
  constructor(entry: FavFolderListAllItem) {
    this.entry = entry
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo
  page = 0

  async loadMore(): Promise<FavItemExtend[]> {
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
      return []
    }

    this.hasMore = json.data.has_more
    this.info = json.data.info

    let items = json.data.medias
    items = items.filter((item) => {
      if (item.title === '已失效视频') return false
      return true
    })
    if (settings.shuffleForFav) {
      items = shuffle(items)
    }

    return items.map((item) => {
      return {
        ...item,
        folder: this.info,
        api: 'fav',
        uniqId: `fav-${this.info.id}-${item.bvid}`,
      }
    })
  }
}
