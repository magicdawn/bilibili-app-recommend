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

export const APP_NAME_ROOT_CLASSNAME = `${APP_NAME}-root`
