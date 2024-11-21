export interface WatchlaterV2Json {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  has_more: boolean
  list: WatchlaterV2Item[]
  next_key: string
  play_url: string
  show_count: number
  split_key: string
  tab_type: number
}

export interface WatchlaterV2Item {
  aid: number
  videos: number
  tid: number
  tname: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  state: number
  duration: number
  rights: { [key: string]: number }
  owner: Owner
  stat: { [key: string]: number }
  dynamic: string
  dimension: Dimension
  short_link_v2: string
  up_from_v2?: number
  first_frame: string
  pub_location: string
  cover43: string
  page: Page
  count: number
  cid: number
  progress: number
  add_at: number
  bvid: string
  uri: string
  enable_vt: number
  view_text_1: string
  card_type: number
  left_icon_type: number
  left_text: string
  right_icon_type: number
  right_text: string
  arc_state: number
  pgc_label: string
  show_up: boolean
  forbid_fav: boolean
  forbid_sort: boolean
  season_title: string
  long_title: string
  index_title: string
  c_source: string
  mission_id?: number
  season_id?: number
}

export interface Dimension {
  width: number
  height: number
  rotate: number
}

export interface Owner {
  mid: number
  name: string
  face: string
}

export interface Page {
  cid: number
  page: number
  from: From
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
  first_frame: string
}

export enum From {
  Vupload = 'vupload',
}
