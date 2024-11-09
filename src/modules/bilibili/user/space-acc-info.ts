import { APP_NAME } from '$common'
import { isWebApiSuccess, request } from '$request'
import { whenIdle } from '$utility'
import localforage from 'localforage'
import ms from 'ms'
import pLimit from 'p-limit'
import { get_w_webId } from '../risk-control/w_webid'
import type { SpaceAccInfo, SpaceAccInfoJson } from './space-acc-info.d'

const MAX_CACHE_DURATION = ms('10d')
type SpaceAccInfoCacheEntry = { val: SpaceAccInfo; ts: number }

const spaceAccInfoDB = localforage.createInstance({
  name: APP_NAME,
  storeName: 'space_acc_info',
  driver: localforage.INDEXEDDB,
})

async function cleanUp() {
  spaceAccInfoDB.iterate((value: SpaceAccInfoCacheEntry, key) => {
    if (Date.now() - value.ts > MAX_CACHE_DURATION) {
      spaceAccInfoDB.removeItem(key)
    }
  })
}
whenIdle().then(cleanUp)

const limit = pLimit(2)

export async function getSpaceAccInfo(mid: string | number) {
  const cached = await spaceAccInfoDB.getItem<SpaceAccInfoCacheEntry>(mid.toString())
  const shouldReuse = cached?.val && cached?.ts && Date.now() - cached.ts <= MAX_CACHE_DURATION
  if (shouldReuse) {
    return cached.val
  }

  // 因在 react component 中使用, 可能会导致瞬时并发, 引发风控
  const json = await limit(() => requestSpaceAccInfo(mid))
  if (!isWebApiSuccess(json)) {
    console.warn('[%s] space acc info error for %s: %o', APP_NAME, mid, json)
    return
  }

  const info = json.data
  await spaceAccInfoDB.setItem(mid.toString(), { val: info, ts: Date.now() })

  return info
}

async function requestSpaceAccInfo(mid: string | number) {
  const res = await request.get('/x/space/wbi/acc/info', {
    params: { mid, w_webid: (await get_w_webId()) || '' },
  })
  const json = res.data as SpaceAccInfoJson
  return json
}
