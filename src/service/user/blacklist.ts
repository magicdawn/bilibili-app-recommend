/**
 * user blacklist services
 */

import { isWebApiSuccess, request } from '$request'
import { getCsrfToken, getUid, toast } from '$utility'
import { useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'

export const blacklistAdd = blacklistActionFactory('add')
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

function blacklistActionFactory(action: 'add' | 'remove') {
  const act = action === 'add' ? 5 : 6

  return async function blacklistAction(upMid: string) {
    const uid = getUid()
    const params = new URLSearchParams({
      fid: upMid,
      act: String(act),
      re_src: '11',
      spmid: '333.999.0.0',
      extend_content: JSON.stringify({
        entity: 'user',
        entity_id: uid,
        fp: d(),
      }),
      csrf: getCsrfToken(),
    })

    const res = await request.post('/x/relation/modify', params)
    const json = res.data
    const success = isWebApiSuccess(json)

    if (!success) {
      toast(json.message || '未知错误')
    }

    if (success) {
      if (action === 'add') {
        blacklistIds.add(upMid)
      } else if (action === 'remove') {
        blacklistIds.delete(upMid)
      }
    }

    return success
  }
}

/**
 * 拷贝自 space.bilibili.com 代码
 */
function d() {
  let t
  let e
  let i =
    // @ts-ignore
    (null === (t = window.reportObserver) || void 0 === t || null === (e = t.cache) || void 0 === e
      ? void 0
      : e.fpriskMsg) || {}
  let n = 'empty'
  return (
    i &&
      (n =
        i.webdriver +
        '' +
        i.screenResolution +
        '' +
        i.platform +
        '' +
        i.hardwareConcurrency +
        '' +
        i.deviceMemory +
        '' +
        i.colorDepth +
        '' +
        i.indexedDb +
        '' +
        i.language +
        '' +
        i.openDatabase +
        '' +
        i.touchSupport +
        '' +
        i.userAgent),
    decodeURIComponent(n)
  )
}
