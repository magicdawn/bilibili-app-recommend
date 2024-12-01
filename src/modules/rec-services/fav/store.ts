import ms from 'ms'
import { proxy } from 'valtio'
import { fetchAllFavCollections } from './collection/api'
import type { FavCollection } from './types/collections/list-all-collections'
import type { FavFolder } from './types/folders/list-all-folders'
import { fetchFavFolder } from './user-fav-service'

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
  selectedFavCollectionId: undefined as number | undefined,
  get selectedFavCollection(): FavCollection | undefined {
    if (typeof this.selectedFavCollectionId !== 'number') return
    return this.favCollections.find((x) => x.id === this.selectedFavCollectionId)
  },

  get selectedKey() {
    if (typeof this.selectedFavFolderId !== 'undefined') {
      return `fav-folder:${this.selectedFavFolderId}`
    }
    if (typeof this.selectedFavCollectionId !== 'undefined') {
      return `fav-collection:${this.selectedFavCollectionId}`
    }
    return 'all'
  },
  get selectedLabel() {
    if (this.selectedFavFolder)
      return `${this.selectedFavFolder.title} (${this.selectedFavFolder.media_count})`
    if (this.selectedFavCollection)
      return `${this.selectedFavCollection.title} (${this.selectedFavCollection.media_count})`
    return '全部'
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

export async function updateList() {
  return Promise.all([updateFolderList(), updateCollectionList()])
}

async function updateFolderList(force = false) {
  if (!force) {
    const { favFoldersUpdateAt } = favStore
    if (favFoldersUpdateAt && Date.now() - favFoldersUpdateAt < ms('5min')) {
      return
    }
  }
  const folders = await fetchFavFolder()
  favStore.favFolders = folders
  favStore.favFoldersUpdateAt = Date.now()
}

async function updateCollectionList(force = false) {
  if (!force) {
    const { favCollectionsUpdateAt } = favStore
    if (favCollectionsUpdateAt && Date.now() - favCollectionsUpdateAt < ms('5min')) {
      return
    }
  }

  let collections = await fetchAllFavCollections()
  collections = collections.filter((x) => {
    if (x.title === '该合集已失效' && x.upper.mid === 0) return false
    return true
  })

  favStore.favCollections = collections
  favStore.favCollectionsUpdateAt = Date.now()
}
