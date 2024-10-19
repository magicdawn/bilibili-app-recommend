import { AntdMessage } from '$utility'
import delay from 'delay'

export async function toastAndReload(msg = '即将刷新网页!') {
  AntdMessage.info(msg)
  await delay(500)
  location.reload()
}
