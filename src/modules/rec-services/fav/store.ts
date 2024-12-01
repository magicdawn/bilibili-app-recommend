import ms from 'ms'
import { proxy } from 'valtio'
import type { FavFolder } from './types/list-all-folders'
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

  get selectedKey() {
    if (this.selectedFavFolder) {
      return `fav-folder:${this.selectedFavFolder.id}`
    }
    return 'all'
  },
  get selectedLabel() {
    if (this.selectedFavFolder) {
      return this.selectedFavFolder.title
    }
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
  return Promise.all([updateFolderList()])
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
