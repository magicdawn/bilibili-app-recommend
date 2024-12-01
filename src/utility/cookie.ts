import { proxy, useSnapshot } from 'valtio'
import toast from './toast'

export function parseCookie(): Record<string, string> {
  const cookies: Record<string, string> = {}
  document.cookie
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [key, val] = pair
        .split('=')
        .map((s) => s.trim())
        .filter(Boolean)
      if (!key) return
      cookies[key] = val
    })
  return cookies
}

export function getCsrfToken(): string {
  const csrfToken = parseCookie().bili_jct
  if (!csrfToken) {
    toast('找不到 csrf token, 请检查是否登录')
    throw new Error('找不到 csrf token, 请检查是否登录')
  }
  return csrfToken
}

export function getUid() {
  return parseCookie().DedeUserID
}

export function getHasLogined(): boolean {
  // logout in default header
  // but not included in bilibili-evolved
  // return !!document.querySelector('.logout-item')
  const cookies = parseCookie()
  return !!cookies.DedeUserID // SESSDATA 是 httponly
}

export const loginState = proxy({
  cookie: document.cookie,
  logined: getHasLogined(),
})

export function checkLoginStatus(): boolean {
  Object.assign(loginState, {
    cookie: document.cookie,
    logined: getHasLogined(),
  })
  return loginState.logined
}

export function useHasLogined() {
  return useSnapshot(loginState).logined
}
