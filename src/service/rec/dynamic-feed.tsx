import { useRecHeaderContext } from '$components/RecHeader'
import { DynamicFeedItemExtend, DynamicFeedJson } from '$define'
import { request } from '$request'
import { getRecentUpdateUpList } from '$service/dynamic'
import { DynamicPortalUp } from '$service/dynamic/portal'
import { css } from '@emotion/react'
import { useMemoizedFn, useMount } from 'ahooks'
import { Avatar, Badge, Button, Dropdown, MenuProps } from 'antd'
import delay from 'delay'
import ms from 'ms'
import { ReactNode } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { IService } from './base'

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

    const res = await request.get('/x/polymer/web-dynamic/v1/feed/all', { signal, params })
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

export const dynamicFeedFilterStore = proxy<{
  upMid: number | undefined
  upName: string | undefined
  upList: DynamicPortalUp[]
  upListUpdatedAt: number
}>({
  upMid: undefined,
  upName: undefined,
  upList: [],
  upListUpdatedAt: 0,
})

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

export function DynamicFeedUsageInfo() {
  const { onRefresh } = useRecHeaderContext()
  const { upName, upList } = useSnapshot(dynamicFeedFilterStore)

  // try update on mount
  useMount(() => {
    updateUpList()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dynamicFeedFilterStore>) => {
    Object.assign(dynamicFeedFilterStore, payload)

    // 选择了 up, 去除红点
    if (payload.upMid) {
      const item = dynamicFeedFilterStore.upList.find((x) => x.mid === payload.upMid)
      if (item) item.has_update = false
    }

    await delay(100)
    onRefresh()
  })

  const allMenuItem: MenuProps['items'] = [
    {
      key: 'all',
      label: (
        <span>
          <Avatar
            size={'small'}
            css={css`
              margin-right: 10px;
            `}
          >
            全
          </Avatar>
          全部
        </span>
      ),
      onClick() {
        onSelect({ upMid: undefined, upName: undefined })
      },
    },
  ]

  const menuItems: MenuProps['items'] = upList.map((up) => {
    let avatar: ReactNode = null
    if (up.has_update) {
      avatar = (
        <Badge
          dot
          css={css`
            margin-right: 10px;
          `}
        >
          <Avatar size={'small'} src={up.face} />
        </Badge>
      )
    } else {
      avatar = (
        <Avatar
          size={'small'}
          src={up.face}
          css={css`
            margin-right: 10px;
          `}
        />
      )
    }

    return {
      key: up.mid,
      label: (
        <span>
          {avatar}
          {up.uname}
        </span>
      ),
      onClick() {
        onSelect({ upMid: up.mid, upName: up.uname })
      },
    }
  })

  return (
    <div
      css={css`
        margin-left: 15px;
      `}
    >
      <Dropdown
        menu={{
          items: [...allMenuItem, ...menuItems],
          style: { maxHeight: '50vh', overflowY: 'scroll' },
        }}
        placement='bottomLeft'
      >
        <Button>{upName ? `UP: ${upName}` : '全部'}</Button>
      </Dropdown>
    </div>
  )
}
