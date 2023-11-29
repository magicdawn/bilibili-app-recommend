/**
 * user blacklist services
 */

import { isWebApiSuccess, request } from '$request'
import { useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import type { ListBlackJson } from './api.list-black'
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

export async function getUserBlacklist() {
  const ps = 20
  let pn = 1

  const getPage = async (pn: number) => {
    const res = await request.get('/x/relation/blacks', {
      params: {
        re_version: 0,
        ps,
        pn,
      },
    })

    const json = res.data as ListBlackJson
    if (!isWebApiSuccess(json)) return

    const total = json.data.total
    const mids = json.data.list.map((x) => x.mid)
    return { total, mids }
  }

  let blackMids: number[] = []
  const { total, mids = [] } = (await getPage(1)) || {}
  blackMids = blackMids.concat(mids)

  if (total) {
    const maxPn = Math.ceil(total / ps)
    for (pn++; pn <= maxPn; pn++) {
      const { mids = [] } = (await getPage(pn)) || {}
      blackMids = blackMids.concat(mids)
    }
  }

  return blackMids
}
