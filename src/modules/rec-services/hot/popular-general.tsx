import { REQUEST_FAIL_MSG } from '$common'
import { SwitchSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { type PopularGeneralItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import type { PopularGeneralJson } from '$define/popular-general'
import { settings } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import { toast } from '$utility'
import { delay } from 'es-toolkit'
import type { IService } from '../_base'

export class PopularGeneralRecService implements IService {
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

    const items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: EApiType.PopularGeneral,
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
  const onRefresh = useOnRefreshContext()
  return (
    <SwitchSettingItem
      configKey={'anonymousForPopularGeneral'}
      checkedChildren='匿名访问: 开'
      unCheckedChildren='匿名访问: 关'
      tooltip={<>✅ 匿名访问: 使用游客身份访问</>}
      extraAction={async () => {
        await delay(100)
        onRefresh?.()
      }}
    />
  )
}
