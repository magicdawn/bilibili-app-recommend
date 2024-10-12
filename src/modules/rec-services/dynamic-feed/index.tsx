import { IN_BILIBILI_HOMEPAGE, REQUEST_FAIL_MSG } from '$common'
import { antdCustomCss } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CHARGE_ONLY_TEXT, getHasChargeOnlyTag } from '$components/VideoCard/top-marks'
import { type DynamicFeedItemExtend, type DynamicFeedJson } from '$define'
import { EApiType } from '$define/index.shared'
import { IconPark } from '$modules/icon/icon-park'
import type { DynamicPortalUp } from '$modules/rec-services/dynamic-feed/portal'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import { setPageTitle, toast, whenIdle } from '$utility'
import { getAvatarSrc } from '$utility/image'
import type { AntdMenuItemType } from '$utility/type'
import { proxySetWithGmStorage } from '$utility/valtio'
import { Avatar, Badge, Button, Dropdown, Input, Space } from 'antd'
import delay from 'delay'
import { fastSortWithOrders } from 'fast-sort-lens'
import ms from 'ms'
import { subscribeKey } from 'valtio/utils'
import type { IService } from '../_base'
import { usePopupContainer } from '../_base'
import { getAllFollowGroups, getFollowGroupContent } from './group'
import type { FollowGroup } from './group/groups'
import { getRecentUpdateUpList } from './portal-api'

export class DynamicFeedRecService implements IService {
  static PAGE_SIZE = 15

  offset: string = ''
  page = 0 // pages loaded
  hasMore = true

  upMid: UpMidType | undefined
  searchText: string | undefined
  followGroupTagid: number | undefined

  constructor(upMid?: number, searchText?: string, followGroupTagid?: number) {
    this.upMid = upMid
    this.searchText = searchText
    this.followGroupTagid = followGroupTagid
  }

