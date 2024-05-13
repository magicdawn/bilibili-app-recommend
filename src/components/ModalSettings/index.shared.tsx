import { AntdMessage } from '$utility'
import delay from 'delay'

export let HAS_RESTORED_SETTINGS = false

export function set_HAS_RESTORED_SETTINGS(val: boolean) {
  HAS_RESTORED_SETTINGS = val
}

export async function toastAndReload() {
  AntdMessage.info('即将刷新网页')
  await delay(500)
  location.reload()
}
