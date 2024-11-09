import { APP_NAME } from '$common'
import { request } from '$request'
import localforage from 'localforage'
import type { VideoDetailData, VideoDetailJson } from './api.video-detail'

/**
 * @see https://socialsisteryi.github.io/bilibili-API-collect/docs/video/info.html
 */

const videoDetailCacheDB = localforage.createInstance({
  name: APP_NAME,
  storeName: 'video_detail',
  driver: localforage.INDEXEDDB,
})

export async function getVideoDetail(bvid: string) {
  const db = videoDetailCacheDB
  const cacheKey = bvid

  // check cache
  {
    const data = await db.getItem<VideoDetailData>(cacheKey)
    if (data) return data
  }

  const res = await request.get('/x/web-interface/view', { params: { bvid } })
  const json = res.data as VideoDetailJson
  const data = json.data
  await db.setItem(cacheKey, data)
  return data
}
