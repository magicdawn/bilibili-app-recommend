import { getUid } from '$utility/cookie'

export function formatFavFolderUrl(id: number) {
  const uid = getUid()
  return `https://space.bilibili.com/${uid}/favlist?fid=${id}`
}

export function formatFavPlaylistUrl(id: number) {
  return `https://www.bilibili.com/list/ml${id}`
}
