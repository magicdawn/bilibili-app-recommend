import { REQUEST_FAIL_MSG } from '$common'
import { C } from '$common/emotion-css'
import { CustomTargetLink } from '$components/VideoCard/use/useOpenRelated'
import { type ItemsSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { OpenExternalLinkIcon, PlayerIcon } from '$modules/icon'
import { settings } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { shuffle } from 'es-toolkit'
import pmap from 'promise.map'
import { snapshot } from 'valtio'
import { QueueStrategy, type IService } from '../_base'
import { formatFavFolderUrl, formatFavPlaylistUrl } from './fav-util'
import { favStore, updateFavFolderMediaCount } from './store'
import type { FavItemExtend } from './types'
import type { FavFolder } from './types/list-all-folders'
import type { FavFolderDetailInfo, ResourceListJSON } from './types/list-folder-items'
import { FavUsageInfo } from './usage-info'
import { fetchFavFolder } from './user-fav-service'

export type FavServiceConfig = ReturnType<typeof getFavServiceConfig>

export function getFavServiceConfig() {
  const snap = snapshot(favStore)
  return {
    selectedKey: snap.selectedKey,
    selectedFavFolder: snap.selectedFavFolder,

    // from settings
    useShuffle: settings.fav.useShuffle,
    addSeparator: settings.fav.addSeparator,
    excludedFolderIds: settings.fav.excludedFolderIds,
  }
}

export class FavRecService implements IService {
  static PAGE_SIZE = 20

  innerService: IFavInnerService
  constructor(public config: FavServiceConfig) {
    if (this.viewingAll) {
      this.innerService = new FavAllService(this.config)
    } else if (this.viewingSomeFolder) {
      this.innerService = new FavFolderService(
        this.config.selectedFavFolder!,
        this.config.useShuffle,
        this.config.addSeparator,
      )
    } else {
      throw new Error('unexpected case!')
    }
  }
  get viewingAll() {
    return this.config.selectedKey === 'all'
  }
  get viewingSomeFolder() {
    return !!this.config.selectedFavFolder
  }

  // for shuffle restore
  qs = new QueueStrategy<FavItemExtend | ItemsSeparator>(FavRecService.PAGE_SIZE)
  get hasMore() {
    return !!this.qs.bufferQueue.length || this.innerService.hasMore
  }
  async loadMore(abortSignal?: AbortSignal) {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()
    return this.qs.doReturnItems(await this.innerService.loadMore(abortSignal))
  }

  get usageInfo(): ReactNode {
    return this.innerService.usageInfo
  }

  // for remove card
  decreaseTotal() {
    if (this.viewingAll) {
      // TODO: this is not working, since <FavUsageInfo> is calculating inside itself
      ;(this.innerService as FavAllService).total -= 1
    }

    // viewingSomeFolder
    else if (this.viewingSomeFolder) {
      updateFavFolderMediaCount(this.config.selectedFavFolder!.id, (x) => x - 1)
    }
  }
}

interface IFavInnerService {
  hasMore: boolean
  loadMore(abortSignal?: AbortSignal): Promise<(FavItemExtend | ItemsSeparator)[] | undefined>
  usageInfo: ReactNode
}

class FavAllService implements IFavInnerService {
  constructor(public config: FavServiceConfig) {}
  get useShuffle() {
    return this.config.useShuffle
  }
  get addSeparator() {
    return this.config.addSeparator
  }
  get excludedFolderIds() {
    return this.config.excludedFolderIds
  }

  total = 0
  allFolderServices: FavFolderBasicService[] = [] // before exclude
  folderServices: FavFolderBasicService[] = [] // after exclude

  shuffleBufferQueue: FavItemExtend[] = []

  get folderHasMore() {
    if (!this.foldersLoaded) return true
    return this.folderServices.some((s) => s.hasMore)
  }
  get hasMore() {
    if (this.useShuffle) {
      return !!this.shuffleBufferQueue.length || this.folderHasMore
    } else {
      return this.folderHasMore
    }
  }

  get usageInfo(): ReactNode {
    if (!this.foldersLoaded) return
    return <FavUsageInfo viewingAll allFavFolderServices={this.allFolderServices} />
  }

  async loadMore(abortSignal?: AbortSignal) {
    if (!this.foldersLoaded) await this.getAllFolders()
    if (!this.hasMore) return

    /**
     * in sequence order
     */
    if (!this.useShuffle) {
      const service = this.folderServices.find((s) => s.hasMore)
      if (!service) return
      const items = await service.loadMore()
      const header = this.addSeparator &&
        service.page === 1 &&
        !!items?.length && {
          api: EApiType.Separator as const,
          uniqId: `fav-folder-${service.entry.id}`,
          content: <FavSeparatorContent service={service} />,
        }
      return [header, ...(items || [])].filter((x) => x !== false)
    }

    /**
     * in shuffle order
     */
    if (this.shuffleBufferQueue.length < FavRecService.PAGE_SIZE) {
      // 1.fill queue
      const count = 6
      const batch = 2
      while (this.folderHasMore && this.shuffleBufferQueue.length < FavRecService.PAGE_SIZE) {
        const restServices = this.folderServices.filter((s) => s.hasMore)
        const pickedServices = shuffle(restServices).slice(0, count)
        const fetched = (
          await pmap(pickedServices, async (s) => (await s.loadMore()) || [], batch)
        ).flat()
        this.shuffleBufferQueue = shuffle([...this.shuffleBufferQueue, ...shuffle(fetched)])
      }
    }

    // next: take from queue
    const sliced = this.shuffleBufferQueue.slice(0, FavRecService.PAGE_SIZE)
    this.shuffleBufferQueue = this.shuffleBufferQueue.slice(FavRecService.PAGE_SIZE)
    return sliced
  }

  foldersLoaded = false
  async getAllFolders() {
    const folders = await fetchFavFolder()
    this.foldersLoaded = true
    this.allFolderServices = folders.map((f) => new FavFolderBasicService(f))
    this.folderServices = this.allFolderServices.filter(
      (s) => !this.excludedFolderIds.includes(s.entry.id.toString()),
    )
    this.total = this.folderServices.reduce((count, f) => count + f.entry.media_count, 0)
  }
}

const S = {
  item: css`
    display: inline-flex;
    align-items: center;
    font-size: 15px;

    &:not(:first-child) {
      margin-left: 30px;
    }

    /* the icon */
    svg {
      margin-right: 5px;
      margin-top: -1px;
    }
  `,
}
function FavSeparatorContent({ service }: { service: FavFolderBasicService }) {
  return (
    <>
      <CustomTargetLink href={formatFavFolderUrl(service.entry.id)} css={S.item}>
        <OpenExternalLinkIcon css={C.size(16)} />
        {service.entry.title}
      </CustomTargetLink>
      <CustomTargetLink href={formatFavPlaylistUrl(service.entry.id)} css={S.item}>
        <PlayerIcon css={C.size(16)} />
        播放全部
      </CustomTargetLink>
    </>
  )
}

class FavFolderService implements IFavInnerService {
  basicService: FavFolderBasicService
  constructor(
    public entry: FavFolder,
    public useShuffle: boolean,
    public addSeparator: boolean,
  ) {
    this.basicService = new FavFolderBasicService(this.entry)
  }

  get hasMore() {
    if (this.addSeparator && !this.separatorAdded) return true
    if (this.useShuffle) {
      if (!this.loadAllCalled) return true
      return !!this.shuffleBufferQueue.length
    } else {
      return this.basicService.hasMore
    }
  }

  get usageInfo() {
    return <FavUsageInfo />
  }

  private separatorAdded = false
  private get separator() {
    return {
      api: EApiType.Separator as const,
      uniqId: `fav-folder-${this.entry.id}`,
      content: <FavSeparatorContent service={this.basicService} />,
    }
  }

  async loadMore(abortSignal?: AbortSignal) {
    if (!this.hasMore) return

    if (this.addSeparator && !this.separatorAdded) {
      this.separatorAdded = true
      return [this.separator]
    }

    // shuffle
    if (this.useShuffle) {
      if (!this.loadAllCalled) await this.loadAllItems(abortSignal)
      this.shuffleBufferQueue = shuffle(this.shuffleBufferQueue)
      const sliced = this.shuffleBufferQueue.slice(0, FavRecService.PAGE_SIZE)
      this.shuffleBufferQueue = this.shuffleBufferQueue.slice(FavRecService.PAGE_SIZE)
      return sliced
    }

    // normal
    else {
      const ret = await this.basicService.loadMore(abortSignal)
      this.runSideEffects()
      return ret
    }
  }

  private loadAllCalled = false
  private shuffleBufferQueue: FavItemExtend[] = []
  private async loadAllItems(abortSignal?: AbortSignal) {
    this.loadAllCalled = true
    while (this.basicService.hasMore && !abortSignal?.aborted) {
      const items = await this.basicService.loadMore()
      this.shuffleBufferQueue.push(...(items || []))
    }
    this.runSideEffects()
  }

  private runSideEffects() {
    if (typeof this.basicService.info?.media_count === 'number') {
      updateFavFolderMediaCount(this.entry.id, this.basicService.info.media_count)
    }
  }
}

export class FavFolderBasicService {
  constructor(public entry: FavFolder) {
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo | undefined
  page = 0 // pages loaded

  async loadMore(abortSignal?: AbortSignal): Promise<FavItemExtend[] | undefined> {
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
        api: EApiType.Fav,
        uniqId: `fav-${this.info?.id}-${item.bvid}`,
      }
    })
  }
}
