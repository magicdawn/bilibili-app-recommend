import { verticalAlignStyle } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { DynamicFeedItemExtend, DynamicFeedJson } from '$define'
import { IconPark } from '$icon-park'
import { request } from '$request'
import { getRecentUpdateUpList } from '$service/dynamic'
import type { DynamicPortalUp } from '$service/dynamic/portal'
import type { ArrayItem } from '$utility/type'
import { css } from '@emotion/react'
import { useMemoizedFn, useMount } from 'ahooks'
import type { MenuProps } from 'antd'
import { Avatar, Badge, Button, Dropdown, Space } from 'antd'
import delay from 'delay'
import ms from 'ms'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { proxy, useSnapshot } from 'valtio'
import type { IService } from './base'

export class DynamicFeedRecService implements IService {
  static PAGE_SIZE = 15

  offset: string = ''
  page = 0
  hasMore = true
  upMid: number | undefined = undefined

  constructor(upMid: number | undefined) {
    this.upMid = upMid
  }

  async loadMore(signal: AbortSignal | undefined = undefined) {
    if (!this.hasMore) {
      return
    }

    this.page++

    const params: Record<string, number | string> = {
      timezone_offset: '-480',
      type: 'video',
      features: 'itemOpusStyle',
      page: this.page,
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

    this.hasMore = json.data.has_more
    this.offset = json.data.offset

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr
      .filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型
      .map((item) => {
        return {
          ...item,
          api: 'dynamic',
          uniqId: item.id_str || crypto.randomUUID(),
        }
      })
    return items
  }

  get usageInfo(): ReactNode {
    return <DynamicFeedUsageInfo />
  }
}

/**
 * view dynamic of <mid> via query
 */
const hash = location.hash
let upMidInitial: number | undefined = undefined
let upNameInitial: string | undefined = undefined
if (hash.includes('?')) {
  const queryInHash = location.hash.slice(location.hash.indexOf('?'))
  const searchParams = new URLSearchParams(queryInHash)
  if (searchParams.get('dyn-mid')) {
    upMidInitial = Number(searchParams.get('dyn-mid'))
    upNameInitial = searchParams.get('dyn-mid') ?? undefined
  }
}

export const dynamicFeedFilterStore = proxy<{
  upMid: number | undefined
  upName: string | undefined
  upList: DynamicPortalUp[]
  upListUpdatedAt: number
}>({
  upMid: upMidInitial,
  upName: upNameInitial,
  upList: [],
  upListUpdatedAt: 0,
})

setTimeout(() => {
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

type MenuItemType = ArrayItem<Exclude<MenuProps['items'], undefined>>

export function dynamicFeedFilterSelectUp(payload: Partial<typeof dynamicFeedFilterStore>) {
  Object.assign(dynamicFeedFilterStore, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = dynamicFeedFilterStore.upList.find((x) => x.mid === payload.upMid)
    if (item) item.has_update = false
  }
}

export function DynamicFeedUsageInfo() {
  const onRefresh = useOnRefreshContext()
  const { upName, upList } = useSnapshot(dynamicFeedFilterStore)

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
    onSelect({ upMid: undefined, upName: undefined })
  })

  const menuItems = useMemo((): MenuItemType[] => {
    const itemAll: MenuItemType = {
      key: 'all',
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    const items: MenuItemType[] = upList.map((up) => {
      let avatar: ReactNode = <Avatar size={'small'} src={up.face} />
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
          onSelect({ upMid: up.mid, upName: up.uname })
        },
      }
    })

    return [itemAll, ...items]
  }, [upList, upList.map((x) => !!x.has_update)])

  return (
    <div
      css={css`
        margin-left: 15px;
      `}
    >
      <Space>
        <Dropdown
          placement='bottomLeft'
          menu={{
            items: menuItems,
            style: { maxHeight: '50vh', overflowY: 'scroll' },
          }}
        >
          <Button>{upName ? `UP: ${upName}` : '全部'}</Button>
        </Dropdown>
        {!!upName && (
          <Button onClick={onClear} css={[verticalAlignStyle]}>
            <IconPark name='Return' size={14} style={{ marginRight: 5 }} />
            <span style={{ display: 'inline-block', marginTop: 3 }}>清除</span>
          </Button>
        )}
      </Space>
    </div>
  )
}
