import { REQUEST_FAIL_MSG } from '$common'
import { C } from '$common/emotion-css'
import { CustomTargetLink } from '$components/VideoCard/use/useOpenRelated'
import type { FavItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { OpenExternalLinkIcon, PlayerIcon } from '$modules/icon'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { formatFavFolderUrl, formatFavPlaylistUrl } from '../fav-url'
import type { FavFolder } from '../types/folders/list-all-folders'
import type { FavFolderDetailInfo, ResourceListJSON } from '../types/folders/list-folder-items'

export class FavFolderBasicService {
  constructor(public entry: FavFolder) {
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo | undefined
  page = 0 // pages loaded

  async loadMore(abortSignal?: AbortSignal): Promise<FavItemExtend[] | undefined> {
    if (!this.hasMore) return

    const res = await request.get('/x/v3/fav/resource/list', {
      params: {
        media_id: this.entry.id,
        pn: this.page + 1, // start from 1
        ps: 20,
        keyword: '',
        order: 'mtime', // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
        type: '0', // unkown
        tid: '0', // 分区
        platform: 'web',
      },
    })

    const json = res.data as ResourceListJSON
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)
      return
    }

    this.page++
    this.hasMore = json.data.has_more
    this.info = json.data.info

    // 新建空收藏夹, medias = null
    let items = json.data.medias || []
    items = items.filter((item) => {
      if (item.title === '已失效视频') return false
      return true
    })

    return items.map((item) => {
      return {
        ...item,
        from: 'fav-folder',
        folder: this.info!,
        api: EApiType.Fav,
        uniqId: `fav-${this.info?.id}-${item.bvid}`,
      }
    })
  }
}

const S = {
  item: css`
    display: inline-flex;
    align-items: center;
    font-size: 15px;

    &:not(:first-child) {
      margin-left: 30px;
    }

    /* the icon */
    svg {
      margin-right: 5px;
      margin-top: -1px;
    }
  `,
}

export function FavSeparatorContent({ service }: { service: FavFolderBasicService }) {
  return (
    <>
      <CustomTargetLink href={formatFavFolderUrl(service.entry.id)} css={S.item}>
        <OpenExternalLinkIcon css={C.size(16)} />
        {service.entry.title}
      </CustomTargetLink>
      <CustomTargetLink href={formatFavPlaylistUrl(service.entry.id)} css={S.item}>
        <PlayerIcon css={C.size(16)} />
        播放全部
      </CustomTargetLink>
    </>
  )
}
