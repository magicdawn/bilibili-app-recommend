import { IN_BILIBILI_HOMEPAGE, REQUEST_FAIL_MSG } from '$common'
import { antdCustomCss, iconOnlyRoundButtonCss } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CHARGE_ONLY_TEXT, isChargeOnlyVideo } from '$components/VideoCard/top-marks'
import { type DynamicFeedItemExtend, type DynamicFeedJson } from '$define'
import { EApiType } from '$define/index.shared'
import { IconPark } from '$modules/icon/icon-park'
import type { DynamicPortalUp } from '$modules/rec-services/dynamic-feed/portal'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import { getUid, setPageTitle, toast, whenIdle } from '$utility'
import { getAvatarSrc } from '$utility/image'
import type { AntdMenuItemType } from '$utility/type'
import { proxySetWithGmStorage } from '$utility/valtio'
import { Avatar, Badge, Button, Dropdown, Input, Popover, Radio, Space } from 'antd'
import delay from 'delay'
import { fastSortWithOrders } from 'fast-sort-lens'
import ms from 'ms'
import { subscribeKey } from 'valtio/utils'
import TablerFilter from '~icons/tabler/filter'
import TablerFilterCheck from '~icons/tabler/filter-check'
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
  followGroupTagid: number | undefined // 默认分组是 0

  constructor(upMid?: number, searchText?: string, followGroupTagid?: number) {
    this.upMid = upMid
    this.searchText = searchText
    this.followGroupTagid = followGroupTagid
  }

  private followGroupMids = new Set<number>()
  async loadFollowGroupMids() {
    if (typeof this.followGroupTagid !== 'number') return
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

    // ensure current follow-group's mids loaded
    await this.loadFollowGroupMids()

    const arr = json.data.items
    const items: DynamicFeedItemExtend[] = arr
      .filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型

      // by 关注分组
      .filter((x) => {
        if (typeof this.followGroupTagid !== 'number') return true
        if (!this.followGroupMids.size) return true
        const mid = x?.modules?.module_author?.mid
        return mid && this.followGroupMids.has(mid)
      })

      // by 动态视频|投稿视频
      .filter((x) => {
        // only when the filter UI visible
        if (!store.showFilter) return true
        // all
        if (store.dynamicFeedVideoType === DynamicFeedVideoType.All) return true
        // type only
        const currentLabel = x.modules.module_dynamic.major.archive.badge.text
        if (store.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly) {
          return currentLabel === '动态视频'
        }
        if (store.dynamicFeedVideoType === DynamicFeedVideoType.UploadOnly) {
          return currentLabel === '投稿视频'
        }
        return false
      })

      // by 充电专属
      .filter((x) => {
        // only when the filter UI visible
        if (!store.showFilter) return true
        if (!settings.hideChargeOnlyDynamicFeedVideos) return true
        const chargeOnly =
          (x.modules?.module_dynamic?.major?.archive?.badge?.text as string) === CHARGE_ONLY_TEXT
        return !chargeOnly
      })

      // by 关键字搜索
      .filter((x) => {
        // only when the filter UI visible
        if (!store.showFilter) return true
        if (!this.searchText) return true
        const title = x?.modules?.module_dynamic?.major?.archive?.title || ''
        return title.includes(this.searchText)
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
      items.some((x) => isChargeOnlyVideo(x))
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

export enum DynamicFeedVideoType {
  All = 'all',
  UploadOnly = 'upload-only',
  DynamicOnly = 'dynamic-only',
}

const DynamicFeedVideoTypeLabel: Record<DynamicFeedVideoType, string> = {
  [DynamicFeedVideoType.All]: '全部',
  [DynamicFeedVideoType.UploadOnly]: '仅投稿视频',
  [DynamicFeedVideoType.DynamicOnly]: '仅动态视频',
}

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

  dynamicFeedVideoType: DynamicFeedVideoType.All,

  // 展示 filter
  get showFilter() {
    return this.hasSelectedUp || !!this.selectedFollowGroup
  },
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
  // not logined
  if (!getUid()) return
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

  const { enableFollowGroupFilterForDynamicFeed, hideChargeOnlyDynamicFeedVideos } =
    useSettingsSnapshot()
  const {
    hasSelectedUp,
    upName,
    upMid,
    upList,
    hasChargeOnlyVideoUpSet,
    followGroups,
    selectedFollowGroup,
    dynamicFeedVideoType,
    showFilter,
    searchText,
  } = useSnapshot(store)
  const hasChargeOnlyVideo = useMemo(
    () => !!upMid && !!hasChargeOnlyVideoUpSet.has(upMid),
    [hasChargeOnlyVideoUpSet, upMid],
  )

  const showFilterBadge = useMemo(() => {
    return (
      showFilter &&
      !!(
        dynamicFeedVideoType !== DynamicFeedVideoType.All ||
        hideChargeOnlyDynamicFeedVideos ||
        (hasSelectedUp && searchText)
      )
    )
  }, [showFilter, dynamicFeedVideoType, hideChargeOnlyDynamicFeedVideos, hasSelectedUp, searchText])

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

        {showFilter && (
          <Popover
            arrow={false}
            placement='bottomLeft'
            getPopupContainer={getPopupContainer}
            content={
              <>
                <div className='section' css={S.filterSection}>
                  <div className='title'>视频类型</div>
                  <div className='content'>
                    <Radio.Group
                      buttonStyle='solid'
                      value={dynamicFeedVideoType}
                      onChange={async (v) => {
                        store.dynamicFeedVideoType = v.target.value
                        await delay(100)
                        onRefresh?.()
                      }}
                    >
                      {Object.values(DynamicFeedVideoType).map((v) => {
                        return (
                          <Radio.Button key={v} value={v}>
                            {DynamicFeedVideoTypeLabel[v]}
                          </Radio.Button>
                        )
                      })}
                    </Radio.Group>
                  </div>
                </div>

                <div className='section' css={S.filterSection}>
                  <div className='title'>充电专属</div>
                  <div className='content'>
                    <CheckboxSettingItem
                      css={css`
                        margin-left: 5px;
                      `}
                      configKey={'hideChargeOnlyDynamicFeedVideos'}
                      label={`隐藏「${CHARGE_ONLY_TEXT}」`}
                      extraAction={() => onRefresh?.()}
                      tooltip={`隐藏「${CHARGE_ONLY_TEXT}」视频`}
                    />
                  </div>
                </div>

                {hasSelectedUp && (
                  <div className='section' css={S.filterSection}>
                    <div className='title'>搜索</div>
                    <div className='content'>
                      <Input.Search
                        style={{ width: 280 }}
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
                    </div>
                  </div>
                )}
              </>
            }
          >
            <Badge dot={showFilterBadge} color={colorPrimaryValue} offset={[-5, 5]}>
              <Button css={iconOnlyRoundButtonCss}>
                {showFilterBadge ? <TablerFilterCheck /> : <TablerFilter />}
              </Button>
            </Badge>
          </Popover>
        )}
      </Space>
    </>
  )
}

const S = {
  filterSection: css`
    width: 300px;
    margin-top: 10px;
    &:first-child {
      margin-top: 0;
    }

    .title {
      padding: 5px 0;
      padding-left: 6px;
      font-size: 20px;
    }
    .content {
      /* margin-top: 5px; */
    }
  `,
}
