import { IN_BILIBILI_HOMEPAGE, REQUEST_FAIL_MSG } from '$common'
import { antdCss } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { CheckboxSettingItem } from '$components/piece'
import { type DynamicFeedItemExtend, type DynamicFeedJson } from '$define'
import { EApiType } from '$define/index.shared'
import { IconPark } from '$icon-park'
import { getRecentUpdateUpList } from '$modules/dynamic'
import type { DynamicPortalUp } from '$modules/dynamic/portal'
import { isWebApiSuccess, request } from '$request'
import { toast } from '$utility'
import { getAvatarSrc } from '$utility/image'
import { fastSortWithOrders } from '$utility/order-by'
import type { AntdMenuItemType } from '$utility/type'
import { Avatar, Badge, Button, Dropdown, Input, Space } from 'antd'
import delay from 'delay'
import ms from 'ms'
import { usePopupContainer } from './_shared'
import type { IService } from './base'

export class DynamicFeedRecService implements IService {
  static PAGE_SIZE = 15

  offset: string = ''
  page = 0 // pages loaded
  hasMore = true
  upMid: number | undefined
  searchText: string | undefined

  constructor(upMid?: number, searchText?: string) {
    this.upMid = upMid
    this.searchText = searchText
  }

  async loadMore(signal: AbortSignal | undefined = undefined) {
    if (!this.hasMore) {
      return
    }

    const params: Record<string, number | string> = {
      timezone_offset: '-480',
      type: 'video',
      features: 'itemOpusStyle',
      page: this.page + 1, // ++this.page, starts from 1
    }
    if (this.offset) {
      params.offset = this.offset
    }
    if (this.upMid) {
      params.host_mid = this.upMid
    }

    const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', {
      signal,
      params,
    })
    const json = res.data as DynamicFeedJson
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)

      // prevent infinite call
      if (json.message === '账号未登录') {
        this.hasMore = false
      }

      return
    }

    this.page++
    this.hasMore = json.data.has_more
    this.offset = json.data.offset

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr
      .filter((it) => it.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型
      .filter((it) => {
        if (!this.searchText) return true
        const title = it?.modules?.module_dynamic?.major?.archive?.title || ''
        return title.includes(this.searchText)
      })
      .map((item) => {
        return {
          ...item,
          api: EApiType.Dynamic,
          uniqId: item.id_str || crypto.randomUUID(),
        }
      })

    // side effects
    const { upMid, upName } = dynamicFeedFilterStore
    if (upMid && upName && upName === upMid.toString() && items[0]) {
      const authorName = items[0].modules.module_author.name
      dynamicFeedFilterStore.upName = authorName
    }

    return items
  }

  get usageInfo(): ReactNode {
    return <DynamicFeedUsageInfo />
  }
}

/**
 * view dynamic of <mid> via query
 */

const searchParams = new URLSearchParams(location.search)
export const QUERY_DYNAMIC_UP_MID = !!searchParams.get('dyn-mid')

let upMidInitial: number | undefined = undefined
let upNameInitial: string | undefined = undefined
if (QUERY_DYNAMIC_UP_MID) {
  upMidInitial = Number(searchParams.get('dyn-mid'))
  upNameInitial = searchParams.get('dyn-name') ?? upMidInitial.toString() ?? undefined
}

export const dynamicFeedFilterStore = proxy({
  upMid: upMidInitial as number | undefined,
  upName: upNameInitial as string | undefined,
  searchText: undefined as string | undefined,
  upList: [] as DynamicPortalUp[],
  upListUpdatedAt: 0,
  get hasSelectedUp(): boolean {
    return !!(this.upName && this.upMid)
  },
})

setTimeout(() => {
  if (!IN_BILIBILI_HOMEPAGE) return

  if (!dynamicFeedFilterStore.upList.length) {
    requestIdleCallback(() => {
      updateUpList()
    })
  }
}, ms('5s'))

async function updateUpList(force = false) {
  const cacheHit =
    !force &&
    dynamicFeedFilterStore.upList.length &&
    dynamicFeedFilterStore.upListUpdatedAt &&
    dynamicFeedFilterStore.upListUpdatedAt - Date.now() < ms('5min')
  if (cacheHit) return

  const list = await getRecentUpdateUpList()
  dynamicFeedFilterStore.upList = list
  dynamicFeedFilterStore.upListUpdatedAt = Date.now()
}

