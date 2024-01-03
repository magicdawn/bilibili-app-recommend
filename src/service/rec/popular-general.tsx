import { REQUEST_FAIL_MSG } from '$common'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { type PopularGeneralItemExtend } from '$define'
import { ApiType } from '$define/index.shared'
import type { PopularGeneralJson } from '$define/popular-general'
import { isWebApiSuccess, request } from '$request'
import { blacklistIds } from '$service/user/relations/blacklist'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility'
import { Switch } from 'antd'
import delay from 'delay'
import type { IService } from './base'

export class PopularGeneralService implements IService {
  hasMore = true
  page = 0 // pages loaded

  // shuffle: boolean
  anonymous: boolean

  constructor() {
    // this.shuffle = settings.shuffleForPopularGeneral
    this.anonymous = settings.anonymousForPopularGeneral
  }

  async loadMore() {
    if (!this.hasMore) return

    const res = await request.get('/x/web-interface/popular', {
      params: {
        ps: 20,
        pn: this.page + 1,
      },
      withCredentials: !this.anonymous,
    })
    const json = res.data as PopularGeneralJson
    if (!isWebApiSuccess(json)) {
      return toast(json.message || REQUEST_FAIL_MSG), undefined
    }

    this.page++
    this.hasMore = !json.data.no_more

    let items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: ApiType.popularGeneral,
        uniqId: item.bvid,
      } as PopularGeneralItemExtend
    })
    // 过滤黑名单
    items = items.filter((item) => !blacklistIds.has(item.owner.mid.toString()))
    return items
  }

  get usageInfo() {
    return <PopularGeneralUsageInfo />
  }
}

function PopularGeneralUsageInfo() {
  const { anonymousForPopularGeneral } = useSettingsSnapshot()

  const onRefresh = useOnRefreshContext()

  return (
    <>
      {/* <Switch
        style={{ margin: '0 10px' }}
        checked={shuffleForPopularGeneral}
        onChange={(val) => {
          updateSettings({ shuffleForPopularGeneral: val })
          onRefresh?.()
        }}
        checkedChildren='随机顺序'
        unCheckedChildren='默认顺序'
      /> */}
      <Switch
        style={{ margin: '0 10px' }}
        checked={anonymousForPopularGeneral}
        onChange={async (val) => {
          updateSettings({ anonymousForPopularGeneral: val })
          await delay(100)
          onRefresh?.()
        }}
        checkedChildren='匿名访问'
        unCheckedChildren='登录访问'
      />
    </>
  )
}
