export interface ListAllCollectionJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  count: number
  list: FavCollection[]
  has_more: boolean
}

export interface FavCollection {
  id: number
  fid: number
  mid: number
  attr: number
  attr_desc: string
  title: string
  cover: string
  upper: Upper
  cover_type: number
  intro: string
  ctime: number
  mtime: number
  state: number
  fav_state: number
  media_count: number
  view_count: number
  vt: number
  is_top: boolean
  recent_fav: null
  play_switch: number
  type: number
  link: string
  bvid: string
}

export interface Upper {
  mid: number
  name: string
  face: string
}
