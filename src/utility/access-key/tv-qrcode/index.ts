/**
 * 模拟 TV 端获取 access_key
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/login/login_action/QR.html#tv%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95
 */

import { toast } from '$utility'
import delay from 'delay'
import { hideQRCode, showQRCode, tvqrcodeAuthStore, updateStore } from './TVQRCodeAuth'
import { PollResult, getQRCodeInfo, poll } from './http'

async function refreshQRCode() {
  const qrinfo = await getQRCodeInfo()
  if (!qrinfo) return

  // show
  showQRCode({ qrcode: qrinfo.url, auth_code: qrinfo.auth_code })
  return true
}

// @ts-ignore
// window.getAccessKeyByQRCode = getAccessKeyByQRCode

export async function getAccessKeyByQRCode() {
  const next = await refreshQRCode()
  if (!next) return

  // start poll
  let res: PollResult | undefined

  let pollfor = tvqrcodeAuthStore.auth_code
  while (true) {
    // 已关闭
    if (!tvqrcodeAuthStore.show) return
    if (!tvqrcodeAuthStore.auth_code) return
    if (pollfor !== tvqrcodeAuthStore.auth_code) return

    // poll
    await delay(1000)
    res = await poll(tvqrcodeAuthStore.auth_code)
    const { success, accessKey, message, action } = res!

    /**
     * handle result
     */

    // in any case, show message
    updateStore({ message })

    if (success) {
      await delay(1000)
      hideQRCode()
      return accessKey
    }

    // refresh
    if (action === 'refresh') {
      await delay(2000) // let user see '已过期消息'
      await refreshQRCode()
      pollfor = tvqrcodeAuthStore.auth_code
      updateStore({ message: '已刷新二维码' })
      continue
    }

    if (action === 'wait') {
      continue
    }

    // other errors
    updateStore({ message })
    const shouldToast =
      tvqrcodeAuthStore.show &&
      tvqrcodeAuthStore.auth_code &&
      pollfor === tvqrcodeAuthStore.auth_code
    if (shouldToast) toast(message)
    return
  }
}
