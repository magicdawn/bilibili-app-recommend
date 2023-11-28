import type { FavFolderDetailInfo, Media } from './resource-list'

export type FavItem = Media & {
  folder: FavFolderDetailInfo
}

export type FavItemExtend = FavItem & {
  uniqId: string
  api: 'fav'
}
