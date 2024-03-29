// Generated by https://quicktype.io

export interface PcRecommendJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  item: PcRecItem[]
  business_card: null
  floor_info: null
  user_feature: null
  abtest: Abtest
  preload_expose_pct: number
  preload_floor_expose_pct: number
  mid: number
}

export interface Abtest {
  group: string
}

export interface PcRecItem {
  id: number
  bvid: string
  cid: number
  goto: Goto
  uri: string
  pic: string
  title: string
  duration: number
  pubdate: number
  owner: Owner
  stat: Stat
  av_feature: null
  is_followed: number
  rcmd_reason: RcmdReason
  show_info: number
  track_id: TrackID
  pos: number
  room_info: null
  ogv_info: null
  business_info: null
  is_stock: number
}

export enum Goto {
  AV = 'av',
}

export interface Owner {
  mid: number
  name: string
  face: string
}

export interface RcmdReason {
  reason_type: number
  content?: string
}

export interface Stat {
  view: number
  like: number
  danmaku: number
}

export enum TrackID {
  WebPegasus5ShylfAIRecsys6471671024526175620 = 'web_pegasus_5.shylf-ai-recsys-647.1671024526175.620',
}
