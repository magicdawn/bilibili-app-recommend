import { EApiType } from '$define/index.shared'
import { shuffle } from 'es-toolkit'
import pmap from 'promise.map'
import { type FavServiceConfig, type IFavInnerService, FavRecService } from '..'
import type { FavItemExtend } from '../types'
import { ViewingAllExcludeFolderConfig } from '../usage-info'
import { fetchFavFolder } from '../user-fav-service'
import { FavFolderBasicService, FavSeparatorContent } from './_base'

export class FavAllService implements IFavInnerService {
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

  get extraUsageInfo() {
    return <ViewingAllExcludeFolderConfig allFavFolderServices={this.allFolderServices} />
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

  private foldersLoaded = false
  private async getAllFolders() {
    const folders = await fetchFavFolder()
    this.foldersLoaded = true
    this.allFolderServices = folders.map((f) => new FavFolderBasicService(f))
    this.folderServices = this.allFolderServices.filter(
      (s) => !this.excludedFolderIds.includes(s.entry.id.toString()),
    )
    this.total = this.folderServices.reduce((count, f) => count + f.entry.media_count, 0)
  }
}