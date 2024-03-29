/**
 * user blacklist services
 */

import { APP_NAME, IN_BILIBILI_HOMEPAGE, baseDebug } from '$common'
import { isWebApiSuccess, request } from '$request'
import { whenIdle } from '$utility'
import { snapshot, subscribe, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import type { ListBlackJson } from './api.list-black'
import { modifyRelations } from './common'

const debug = baseDebug.extend('service:user:relations:blacklist')

export const blacklistAdd = blacklistActionFactory('follow')
export const blacklistRemove = blacklistActionFactory('remove')

export const UserBlacklistService = {
  add: blacklistAdd,
  remove: blacklistRemove,
}

const STORAGE_KEY = `${APP_NAME}-blacklist-mids`
const initialVaue = (localStorage.getItem(STORAGE_KEY) || '').split(',')
export const blacklistIds = proxySet<string>(initialVaue)
subscribe(blacklistIds, (val) => {
  localStorage.setItem(STORAGE_KEY, Array.from(snapshot(blacklistIds)).join(','))
})

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
    blacklistIds.clear()
    ids.forEach((x) => {
      blacklistIds.add(x.toString())
    })
  }

  debug('user blocklist fetched: %o', ids)
  return ids
})()
