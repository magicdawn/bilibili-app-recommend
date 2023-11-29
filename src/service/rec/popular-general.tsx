import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { PopularGeneralItemExtend } from '$define'
import type { PopularGeneralJson } from '$define/popular-general'
import { request } from '$request'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { Switch } from 'antd'
import type { IService } from './base'

export class PopularGeneralService implements IService {
  hasMore = true
  page = 1

  shuffle: boolean
  anonymous: boolean

  constructor() {
    this.shuffle = settings.shuffleForPopularGeneral
    this.anonymous = settings.anonymousForPopularGeneral
  }

  async loadMore() {
    if (!this.hasMore) return

    const res = await request.get('/x/web-interface/popular', {
      params: {
        ps: 20,
        pn: this.page++,
      },
      withCredentials: !this.anonymous,
    })
    const json = res.data as PopularGeneralJson

    this.hasMore = !json.data.no_more
    const items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: 'popular-general',
        uniqId: item.bvid,
      } as PopularGeneralItemExtend
    })

    return items
  }

  get usageInfo() {
    return <PopularGeneralUsageInfo />
  }
}

function PopularGeneralUsageInfo() {
  const { shuffleForPopularGeneral, anonymousForPopularGeneral } = useSettingsSnapshot()

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
        onChange={(val) => {
          updateSettings({ anonymousForPopularGeneral: val })
          onRefresh?.()
        }}
        checkedChildren='匿名访问'
        unCheckedChildren='登录访问'
      />
    </>
  )
}