export function dynamicFeedFilterSelectUp(payload: Partial<typeof dynamicFeedFilterStore>) {
  Object.assign(dynamicFeedFilterStore, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = dynamicFeedFilterStore.upList.find((x) => x.mid === payload.upMid)
    if (item) item.has_update = false
  }
}

export function DynamicFeedUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()

  const onRefresh = useOnRefreshContext()
  const { hasSelectedUp, upName, upMid, upList } = useSnapshot(dynamicFeedFilterStore)

  // try update on mount
  useMount(() => {
    updateUpList()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dynamicFeedFilterStore>) => {
    dynamicFeedFilterSelectUp(payload)
    await delay(100)
    onRefresh?.()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ upMid: undefined, upName: undefined, searchText: undefined })
  })

  const menuItems = useMemo((): AntdMenuItemType[] => {
    const itemAll: AntdMenuItemType = {
      key: 'all',
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    function mapName(name: string) {
      return (
        name
          .toLowerCase()
          // 让字母在前面
          .replace(/^([a-z])/, '999999$1')
      )
    }

    // lodash.orderBy order参数只支持 asc | desc
    // see https://github.com/lodash/lodash/pull/3764

    const _s = performance.now()
    const upListSorted = fastSortWithOrders(upList, [
      { prop: (it) => (it.has_update ? 1 : 0), order: 'desc' },
      {
        prop: 'uname',
        order: (a: string, b: string) => {
          ;[a, b] = [a, b].map(mapName)
          return a.localeCompare(b, 'zh-CN')
        },
      },
    ])

    // if (upList.length) {
    // const _cost = performance.now() - _s
    // console.log('sorted cost %s ms', _cost.toFixed(2))
    // }

    const items: AntdMenuItemType[] = upListSorted.map((up) => {
      let avatar: ReactNode = <Avatar size={'small'} src={getAvatarSrc(up.face)} />
      if (up.has_update) {
        avatar = <Badge dot>{avatar}</Badge>
      }

      return {
        key: up.mid,
        icon: avatar,
        // label: up.uname,
        label: (
          <span
            title={up.uname}
            css={css`
              display: block;
              max-width: 130px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            `}
          >
            {up.uname}
          </span>
        ),
        onClick() {
          onSelect({ upMid: up.mid, upName: up.uname, searchText: undefined })
        },
      }
    })

    return [itemAll, ...items]
  }, [upList, upList.map((x) => !!x.has_update)])

  const flexBreak = (
    <div
      css={css`
        flex-basis: 100%;
        height: 0;
      `}
    />
  )

  return (
    <>
      <Space ref={ref}>
        <Dropdown
          placement='bottomLeft'
          getPopupContainer={getPopupContainer}
          menu={{
            items: menuItems,
            style: { maxHeight: '60vh', overflowY: 'scroll' },
          }}
        >
          <Button>{upName ? `UP: ${upName}` : '全部'}</Button>
        </Dropdown>

        {hasSelectedUp && (
          <Button onClick={onClear} css={[antdCss.btn]}>
            <IconPark name='Return' size={14} style={{ marginRight: 5 }} />
            <span>清除</span>
          </Button>
        )}

        {hasSelectedUp && (
          <CheckboxSettingItem
            css={css`
              margin-left: 5px;
            `}
            configKey={'hideChargeOnlyDynamicFeedVideos'}
            label={`隐藏「${CHARGE_ONLY_TEXT}」`}
            extraAction={() => onRefresh?.()}
            tooltip={`隐藏「${CHARGE_ONLY_TEXT}」视频`}
          />
        )}

        {hasSelectedUp && (
          <Input.Search
            style={{ width: 160 }}
            placeholder='按标题过滤'
            type='search'
            autoCorrect='off'
            autoCapitalize='off'
            name={`searchText_${upMid}`}
            // 有自带的历史记录, 何乐而不为
            // autoComplete='off'
            autoComplete='on'
            allowClear
            onSearch={async (val) => {
              dynamicFeedFilterStore.searchText = val || undefined
              await delay(100)
              onRefresh?.()
            }}
          />
        )}
      </Space>
    </>
  )
}
