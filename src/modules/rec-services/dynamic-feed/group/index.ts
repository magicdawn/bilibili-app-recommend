import { request } from '$request'
import { getUid } from '$utility/cookie'
import { encWbi, getWwebId } from '$utility/wbi'
import { uniq } from 'lodash'
import type { FollowGroupContent, FollowGroupContentJson } from './group-content'
import type { FollowGroupsJson } from './groups'

/**
 * 其中返回的没有 "悄悄关注", 而且悄悄关注使用 API /x/relation/whispers
 */

export async function getAllFollowGroups() {
  const params = await encWbi({
    web_location: '0.0',
    w_webid: (await getWwebId()) || '',
  })
  const res = await request.get('/x/relation/tags', { params })
  const json = res.data as FollowGroupsJson
  const groups = json.data || []
  return groups
}

export async function getFollowGroupContent(tagid: number) {
  const ps = 20

  const singleRequest = async (page: number) => {
    const res = await request.get('/x/relation/tag', {
      params: {
        mid: getUid(),
        tagid,
        pn: page,
        ps,
      },
    })
    const json = res.data as FollowGroupContentJson
    return json.data
  }

  let pn = 1
  let items: FollowGroupContent[] = []
  let currentPageItems: FollowGroupContent[] = []
  do {
    currentPageItems = await singleRequest(pn++)
    items = items.concat(currentPageItems)
  } while (currentPageItems.length > 0)

  const mids = uniq(items.map((x) => x.mid))
  return mids
}
