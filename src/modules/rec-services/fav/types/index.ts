import type { EApiType } from '$define/index.shared'
import type { FavFolderDetailInfo, Media } from './list-folder-items'

export type FavItem = Media & {
  folder: FavFolderDetailInfo
}

export type FavItemExtend = FavItem & {
  uniqId: string
  api: EApiType.Fav
}
