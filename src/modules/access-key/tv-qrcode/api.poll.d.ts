// Generated by https://quicktype.io

export interface PollJson {
  code: number
  message: string
  ttl: number
  data: PollData
}

export interface PollData {
  is_new: boolean
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
  token_info: TokenInfo
  cookie_info: CookieInfo
  sso: string[]
}

export interface CookieInfo {
  cookies: Cooky[]
  domains: string[]
}

export interface Cooky {
  name: string
  value: string
  http_only: number
  expires: number
  secure: number
}

export interface TokenInfo {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}
