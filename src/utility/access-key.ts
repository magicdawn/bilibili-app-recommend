import { settings } from '$settings'
import { getAccessKeyByQrCode } from './access-key/tv-qrcode'
import { toast } from './toast'

export async function getAccessKey() {
  const { accessKey, accessKeyExpireAt } = (await getAccessKeyByQrCode()) || {}
  if (!accessKey || !accessKeyExpireAt) return

  settings.accessKey = accessKey
  settings.accessKeyExpireAt = accessKeyExpireAt

  toast('获取成功')
}

export function deleteAccessKey() {
  settings.accessKey = ''
  settings.accessKeyExpireAt = 0
  toast('已删除 access_key')
}
