/**
 * 收藏
 * resource = ${avId}:${type}
 * type 一般为 2, 即获取收藏夹里的视频返回的 Media.type 意义不明
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/video/action.html#%E6%94%B6%E8%97%8F%E8%A7%86%E9%A2%91-%E5%8F%8C%E7%AB%AF
 */

import { OPERATION_FAIL_MSG } from '$common'
import { isWebApiSuccess, request } from '$request'
import { getCsrfToken, getHasLogined, getUid } from '$utility/cookie'
import toast from '$utility/toast'
import { formatFavFolderUrl } from './fav-url'
import type { FavFolderListAllJson } from './types/folders/list-all-folders'

export const UserFavService = {
  removeFav,
  addFav,
  getVideoFavState,
}

export async function removeFav(folderId: number | string, resource: string) {
  const form = new URLSearchParams({
    resources: resource,
    media_id: folderId.toString(),
    platform: 'web',
    csrf: getCsrfToken(),
  })
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
  const favFolders = json.data.list.filter((folder) => folder.fav_state > 0)

  const favFolderNames = favFolders.map((f) => f.title)
  const favFolderUrls = favFolders.map((f) => formatFavFolderUrl(f.id))

  return { favFolders, favFolderNames, favFolderUrls }
}

// media_ids: 收藏夹 id, 逗号分割
export async function favDeal({
  avid,
  add_media_ids = '',
  del_media_ids = '',
}: {
  avid: string | number
  add_media_ids?: string
  del_media_ids?: string
}) {
  const form = new URLSearchParams({
    rid: avid.toString(),
    type: '2',
    add_media_ids,
    del_media_ids,
    platform: 'web',
    eab_x: '2',
    ramval: '0',
    ga: '1',
    gaia_source: 'web_normal',
    csrf: getCsrfToken(),
  })

  const res = await request.post('/x/v3/fav/resource/deal', form)
  const json = res.data
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json?.message || 'fav deal api fail')
  }
  return success
}

export let defaultFavFolderId = 0
export let defaultFavFolderName = ''

export async function addFav(avid: string | number) {
  if (!defaultFavFolderId || !defaultFavFolderName) {
    // NOTE: 不使用 FavService, 因其包含 exclude fav folder 逻辑, 这里期望加入默认收藏夹
    const folders = await fetchFavFolder()
    defaultFavFolderId = folders[0].id
    defaultFavFolderName = folders[0].title
  }
  return await favDeal({ avid, add_media_ids: defaultFavFolderId.toString() })
}

export async function fetchFavFolder() {
  const res = await request.get('/x/v3/fav/folder/created/list-all', {
    params: {
      up_mid: getUid(),
    },
  })
  const json = res.data as FavFolderListAllJson
  const folders = json.data.list
  return folders
}
