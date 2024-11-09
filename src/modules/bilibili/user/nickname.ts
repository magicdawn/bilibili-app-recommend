import { APP_NAME } from '$common'
import { whenIdle } from '$utility'
import localforage from 'localforage'
import ms from 'ms'
import { getSpaceAccInfo } from './space-acc-info'

type NicknameCacheEntry = { val: string; ts: number }
const MAX_CACHE_DURATION = ms('10d')

const nicknameDB = localforage.createInstance({
  name: APP_NAME,
  storeName: 'user_nickname',
  driver: localforage.INDEXEDDB,
})

function cleanUp() {
  nicknameDB.iterate((value: NicknameCacheEntry, key) => {
    if (Date.now() - value.ts > MAX_CACHE_DURATION) {
      nicknameDB.removeItem(key)
    }
  })
}
whenIdle().then(cleanUp)

export async function setNicknameCache(mid: string | number, nickname: string) {
  await nicknameDB.setItem(mid.toString(), { val: nickname, ts: Date.now() })
}

export async function getUserNickname(mid: string | number) {
  const cached = await nicknameDB.getItem<NicknameCacheEntry>(mid.toString())
  const shouldReuse = cached?.val && cached?.ts && Date.now() - cached.ts <= MAX_CACHE_DURATION
  if (shouldReuse) {
    return cached.val
  }

  const info = await getSpaceAccInfo(mid)
  const nickname = info?.name

  // save cache
  if (nickname) {
    setNicknameCache(mid, nickname)
  }

  return nickname
}
