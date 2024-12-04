import type { FavItemExtend, ItemsSeparator } from '$define'
import { settings } from '$modules/settings'
import { snapshot } from 'valtio'
import { QueueStrategy, type IService } from '../_base'
import { FAV_PAGE_SIZE } from './service/_base'
import { FavAllService } from './service/fav-all'
import { FavCollectionService } from './service/fav-collection'
import { FavFolderService } from './service/fav-folder'
import { favStore, updateFavFolderMediaCount } from './store'
import { FavUsageInfo } from './usage-info'
import type { FavItemsOrder } from './usage-info/fav-items-order'
import { getSavedOrder } from './usage-info/fav-items-order'

export type FavServiceConfig = ReturnType<typeof getFavServiceConfig>

export function getFavServiceConfig() {
  const snap = snapshot(favStore)
  return {
    selectedKey: snap.selectedKey,
    itemsOrder: getSavedOrder(snap.selectedKey, snap.savedOrderMap as Map<string, FavItemsOrder>),

    selectedFavFolderId: snap.selectedFavFolderId,
    selectedFavFolder: snap.selectedFavFolder,

    selectedFavCollectionId: snap.selectedFavCollectionId,
    selectedFavCollection: snap.selectedFavCollection,

    // from settings
    addSeparator: settings.fav.addSeparator,
    excludedFolderIds: settings.fav.excludedFolderIds,
  }
}

export interface IFavInnerService {
  hasMore: boolean
  loadMore(abortSignal?: AbortSignal): Promise<(FavItemExtend | ItemsSeparator)[] | undefined>
  usageInfo?: ReactNode
  extraUsageInfo?: ReactNode
}

export class FavRecService implements IService {
  static PAGE_SIZE = FAV_PAGE_SIZE

  innerService: IFavInnerService
  constructor(public config: FavServiceConfig) {
    if (this.viewingAll) {
      this.innerService = new FavAllService(
        this.config.addSeparator,
        this.config.itemsOrder,
        this.config.excludedFolderIds,
      )
    } else if (this.viewingSomeFolder) {
      this.innerService = new FavFolderService(
        this.config.selectedFavFolder!,
        this.config.addSeparator,
        this.config.itemsOrder,
      )
    } else if (this.viewingSomeCollection) {
      this.innerService = new FavCollectionService(
        this.config.selectedFavCollectionId!,
        this.config.addSeparator,
        this.config.itemsOrder,
      )
    } else {
      throw new Error('unexpected case!')
    }
  }
  get viewingAll() {
    return this.config.selectedKey === 'all'
  }
  get viewingSomeFolder() {
    return typeof this.config.selectedFavFolderId === 'number'
  }
  get viewingSomeCollection() {
    return typeof this.config.selectedFavCollectionId === 'number'
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
    const { usageInfo, extraUsageInfo } = this.innerService
    if (usageInfo) return usageInfo
    return <FavUsageInfo extraContent={extraUsageInfo} />
  }

  // for remove card
  decreaseTotal() {
    if (this.viewingAll) {
      // TODO: this is not working, since <FavUsageInfo> is calculating inside itself
      ;(this.innerService as FavAllService).total -= 1
    }

    // viewingSomeFolder
    else if (this.viewingSomeFolder && this.config.selectedFavFolder) {
      updateFavFolderMediaCount(this.config.selectedFavFolder.id, (x) => x - 1)
    }

    // viewingSomeCollection
    else if (this.viewingSomeCollection && this.config.selectedFavCollection) {
      // noop, not supported yet
    }
  }
}
