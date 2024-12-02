import { getUid } from '$utility/cookie'

export function formatFavFolderUrl(id: number) {
  return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}`
}

export function formatFavCollectionUrl(id: number, ctype = 21) {
  return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}&ftype=collect&ctype=${ctype}`
}

export function formatFavPlaylistUrl(id: number) {
  return `https://www.bilibili.com/list/ml${id}`
}

export function formatBvidUrl(bvid: string) {
  return `https://www.bilibili.com/video/${bvid}`
}
