import { APP_NAME, baseDebug } from '$common'
import { BilibiliArticleDraft } from '$modules/bilibili/me/article-draft'
import { internalBooleanPaths, type SettingsPath } from '.'

export const debug = baseDebug.extend('settings')

export const articleDraft = new BilibiliArticleDraft(APP_NAME)

const privateKeys: SettingsPath[] = ['accessKey', 'accessKeyExpireAt']

export const getBackupOmitPaths: () => SettingsPath[] = () => [
  ...privateKeys,

  ...internalBooleanPaths,

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

export const restoreOmitPaths: SettingsPath[] = [
  ...privateKeys,

  // the flag
  'backupSettingsToArticleDraft',
]
