/**
 * user blacklist services
 */

import { useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { modifyRelations } from './common'

export const blacklistAdd = blacklistActionFactory('follow')
export const blacklistRemove = blacklistActionFactory('remove')

export const UserBlacklistService = {
  add: blacklistAdd,
  remove: blacklistRemove,
}

export const blacklistIds = proxySet<string>()
export function useInBlacklist(upMid?: string) {
  const set = useSnapshot(blacklistIds)
  return upMid && set.has(upMid)
}

function blacklistActionFactory(action: 'follow' | 'remove') {
  const act = action === 'follow' ? 5 : 6

  return async function blacklistAction(upMid: string) {
    const success = await modifyRelations(upMid, act)

    if (success) {
      if (action === 'follow') {
        blacklistIds.add(upMid)
      } else if (action === 'remove') {
        blacklistIds.delete(upMid)
      }
    }

    return success
  }
}
