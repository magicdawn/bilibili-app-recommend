/**
 * 专栏-草稿管理
 */

import { APP_NAME } from '$common'
import { isWebApiSuccess, request } from '$request'
import { getCsrfToken, toast } from '$utility'
import type { AddUpdateJSON } from './define/addupdate'
import type { DraftListJSON } from './define/draft-list'
import type { DraftViewJSON } from './define/draft-view'

/**
API

ls
https://member.bilibili.com/x/web/draft/list


https://api.bilibili.com/x/article/is_author
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "can_edit": true,
    "forbid": false,
    "id": 0,
    "is_author": true,
    "level": true
  }
}

新建草稿流程

输入标题1
https://api.bilibili.com/x/article/creative/draft/addupdate

title: 1
banner_url:
content:
summary:
words: 0
category: 15
tid: 0
reprint: 0
tags:
image_urls:
origin_image_urls:
dynamic_intro:
media_id: 0
spoiler: 0
original: 0
top_video_bvid:
csrf: 568a6c83e22b710fca4d5a363dbe3d69


得到
{"code":0,"message":"0","ttl":1,"data":{"aid":253429}}


再次调用 addupdate
title: 1
banner_url:
content:
summary:
words: 0
category: 15
tid: 0
reprint: 0
tags:
image_urls:
origin_image_urls:
dynamic_intro:
media_id: 0
spoiler: 0
original: 0
top_video_bvid:
aid: 253429
csrf: 568a6c83e22b710fca4d5a363dbe3d69

content: <p>{}</p>


https://member.bilibili.com/x/web/draft/delete
aid: 253431
csrf: 568a6c83e22b710fca4d5a363dbe3d69


https://api.bilibili.com/x/article/creative/draft/view?aid=253439

 */

export async function listAll() {
  const json = (await request.get('https://member.bilibili.com/x/web/draft/list'))
    .data as DraftListJSON
  const drafts = json.artlist?.drafts || []
  return drafts
}

export async function addupdate(
  payload: Partial<{ aid: string; title: string; content: string; words: string }>
) {
  const form = new URLSearchParams({
    title: '',
    banner_url: '',
    content: '',
    summary: '',
    words: '0',
    category: '15',
    tid: '0',
    reprint: '0',
    tags: '',
    image_urls: '',
    origin_image_urls: '',
    dynamic_intro: '',
    media_id: '0',
    spoiler: '0',
    original: '0',
    top_video_bvid: '',
    aid: '',
    csrf: getCsrfToken(),
    ...payload,
  })

  const json = (await request.post('/x/article/creative/draft/addupdate', form))
    .data as AddUpdateJSON
  const aid = json?.data?.aid?.toString()
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json.message || 'addupdate error')
  }

  return { success, aid }
}

export async function draftView(aid: string | number) {
  const json = (
    await request.get('/x/article/creative/draft/view', {
      params: { aid },
    })
  ).data as DraftViewJSON
  return json?.data?.content || ''
}

/**
 * 使用「专栏草稿」作为存储, getData & setData
 */

export async function getData<T = any>(): Promise<T | undefined> {
  const allDrafts = await listAll()
  const draft = allDrafts.find((d) => d.title === APP_NAME)
  // create new draft
  if (!draft) {
    const { success, aid } = await addupdate({ title: APP_NAME })
    return
  }

  const content = await draftView(draft.id)
  const parser = new DOMParser()
  const parsed = parser.parseFromString(content, 'text/html')
  const text = (parsed.body.textContent || '').trim()
  if (!text) return
  try {
    return JSON.parse(text) as T
  } catch (e) {
    return
  }
}

// cache aid for setData
// a refresh is needed after manual delete article draft by bilibili dashboard
let aid: string = ''

export async function setData<T = any>(data: T): Promise<boolean> {
  if (!aid) {
    const allDrafts = await listAll()
    const draft = allDrafts.find((d) => d.title === APP_NAME)
    if (!draft) {
      // create new draft
      const { success, aid: newDraftAid } = await addupdate({ title: APP_NAME })
      if (!success) return false
      aid = newDraftAid
    } else {
      aid = draft.id.toString()
    }
  }

  const dataStr = JSON.stringify(data)
  const { success } = await addupdate({
    aid,
    title: APP_NAME,
    content: `<p>${dataStr}</p>`,
    words: dataStr.length.toString(),
  })
  return success
}
