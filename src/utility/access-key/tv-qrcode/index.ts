/**
 * 模拟 TV 端获取 access_key
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/login/login_action/QR.html#tv%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95
 */

import { toast } from '$utility'
import delay from 'delay'
import {
  hideQrCodeModal,
  qrcodeStore,
  showQrCodeModal,
  updateStore,
  whenQrCodeModalHide,
} from './TvQrCodeAuth'
import type { PollResult } from './api'
import { getQrCodeInfo, poll } from './api'

async function refreshQrCode() {
  const qrinfo = await getQrCodeInfo()
  if (!qrinfo) return

  // show
  showQrCodeModal({ qrcode: qrinfo.url, auth_code: qrinfo.auth_code })
  return true
}

// @ts-ignore
// window.getAccessKeyByQrCode = getAccessKeyByQrCode

export async function getAccessKeyByQrCode() {
  const next = await refreshQrCode()
  if (!next) return

  // start poll
  let res: PollResult | undefined

  let pollfor = qrcodeStore.auth_code
  function shouldBreak() {
    if (!qrcodeStore.show) return true
    if (!qrcodeStore.auth_code) return true
    if (pollfor !== qrcodeStore.auth_code) return true
  }
  while (true) {
    // break check
    if (shouldBreak()) return

    // delay
    const p1 = delay(1500) // wait enough time
    const p2 = whenQrCodeModalHide() // if user click close, quick break
    await Promise.race([p1, p2])
    p2.cancel()

    // break check
    if (shouldBreak()) return

    // poll
    res = await poll(qrcodeStore.auth_code)
    const { success, accessKey, message, action } = res

    /**
     * handle result
     */

    // in any case, show message
    updateStore({ message })

    if (success) {
      await delay(1000)
      hideQrCodeModal()
      return accessKey
    }

    // refresh
    if (action === 'refresh') {
      await delay(2000) // let user see '已过期消息'
      await refreshQrCode()
      pollfor = qrcodeStore.auth_code
      updateStore({ message: '已刷新二维码' })
      continue
    }

    if (action === 'wait') {
      continue
    }

    // other errors
    if (shouldBreak()) return
    updateStore({ message })
    toast(message)
    return
  }
}
