import type { ItemsSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { shuffle } from 'es-toolkit'
import { type IFavInnerService } from '../index'
import { updateFavFolderMediaCount } from '../store'
import type { FavItemExtend } from '../types'
import type { FavFolder } from '../types/folders/list-all-folders'
import {
  FavItemsOrder,
  FavItemsOrderSwitcher,
  handleItemsOrder,
} from '../usage-info/fav-items-order'
import {
  FAV_PAGE_SIZE,
  FavFolderBasicService,
  FavFolderSeparator,
  isFavFolderApiSuppoetedOrder,
} from './_base'

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
      if (!this.loadAllCalled) return true
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
      if (!this.loadAllCalled) await this.loadAllItems(abortSignal)

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
      this.runSideEffects()
      return ret
    }
  }

  private loadAllCalled = false
  private bufferQueue: FavItemExtend[] = []
  private async loadAllItems(abortSignal?: AbortSignal) {
    this.loadAllCalled = true
    while (this.basicService.hasMore && !abortSignal?.aborted) {
      const items = (await this.basicService.loadMore()) || []
      this.bufferQueue.push(...items)
    }
    this.bufferQueue = handleItemsOrder(this.bufferQueue, this.itemsOrder)
    this.runSideEffects()
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
