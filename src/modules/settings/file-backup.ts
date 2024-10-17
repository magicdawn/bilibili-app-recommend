import { APP_NAME } from '$common'
import { set_HAS_RESTORED_SETTINGS, toastAndReload } from '$components/ModalSettings/index.shared'
import { AntdMessage } from '$utility'
import { toast } from '$utility/toast'
import dayjs from 'dayjs'
import { pick } from 'lodash'
import { tryit } from 'radash'
import { allowedSettingsKeys, getSettingsSnapshot, updateSettings } from '.'

let lastUrl: string | undefined
function genUrl() {
  // revoke previous created url
  tryit(() => {
    if (lastUrl) URL.revokeObjectURL(lastUrl)
    lastUrl = undefined
  })()

  const val = getSettingsSnapshot()
  const json = JSON.stringify(val, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  lastUrl = URL.createObjectURL(blob)
  return lastUrl
}

export async function exportSettings() {
  const url = genUrl()
  const filename = `${APP_NAME}-settings ${dayjs().format('YYYY-MM-DD HH:mm:ss')}.json`
  if (typeof GM_download !== 'undefined') {
    GM_download?.({ url, name: filename })
  } else {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }
}

export async function importSettings() {
  const file = await selectFile('.json')
  if (!file) return

  const text = await file.text()
  if (!text) return toast('文件内容为空!')

  let settingsFromFile
  try {
    settingsFromFile = JSON.parse(text)
  } catch (error) {
    return toast('无法解析文件内容!')
  }

  const pickedSettings = pick(settingsFromFile || {}, allowedSettingsKeys)
  const len = Object.keys(pickedSettings).length
  if (!len) {
    return toast('没有有效的设置!')
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings(pickedSettings)
  AntdMessage.success('导入成功!')
  return toastAndReload()
}

function selectFile(accept: string = '*') {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = false
    input.addEventListener('change', () => {
      resolve(input.files?.[0] || null)
    })
    input.click()
  })
}
