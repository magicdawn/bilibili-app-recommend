import { AppRecItem, DmJson, PvideoJson } from '$define'
import { FavFolderListAllJson } from '$define/fav/folder-list-all'
import { HOST_APP, gmrequest, isWebApiSuccess, request } from '$request'
import { getUid } from '$service/fav'
import { getCsrfToken, getHasLogined } from '$utility'
import { OPERATION_FAIL_MSG, toast } from '$utility/toast'
import { LRUCache } from 'lru-cache'

// api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()
// 视频预览
export async function pvideo(aid: string) {
  const res = await request.get('/pvideo', { params: { aid } })
  const json = res.data as PvideoJson

  // TODO: process errors

  return json.data
}

// dm
export async function dm(aid: string) {
  // 暂时没有支持弹幕预览, 不调用该接口
  return []

  const res = await request.get('/x/v2/dm/ajax', { params: { aid } })
  const json = res.data as DmJson

  // TODO: process errors

  return json.data
}

export const cache = new LRUCache<string, VideoData>({ max: 1000 })

export type VideoData = {
  pvideoData: PvideoJson['data']
  dmData: DmJson['data']
}

export async function getVideoData(id: string) {
  if (cache.has(id)) {
    return cache.get(id) as VideoData
  }

  const [pvideoData, dmData] = await Promise.all([pvideo(id), dm(id)])
  cache.set(id, { pvideoData, dmData })

  return { pvideoData, dmData }
}

/**
 * 添加/删除 "稍后再看"
 */

function watchLaterFactory(action: 'add' | 'del') {
  return async function watchLaterOp(id: string) {
    const form = new FormData()
    form.append('aid', id)
    form.append('csrf', getCsrfToken())

    const res = await request.post('/x/v2/history/toview/' + action, form, {
      withCredentials: true,
    })

    // {
    //     "code": 0,
    //     "message": "0",
    //     "ttl": 1
    // }
    const json = res.data
    const success = isWebApiSuccess(json)

    if (!success) {
      toast(json?.message || '出错了')
    }

    return success
  }
}

export const watchLaterAdd = watchLaterFactory('add')
export const watchLaterDel = watchLaterFactory('del')

/**
 * 不喜欢 / 撤销不喜欢
 * https://github.com/indefined/UserScripts/blob/master/bilibiliHome/bilibiliHome.API.md
 *
 * 此类内容过多 reason_id = 12
 * 推荐过 reason_id = 13
 */

const dislikeFactory = (type: 'dislike' | 'cancel') => {
  const pathname = {
    dislike: '/x/feed/dislike',
    cancel: '/x/feed/dislike/cancel',
  }[type]

  return async function (item: AppRecItem, reasonId: number) {
    const res = await gmrequest.get(HOST_APP + pathname, {
      params: {
        goto: item.goto,
        id: item.param,

        // mid: item.mid,
        // rid: item.tid,
        // tag_id: item.tag?.tag_id,

        reason_id: reasonId,

        // other stuffs
        build: '1',
        mobi_app: 'android',
        idx: (Date.now() / 1000).toFixed(0),
      },
    })

    // {
    //     "code": 0,
    //     "message": "0",
    //     "ttl": 1
    // }
    const json = res.data
    const success = isWebApiSuccess(json)
    return success
  }
}

export const dislike = dislikeFactory('dislike')
export const cancelDislike = dislikeFactory('cancel')

/**
 * 收藏
 * resource = ${avId}:${type}
 * type 一般为 2, 即获取收藏夹里的视频返回的 Media.type 意义不明
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/video/action.html#%E6%94%B6%E8%97%8F%E8%A7%86%E9%A2%91-%E5%8F%8C%E7%AB%AF
 */

export async function removeFav(folderId: number | string, resource: string) {
  const form = new FormData()
  form.append('resources', resource)
  form.append('media_id', folderId.toString())
  form.append('platform', 'web')
  form.append('csrf', getCsrfToken())

  // resources: 421702525:2
  // media_id: 484882829
  // platform: web
  // csrf: ''

  const res = await request.post('/x/v3/fav/resource/batch-del', form)
  const json = res.data
  const success = isWebApiSuccess(json)

  if (!success) {
    toast(json.message || OPERATION_FAIL_MSG)
  }

  return success
}

/**
 * 可以查询视频: 关注/点赞/投币/收藏 状态
 */
export async function getRelated(bvid: string) {
  const res = await request.get('/x/web-interface/archive/relation', { params: { bvid } })
}

/**
 * 获取视频所在收藏夹
 * @see https://github.com/the1812/Bilibili-Evolved/blob/master/registry/lib/components/video/quick-favorite/QuickFavorite.vue
 */

export async function getVideoFavState(avid: string) {
  if (!getHasLogined()) return
  const res = await request.get('/x/v3/fav/folder/created/list-all', {
    params: {
      up_mid: getUid(),
      type: 2,
      rid: avid,
    },
  })
  const json = res.data as FavFolderListAllJson
  const favFolderNames = json.data.list
    .filter((folder) => folder.fav_state > 0)
    .map((folder) => folder.title)
  return favFolderNames
}
