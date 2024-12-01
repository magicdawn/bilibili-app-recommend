export interface FavCollectionDetailJson {
  code: number
  message: string
  ttl: number
  data: FavCollectionDetail
}

export interface FavCollectionDetail {
  info: FavCollectionDetailInfo
  medias: FavCollectionDetailMedia[]
}

export interface FavCollectionDetailInfo {
  id: number
  season_type: number
  title: string
  cover: string
  upper: Upper
  cnt_info: CntInfo
  media_count: number
  intro: string
  enable_vt: number
}

export interface CntInfo {
  collect: number
  play: number
  danmaku: number
  vt: number
}

export interface Upper {
  mid: number
  name: string
  face?: string // no face, 手动补上
}

export interface FavCollectionDetailMedia {
  id: number
  title: string
  cover: string
  duration: number
  pubtime: number
  bvid: string
  upper: Upper
  cnt_info: CntInfo
  enable_vt: number
  vt_display: string
  is_self_view: boolean
}