  private followGroupMids = new Set<number>()
  async loadFollowGroupMids() {
    if (!this.followGroupTagid) return
    if (this.followGroupMids.size) return
    const mids = await getFollowGroupContent(this.followGroupTagid!)
    this.followGroupMids = new Set(mids)
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

    // ensure mids loaded
    await this.loadFollowGroupMids()

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr
      .filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型
      .filter((x) => {
        if (!this.searchText) return true
        const title = x?.modules?.module_dynamic?.major?.archive?.title || ''
        return title.includes(this.searchText)
      })
      .filter((x) => {
        if (!this.followGroupTagid) return true
        if (!this.followGroupMids.size) return true
        const mid = x?.modules?.module_author?.mid
        return mid && this.followGroupMids.has(mid)
      })
      .map((item) => {
        return {
          ...item,
          api: EApiType.Dynamic,
          uniqId: item.id_str || crypto.randomUUID(),
        }
      })

    /**
     * side effects
     */

    // fill up-name when filter up via query
    const { upMid, upName } = store
    if (
      //
      QUERY_DYNAMIC_UP_MID &&
      upMid &&
      upName &&
      upName === upMid.toString() &&
      items[0]
    ) {
      const authorName = items[0].modules.module_author.name
      store.upName = authorName
    }

    // mark up(mid) has charge-only video
    if (
      store.hasSelectedUp &&
      this.upMid &&
      !store.hasChargeOnlyVideoUpSet.has(this.upMid) &&
      items.some((x) => getHasChargeOnlyTag(x))
    ) {
      store.hasChargeOnlyVideoUpSet.add(this.upMid)
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

type UpMidType = number

export const dynamicFeedFilterStore = proxy({
  searchText: undefined as string | undefined,

  upMid: upMidInitial as UpMidType | undefined,
  upName: upNameInitial as string | undefined,
  upList: [] as DynamicPortalUp[],
  upListUpdatedAt: 0,

  selectedFollowGroup: undefined as FollowGroup | undefined,
  followGroups: [] as FollowGroup[],
  followGroupsUpdatedAt: 0,

  get hasSelectedUp(): boolean {
    return !!(this.upName && this.upMid)
  },
  hasChargeOnlyVideoUpSet: await proxySetWithGmStorage<UpMidType>(
    'dynamic-feed:has-charge-only-video-mids',
  ),
})

const store = dynamicFeedFilterStore

if (QUERY_DYNAMIC_UP_MID) {
  subscribeKey(store, 'upName', (upName) => {
    const title = upName ? `「${upName}」的动态` : '动态'
    setPageTitle(title)
  })
}

setTimeout(async () => {
  if (!IN_BILIBILI_HOMEPAGE) return
  if (!store.upList.length) {
    await whenIdle()
    updateFilterData()
  }
}, ms('5s'))

async function updateFilterData() {
  return Promise.all([updateUpList(), updateFollowGroups()])
}

async function updateUpList(force = false) {
  const cacheHit =
    !force &&
    store.upList.length &&
    store.upListUpdatedAt &&
    store.upListUpdatedAt - Date.now() < ms('5min')
  if (cacheHit) return

  const list = await getRecentUpdateUpList()
  store.upList = list
  store.upListUpdatedAt = Date.now()
}

async function updateFollowGroups(force = false) {
  if (!settings.enableFollowGroupFilterForDynamicFeed) return

  const cacheHit =
    !force &&
    store.followGroups.length &&
    store.followGroupsUpdatedAt &&
    store.followGroupsUpdatedAt - Date.now() < ms('1h')
  if (cacheHit) return

  const groups = await getAllFollowGroups()
  store.followGroups = groups.filter((x) => !!x.count)
  store.followGroupsUpdatedAt = Date.now()
}

export function dynamicFeedFilterSelectUp(payload: Partial<typeof store>) {
  Object.assign(store, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = store.upList.find((x) => x.mid === payload.upMid)
    if (item) item.has_update = false
  }
}

const clearPayload: Partial<typeof store> = {
  upMid: undefined,
  upName: undefined,
  searchText: undefined,
  selectedFollowGroup: undefined,
}

export function DynamicFeedUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefreshContext()
  const { enableFollowGroupFilterForDynamicFeed } = useSettingsSnapshot()

  const {
    hasSelectedUp,
    upName,
    upMid,
    upList,
    hasChargeOnlyVideoUpSet,
    followGroups,
    selectedFollowGroup,
  } = useSnapshot(store)
  const hasChargeOnlyVideo = useMemo(
    () => !!upMid && !!hasChargeOnlyVideoUpSet.has(upMid),
    [hasChargeOnlyVideoUpSet, upMid],
  )

  // try update on mount
  useMount(() => {
    updateFilterData()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof store>) => {
    dynamicFeedFilterSelectUp(payload)
    await delay(100)
    onRefresh?.()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ ...clearPayload })
  })

  const menuItems = useMemo((): AntdMenuItemType[] => {
    const itemAll: AntdMenuItemType = {
      key: 'all',
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    let groupItems: AntdMenuItemType[] = []
    if (enableFollowGroupFilterForDynamicFeed) {
      groupItems = followGroups.map((group) => {
        return {
          key: group.tagid,
          label: group.name,
          icon: <Avatar size={'small'}>组</Avatar>,
          onClick() {
            onSelect({ ...clearPayload, selectedFollowGroup: structuredClone({ ...group }) })
          },
        }
      })
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
          onSelect({ ...clearPayload, upMid: up.mid, upName: up.uname })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, upList.map((x) => !!x.has_update), enableFollowGroupFilterForDynamicFeed])

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
          <Button css={[antdCustomCss.button]}>
            {upName
              ? `UP: ${upName}`
              : selectedFollowGroup
                ? `分组 - ${selectedFollowGroup.name}`
                : '全部'}
          </Button>
        </Dropdown>

        {(hasSelectedUp || selectedFollowGroup) && (
          <Button onClick={onClear} css={[antdCustomCss.button]} className='gap-0'>
            <IconPark name='Return' size={14} style={{ marginRight: 5 }} />
            <span>清除</span>
          </Button>
        )}

        {hasSelectedUp && hasChargeOnlyVideo && (
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
              store.searchText = val || undefined
              await delay(100)
              onRefresh?.()
            }}
          />
        )}
      </Space>
    </>
  )
}
