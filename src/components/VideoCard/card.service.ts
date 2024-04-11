import { HOST_APP } from '$common'
import type { AppRecItem, DmJson, PvideoJson } from '$define'
import { gmrequest, isWebApiSuccess, request } from '$request'
import { getCsrfToken } from '$utility'
import { toast } from '$utility/toast'
import QuickLRU from 'quick-lru'

// api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()
// 视频预览
export async function videoshot(bvid: string) {
  // 2023-09-08 pvideo 出现 404, 切换为 videoshot
  // const res = await request.get('/pvideo', { params: { aid } })
  const res = await request.get('/x/player/videoshot', {
    params: { bvid, index: '1' },
  })
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

export const cache = new QuickLRU<string, VideoData>({ maxSize: 1_0000 })

export type VideoData = {
  videoshotData: PvideoJson['data']
  dmData: DmJson['data']
}

export async function getVideoData(bvid: string) {
  if (cache.has(bvid)) {
    return cache.get(bvid) as VideoData
  }

  const videoshotData = await videoshot(bvid)
  const dmData: string[] = []
  cache.set(bvid, { videoshotData, dmData })

  // load images
  const imgs = videoshotData.image.slice(0, 3)
  await Promise.all(
    imgs.map((src) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
      })
    }),
  )

  return { videoshotData, dmData }
}

/**
 * 添加/删除 "稍后再看"
 * add 支持 avid & bvid, del 只支持 avid. 故使用 avid
 */

function watchLaterFactory(action: 'add' | 'del') {
  return async function watchLaterOp(avid: string) {
    const form = new URLSearchParams({
      aid: avid,
      csrf: getCsrfToken(),
    })
    const res = await request.post('/x/v2/history/toview/' + action, form)

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
 * 可以查询视频: 关注/点赞/投币/收藏 状态
 */

export async function getRelated(bvid: string) {
  const res = await request.get('/x/web-interface/archive/relation', {
    params: { bvid },
  })
}
