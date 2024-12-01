import { REQUEST_FAIL_MSG } from '$common'
import type { DynamicFeedJson } from '$define'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import type { UpMidType } from './store'

export async function fetchVideoDynamicFeeds({
  offset,
  page,
  upMid,
  signal,
}: {
  offset?: string
  page: number
  upMid?: UpMidType
  signal?: AbortSignal
}) {
  const params: Record<string, number | string> = {
    'timezone_offset': '-480',
    'type': 'video',
    'platform': 'web',
    'features': 'itemOpusStyle',
    'web_location': '0.0',
    'x-bili-device-req-json': JSON.stringify({ platform: 'web', device: 'pc' }),
    'x-bili-web-req-json': JSON.stringify({ spm_id: '0.0' }),
    'page': page,
  }
  if (offset) {
    params.offset = offset
  }
  if (upMid) {
    params.host_mid = upMid
  }

  const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', {
    signal,
    params,
  })
  const json = res.data as DynamicFeedJson

  // fail
  if (!isWebApiSuccess(json)) {
    const msg = json.message || REQUEST_FAIL_MSG
    toast(msg)
    // prevent infinite call
    throw new Error(msg, { cause: json })
  }

  const data = json.data
  if (data?.items?.length) {
    data.items = data.items.filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型
  }

  return data
}
