// Generated by https://quicktype.io

export interface PopularWeeklyListJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  list: PopularWeeklyListItem[]
}

export interface PopularWeeklyListItem {
  number: number
  subject: string
  status: number
  name: string
}