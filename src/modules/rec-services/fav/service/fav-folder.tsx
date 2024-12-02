import { EApiType } from '$define/index.shared'
import { shuffle } from 'es-toolkit'
import { type IFavInnerService, FavRecService } from '..'
import { updateFavFolderMediaCount } from '../store'
import type { FavItemExtend } from '../types'
import type { FavFolder } from '../types/folders/list-all-folders'
import { FavFolderBasicService, FavSeparatorContent } from './_base'

export class FavFolderService implements IFavInnerService {
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
