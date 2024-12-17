import { createUpdateDataFunction } from '$utility/async'
import { proxyMapWithGmStorage } from '$utility/valtio'
import ms from 'ms'
import { proxy } from 'valtio'
import { fetchAllFavCollections } from './collection/api'
import type { FavCollectionDetailInfo } from './types/collections/collection-detail'
import type { FavCollection } from './types/collections/list-all-collections'
import type { FavFolder } from './types/folders/list-all-folders'
import { FavItemsOrder, getSavedOrder } from './usage-info/fav-items-order'
import { fetchFavFolder } from './user-fav-service'

export type FavSelectedKeyPrefix = 'fav-folder' | 'fav-collection' | 'all'
export type FavStore = typeof favStore

export enum FavSearchParamsKey {
  CollectionId = 'fav-cid',
  CollectionIdFull = 'fav-collection-id',
}
const searchParams = new URLSearchParams(location.search)
export const QUERY_FAV_COLLECTION_ID = (() => {
  const getText = () =>
    searchParams.get(FavSearchParamsKey.CollectionId) ??
    searchParams.get(FavSearchParamsKey.CollectionIdFull) ??
    undefined
  if (!getText()) return

  const num = Number(getText())
  if (isNaN(num)) return

  return num
})()

const { map: savedOrderMap, actions: savedOrderMapActions } = await proxyMapWithGmStorage<
  string,
  FavItemsOrder
>('fav-saved-order')

export const favStore = proxy({
  // methods
  updateList,

  favFolders: [] as FavFolder[],
  favFoldersUpdateAt: 0,
  selectedFavFolderId: undefined as number | undefined,
  get selectedFavFolder(): FavFolder | undefined {
    if (typeof this.selectedFavFolderId !== 'number') return
    return this.favFolders.find((x) => x.id === this.selectedFavFolderId)
  },

  favCollections: [] as FavCollection[],
  favCollectionsUpdateAt: 0,
  selectedFavCollectionId: (QUERY_FAV_COLLECTION_ID ?? undefined) as number | undefined,
  selectedFavCollectionDetailInfo: undefined as FavCollectionDetailInfo | undefined,
  get selectedFavCollection(): FavCollection | undefined {
    if (typeof this.selectedFavCollectionId !== 'number') return
    return this.favCollections.find((x) => x.id === this.selectedFavCollectionId)
  },

  get selectedKey(): 'all' | `${Exclude<FavSelectedKeyPrefix, 'all'>}:${number}` {
    let prefix: FavSelectedKeyPrefix
    let id: number | undefined
    if (typeof this.selectedFavFolderId !== 'undefined') {
      prefix = 'fav-folder'
      id = this.selectedFavFolderId
    } else if (typeof this.selectedFavCollectionId !== 'undefined') {
      prefix = 'fav-collection'
      id = this.selectedFavCollectionId
    } else {
      return 'all'
    }
    return `${prefix}:${id}`
  },

  get selectedLabel() {
    if (this.selectedFavFolder) {
      return `${this.selectedFavFolder.title} (${this.selectedFavFolder.media_count})`
    }

    if (typeof this.selectedFavCollectionId === 'number') {
      if (this.selectedFavCollection) {
        return `${this.selectedFavCollection.title} (${this.selectedFavCollection.media_count})`
      }

      const info = this.selectedFavCollectionDetailInfo
      if (info?.id === this.selectedFavCollectionId) {
        return `${info.title} (${info.media_count})`
      }

      return
    }

    return '全部'
  },

  // 保存的顺序
  savedOrderMap,
  savedOrderMapActions,

  get usingShuffle() {
    const curret = getSavedOrder(this.selectedKey, this.savedOrderMap)
    return curret === FavItemsOrder.Shuffle
  },
})

export function updateFavFolderMediaCount(
  currentFavFolderId: number,
  count: number | ((old: number) => number),
) {
  const folder = favStore.favFolders.find((x) => currentFavFolderId)
  if (folder) {
    const newCount = typeof count === 'function' ? count(folder.media_count) : count
    folder.media_count = newCount
  }
}

export async function updateList(force = false) {
  return Promise.all([updateFolderList(force), updateCollectionList(force)])
}

const updateFolderList = createUpdateDataFunction({
  async fn(force?: boolean) {
    const folders = await fetchFavFolder()
    favStore.favFolders = folders
    favStore.favFoldersUpdateAt = Date.now()
    return favStore.favFolders
  },
  async getCached(force = false) {
    if (force) return
    const { favFolders, favFoldersUpdateAt } = favStore
    if (favFolders.length && favFoldersUpdateAt && Date.now() - favFoldersUpdateAt < ms('5min')) {
      return favFolders
    }
  },
})

const updateCollectionList = createUpdateDataFunction({
  async fn(force?: boolean) {
    const collections = await fetchAllFavCollections()
    favStore.favCollections = collections
    favStore.favCollectionsUpdateAt = Date.now()
    return favStore.favCollections
  },
  async getCached(force = false) {
    if (force) return
    const { favCollections, favCollectionsUpdateAt } = favStore
    if (
      favCollections.length &&
      favCollectionsUpdateAt &&
      Date.now() - favCollectionsUpdateAt < ms('5min')
    ) {
      return favCollections
    }
  },
})
