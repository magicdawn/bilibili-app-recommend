import { isEqual, omit, throttle } from 'lodash'
import ms from 'ms'
import type { Settings } from '.'
import { articleDraft, backupOmitKeys, debug } from './index.shared'
import { HAS_RESTORED_SETTINGS } from './restore-flag'

let lastBackupVal: Partial<Settings> | undefined
const setDataThrottled = throttle(articleDraft.setData, ms('5s'))

export async function saveToDraft(val: Readonly<Settings>) {
  if (!val.backupSettingsToArticleDraft) return
  // skip when `HAS_RESTORED_SETTINGS=true`
  if (HAS_RESTORED_SETTINGS) return

  const currentBackupVal = omit(val, backupOmitKeys)
  const shouldBackup = !lastBackupVal || !isEqual(lastBackupVal, currentBackupVal)
  if (!shouldBackup) return

  try {
    await setDataThrottled(currentBackupVal)
    lastBackupVal = currentBackupVal
    debug('backup to article draft complete')
  } catch (e: any) {
    console.error(e.stack || e)
  }
}
