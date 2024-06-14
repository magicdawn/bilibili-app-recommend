export const APP_NAME = 'bilibili-app-recommend'
export const APP_KEY_PREFIX = 'bilibili_app_recommend'

import debugFactory from 'debug'
export const baseDebug = debugFactory(APP_NAME)

export const HOST_API = 'https://api.bilibili.com'
export const HOST_APP = 'https://app.bilibili.com'

export const TVKeyInfo = {
  appkey: '4409e2ce8ffd12b8',
  appsec: '59b43e04ad6965f34319062b478f83dd',
}
export const ThirdPartyKeyInfo = {
  appkey: '27eb53fc9058f8c3',
  appsec: 'c2ed53a74eeefe3cf99fbd01d8c9c375',
}

/**
 * 固定的 classname, 有 app-name prefix.
 * 可用于: customize css / useShortcut query card 等
 */
export const APP_CLS_ROOT = `${APP_NAME}-root`
export const APP_CLS_GRID = `${APP_NAME}-video-grid`
export const APP_CLS_CARD = `${APP_NAME}-video-card`
export const APP_CLS_CARD_ACTIVE = `${APP_NAME}-video-card-active`

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export const __DEV__ = import.meta.env.DEV
export const __PROD__ = import.meta.env.PROD

const hostname = location.hostname
const pathname = location.pathname || ''
export const IN_BILIBILI = hostname.endsWith('bilibili.com')

export const IN_BILIBILI_HOMEPAGE = IN_BILIBILI && (pathname === '/' || pathname === '/index.html')

// https://www.bilibili.com/video/BVxxx
// https://www.bilibili.com/list/watchlater?bvid=BVxxx
export const IN_BILIBILI_VIDEO_PLAY_PAGE =
  IN_BILIBILI &&
  (pathname.startsWith('/video/') ||
    pathname.startsWith('/list/watchlater') ||
    pathname.startsWith('/bangumi/play/'))
