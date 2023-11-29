import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { FavItemExtend } from '$define/fav'
import type { FavFolderListAllItem, FavFolderListAllJson } from '$define/fav/folder-list-all'
import type { FavFolderDetailInfo, ResourceListJSON } from '$define/fav/resource-list'
import { isWebApiSuccess, request } from '$request'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { getUid, toast } from '$utility'
import { css } from '@emotion/react'
import { useMemoizedFn } from 'ahooks'
import { Popover, Switch, Tag, Transfer } from 'antd'
import type { TransferDirection } from 'antd/es/transfer'
import { shuffle } from 'lodash'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { IService } from './base'

export function formatFavFolderUrl(id: number) {
  const uid = getUid()
  return `https://space.bilibili.com/${uid}/favlist?fid=${id}`
}

export class FavRecService implements IService {
  static PAGE_SIZE = 20

  useShuffle: boolean
  constructor() {
    this.useShuffle = settings.shuffleForFav
  }

  allFolderServices: FavFolderService[] = [] // before exclude
  folderServices: FavFolderService[] = [] // after exclude
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
    return <FavUsageInfo allFavFolderServices={this.allFolderServices} />
  }

  async loadMore() {
    if (!this.foldersLoaded) await this.getAllFolders()
    if (!this.hasMore) return

    const sliceFromQueue = () => {
      if (this.bufferQueue.length) {
        const sliced = this.bufferQueue.slice(0, FavRecService.PAGE_SIZE)
        this.bufferQueue = this.bufferQueue.slice(FavRecService.PAGE_SIZE)
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

    if (this.bufferQueue.length < FavRecService.PAGE_SIZE) {
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
    const folders = await apiFavFolderListAll()
    this.foldersLoaded = true
    this.allFolderServices = folders.map((f) => new FavFolderService(f))
    this.folderServices = this.allFolderServices.filter(
      (s) => !settings.excludeFavFolderIds.includes(s.entry.id.toString())
    )
    this.total = this.folderServices.reduce((count, f) => count + f.entry.media_count, 0)
  }
}

export async function apiFavFolderListAll() {
  const res = await request.get('/x/v3/fav/folder/created/list-all', {
    params: {
      up_mid: getUid(),
    },
  })
  const json = res.data as FavFolderListAllJson
  const folders = json.data.list
  return folders
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

export function FavUsageInfo({
  allFavFolderServices,
}: {
  allFavFolderServices: FavFolderService[]
}) {
  const { excludeFavFolderIds, shuffleForFav } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()
  const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = useState(false)

  const handleChange = useMemoizedFn(
    (newTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
      setExcludeFavFolderIdsChanged(true)
      updateSettings({ excludeFavFolderIds: newTargetKeys })
    }
  )

  // may contains legacy ids, so not `allFavFolderServices.length - excludeFavFolderIds.length`
  const foldersCount = useMemo(
    () =>
      allFavFolderServices.filter((x) => !excludeFavFolderIds.includes(x.entry.id.toString()))
        .length,
    [allFavFolderServices, excludeFavFolderIds]
  )

  const videosCount = useMemo(() => {
    return allFavFolderServices
      .filter((s) => !excludeFavFolderIds.includes(s.entry.id.toString()))
      .reduce((count, s) => count + s.entry.media_count, 0)
  }, [allFavFolderServices, excludeFavFolderIds])

  const onPopupOpenChange = useMemoizedFn((open: boolean) => {
    // when open
    if (open) {
      setExcludeFavFolderIdsChanged(false)
    }

    // when close
    else {
      if (excludeFavFolderIdsChanged) {
        onRefresh?.()
      }
    }
  })

  return (
    <>
      <Popover
        trigger={'click'}
        placement='bottom'
        onOpenChange={onPopupOpenChange}
        getPopupContainer={(el) => el.parentElement || document.body}
        content={
          <>
            <Transfer
              dataSource={allFavFolderServices}
              rowKey={(row) => row.entry.id.toString()}
              titles={['收藏夹', '忽略']}
              targetKeys={excludeFavFolderIds}
              onChange={handleChange}
              render={(item) => item.entry.title}
              oneWay
              style={{ marginBottom: 10 }}
            />
          </>
        }
      >
        <Tag
          color='success'
          css={css`
            margin-left: 15px;
            cursor: pointer;
            font-size: 12px;
          `}
        >
          收藏夹({foldersCount}) 收藏({videosCount})
        </Tag>
      </Popover>

      <Switch
        style={{ marginLeft: 15 }}
        checkedChildren='随机顺序'
        unCheckedChildren='默认顺序'
        checked={shuffleForFav}
        onChange={(checked) => {
          updateSettings({ shuffleForFav: checked })
          setTimeout(() => {
            onRefresh?.()
          })
        }}
      />
    </>
  )
}
