import { APP_NAME, baseDebug } from '$common'
import { BilibiliArticleDraft } from '$modules/user/article-draft'
import type { SettingsKey } from '.'

export const debug = baseDebug.extend('settings')

export const articleDraft = new BilibiliArticleDraft(APP_NAME)

const privateKeys: SettingsKey[] = ['accessKey', 'accessKeyExpireAt']

export const backupOmitKeys: SettingsKey[] = [
  ...privateKeys,

  // the flag
  'backupSettingsToArticleDraft',

  // 无关紧要
  'shuffleForFav',
  'addSeparatorForFav',

  'shuffleForWatchLater',
  'addSeparatorForWatchLater',

  'shuffleForPopularWeekly',
  'anonymousForPopularGeneral',
  'hideChargeOnlyDynamicFeedVideos',
]

export const restoreOmitKeys: SettingsKey[] = [
  ...privateKeys,

  // the flag
  'backupSettingsToArticleDraft',
]
