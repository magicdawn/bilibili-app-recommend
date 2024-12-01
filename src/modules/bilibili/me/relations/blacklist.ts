/**
 * user blacklist services
 */

import { IN_BILIBILI_HOMEPAGE, baseDebug } from '$common'
import { isWebApiSuccess, request } from '$request'
import { whenIdle } from '$utility/dom'
import { proxySetWithGmStorage } from '$utility/valtio'
import { useSnapshot } from 'valtio'
import { modifyRelations } from './common'
import type { ListBlackJson } from './types/list-black'

const debug = baseDebug.extend('service:user:relations:blacklist')

export const blacklistAdd = blacklistActionFactory('follow')
export const blacklistRemove = blacklistActionFactory('remove')

export const UserBlacklistService = {
  add: blacklistAdd,
  remove: blacklistRemove,
}

export const blacklistMids = await proxySetWithGmStorage('blacklist-mids')

export function useInBlacklist(upMid?: string) {
  const set = useSnapshot(blacklistMids)
  return !!upMid && set.has(upMid)
}

function blacklistActionFactory(action: 'follow' | 'remove') {
  const act = action === 'follow' ? 5 : 6

  return async function blacklistAction(upMid: string) {
    const success = await modifyRelations(upMid, act)

    if (success) {
      if (action === 'follow') {
        blacklistMids.add(upMid)
      } else if (action === 'remove') {
        blacklistMids.delete(upMid)
      }
    }

    return success
  }
}

export async function getUserBlacklist() {
  const ps = 20

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

  const ret = await getPage(1)
  if (!ret) return
  const { total, mids = [] } = ret
  let blackMids: number[] = mids

  if (total) {
    const maxPn = Math.ceil(total / ps)
    for (let pn = 2; pn <= maxPn; pn++) {
      const { mids = [] } = (await getPage(pn)) || {}
      blackMids = blackMids.concat(mids)
    }
  }

  return blackMids
}

;(async () => {
  // 首页需要
  if (!IN_BILIBILI_HOMEPAGE) return

  await whenIdle()
  const ids = await getUserBlacklist()

  if (ids) {
    blacklistMids.clear()
    ids.forEach((x) => blacklistMids.add(x.toString()))
  }

  debug('user blocklist fetched: %o', ids)
  return ids
})()
