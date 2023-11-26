import { settings } from '$settings'
import { getAccessKeyByQrCode } from './access-key/tv-qrcode'
import { toast } from './toast'

export async function auth() {
  const accessKey = await getAccessKeyByQrCode()
  if (!accessKey) return

  settings.accessKey = accessKey
  toast('获取成功')
  return accessKey
}

export function deleteAccessToken() {
  settings.accessKey = ''
  toast('已删除 access_key')
}
