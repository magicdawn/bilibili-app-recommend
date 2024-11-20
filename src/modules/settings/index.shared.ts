import { APP_NAME, baseDebug } from '$common'
import { BilibiliArticleDraft } from '$modules/bilibili/me/article-draft'
import { internalBooleanKeys, type SettingsKey } from '.'

export const debug = baseDebug.extend('settings')

export const articleDraft = new BilibiliArticleDraft(APP_NAME)

const privateKeys: SettingsKey[] = ['accessKey', 'accessKeyExpireAt']

export const getBackupOmitKeys: () => SettingsKey[] = () => [
  ...privateKeys,

  ...internalBooleanKeys,

  // the flag
  'backupSettingsToArticleDraft',

  // 无关紧要
  'favUseShuffle',
  'favAddSeparator',

  'watchlaterUseShuffle',
  'watchlaterAddSeparator',

  'popularWeeklyUseShuffle',
  'popularGeneralUseAnonymous',
]

export const restoreOmitKeys: SettingsKey[] = [
  ...privateKeys,

  // the flag
  'backupSettingsToArticleDraft',
]
