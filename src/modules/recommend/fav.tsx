import { REQUEST_FAIL_MSG } from '$common'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { type ItemsSeparator } from '$define'
import type { FavItemExtend } from '$define/fav'
import type { FavFolderListAllItem, FavFolderListAllJson } from '$define/fav/folder-list-all'
import type { FavFolderDetailInfo, ResourceListJSON } from '$define/fav/resource-list'
import { EApiType } from '$define/index.shared'
import { IconPark } from '$icon-park'
import { settings, updateSettings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import { getUid, toast } from '$utility'
import { Popover, Space, Switch, Tag, Transfer } from 'antd'
import type { TransferDirection } from 'antd/es/transfer'
import delay from 'delay'
import { shuffle } from 'lodash'
import pmap from 'promise.map'
import { QueueStrategy, type IService } from './base'

export function formatFavFolderUrl(id: number) {
  const uid = getUid()
  return `https://space.bilibili.com/${uid}/favlist?fid=${id}`
}

export function formatFavPlaylistUrl(id: number) {
  return `https://www.bilibili.com/list/ml${id}`
}

export class FavRecService implements IService {
  static PAGE_SIZE = 20

  useShuffle: boolean
  addSeparator: boolean
  constructor() {
    this.useShuffle = settings.shuffleForFav
    this.addSeparator = settings.addSeparatorForFav
  }

  total = 0
  allFolderServices: FavFolderService[] = [] // before exclude
  folderServices: FavFolderService[] = [] // after exclude

  // full-list = qs.returnQueue + qs.bufferQueue + folderServices.more
  qs = new QueueStrategy<FavItemExtend | ItemsSeparator>(FavRecService.PAGE_SIZE)

  get folderHasMore() {
    return this.folderServices.some((s) => s.hasMore)
  }
  get hasMore() {
    return this.qs.bufferQueue.length > 0 || this.folderHasMore
  }

  get usageInfo(): ReactNode {
    if (!this.foldersLoaded) return
    return <FavUsageInfo allFavFolderServices={this.allFolderServices} />
  }

  async loadMore() {
    if (!this.foldersLoaded) await this.getAllFolders()
    if (!this.hasMore) return

    /**
     * in sequence order
     */

    if (!this.useShuffle) {
      // from queue if queue not empty
      if (this.qs.bufferQueue.length) {
        return this.qs.sliceFromQueue()
      }
      // api request
      const service = this.folderServices.find((s) => s.hasMore)
      if (!service) return
      const items = await service.loadMore()

      const S = {
        item: css`
          display: inline-flex;
          align-items: center;
          font-size: 15px;

          &:not(:first-child) {
            margin-left: 30px;
          }

          .i-icon {
            margin-right: 5px;
          }
        `,
      }
      const header = this.addSeparator &&
        service.page === 1 &&
        items?.length && {
          api: EApiType.separator as const,
          uniqId: `fav-folder-${service.entry.id}`,
          content: (
            <>
              <a target='_blank' href={formatFavFolderUrl(service.entry.id)} css={S.item}>
                <IconPark name='EfferentFour' size={18} />
                {service.entry.title}
              </a>
              <a target='_blank' href={formatFavPlaylistUrl(service.entry.id)} css={S.item}>
                <IconPark name='PlayTwo' size={18} />
                播放全部
              </a>
            </>
          ),
        }
      return this.qs.doReturnItems([header, ...(items || [])].filter(Boolean))
    }

    /**
     * in shuffle order
     */

    if (this.qs.bufferQueue.length < FavRecService.PAGE_SIZE) {
      // 1.fill queue
      while (this.folderHasMore && this.qs.bufferQueue.length < FavRecService.PAGE_SIZE) {
        const restServices = this.folderServices.filter((s) => s.hasMore)
        const count = 4
        const batch = 2
        const pickedServices = shuffle(restServices).slice(0, count)
        const fetched = (
          await pmap(pickedServices, async (s) => (await s.loadMore()) || [], batch)
        ).flat()
        this.qs.bufferQueue = [...this.qs.bufferQueue, ...fetched]
      }
      // 2.shuffle
      this.qs.bufferQueue = shuffle(this.qs.bufferQueue)
    }

    // next: take from queue
    return this.qs.sliceFromQueue()
  }

  foldersLoaded = false
  async getAllFolders() {
    const folders = await apiFavFolderListAll()
    this.foldersLoaded = true
    this.allFolderServices = folders.map((f) => new FavFolderService(f))
    this.folderServices = this.allFolderServices.filter(
      (s) => !settings.excludeFavFolderIds.includes(s.entry.id.toString()),
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
  page = 0 // pages loaded

  async loadMore(): Promise<FavItemExtend[] | undefined> {
    if (!this.hasMore) return

    const res = await request.get('/x/v3/fav/resource/list', {
      params: {
        media_id: this.entry.id,
        pn: this.page + 1, // start from 1
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
        folder: this.info!,
        api: EApiType.fav,
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
  const { excludeFavFolderIds, shuffleForFav, addSeparatorForFav } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()
  const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = useState(false)

  // 分割线设置切换, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [shuffleForFav, addSeparatorForFav])

  const handleChange = useMemoizedFn(
    (newTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
      setExcludeFavFolderIdsChanged(true)
      updateSettings({ excludeFavFolderIds: newTargetKeys })
    },
  )

  // may contains legacy ids, so not `allFavFolderServices.length - excludeFavFolderIds.length`
  const foldersCount = useMemo(
    () =>
      allFavFolderServices.filter((x) => !excludeFavFolderIds.includes(x.entry.id.toString()))
        .length,
    [allFavFolderServices, excludeFavFolderIds],
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
    <Space>
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
            cursor: pointer;
            font-size: 12px;
          `}
        >
          收藏夹({foldersCount}) 收藏({videosCount})
        </Tag>
      </Popover>

      <Switch
        checkedChildren='随机顺序'
        unCheckedChildren='默认顺序'
        checked={shuffleForFav}
        onChange={(checked) => {
          updateSettings({ shuffleForFav: checked })
        }}
      />
    </Space>
  )
}
