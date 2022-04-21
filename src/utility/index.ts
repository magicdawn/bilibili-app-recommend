import { toast } from './toast'

export function getCsrfToken(): string {
  const csrfToken = document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)?.[1]

  if (!csrfToken) {
    toast('找不到 csrf token, 请检查是否登录')
    throw new Error('找不到 csrf token, 请检查是否登录')
  }

  return csrfToken
}
