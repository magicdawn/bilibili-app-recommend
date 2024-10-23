import { antdCustomCss, flexVerticalCenterStyle, iconOnlyRoundButtonCss } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { IconPark } from '$modules/icon/icon-park'
import { useSettingsSnapshot } from '$modules/settings'
import { HelpInfo } from '$ui-components/HelpInfo'
import { AntdTooltip } from '$ui-components/antd-custom'
import { getAvatarSrc } from '$utility/image'
import type { AntdMenuItemType } from '$utility/type'
import { Avatar, Badge, Button, Checkbox, Dropdown, Input, Popover, Radio, Space } from 'antd'
import delay from 'delay'
import { fastSortWithOrders } from 'fast-sort-lens'
import TablerFilter from '~icons/tabler/filter'
import TablerFilterCheck from '~icons/tabler/filter-check'
import { usePopupContainer } from '../_base'
import {
  DynamicFeedVideoType,
  DynamicFeedVideoTypeLabel,
  dfStore,
  updateFilterData,
  type DynamicFeedStore,
} from './store'

export function dynamicFeedFilterSelectUp(payload: Partial<typeof dfStore>) {
  Object.assign(dfStore, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = dfStore.upList.find((x) => x.mid === payload.upMid)
    if (item) item.has_update = false
  }
}

const clearPayload: Partial<DynamicFeedStore> = {
  upMid: undefined,
  upName: undefined,
  searchText: undefined,
  selectedFollowGroup: undefined,
}

const S = {
  filterWrapper: css`
    padding-block: 10px;
  `,

  filterSection: css`
    width: 300px;
    margin-top: 10px;
    &:first-child {
      margin-top: 0;
    }

    .title {
      padding-left: 3px;
      font-size: 20px;
      ${flexVerticalCenterStyle}
    }
    .content {
      /* margin-top: 5px; */
    }
  `,
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
    followGroups,
    selectedFollowGroup,
    dynamicFeedVideoType,
    showFilter,
    searchText,
    selectedKey,
    hideChargeOnlyVideos,
  } = useSnapshot(dfStore)

  const showFilterBadge = useMemo(() => {
    return (
      showFilter &&
      !!(dynamicFeedVideoType !== DynamicFeedVideoType.All || hideChargeOnlyVideos || searchText)
    )
  }, [showFilter, dynamicFeedVideoType, hideChargeOnlyVideos, searchText])

  // try update on mount
  useMount(() => {
    updateFilterData()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dfStore>) => {
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
          key: `group:${group.tagid}`,
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
        key: `up:${up.mid}`,
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

  const filterPopoverContent = (
    <div css={S.filterWrapper}>
      <div className='section' css={S.filterSection}>
        <div className='title'>
          视频类型
          <HelpInfo>
            「{CHARGE_ONLY_TEXT}」在此程序中归类为「投稿视频」
            <br />
          </HelpInfo>
        </div>
        <div className='content'>
          <Radio.Group
            buttonStyle='solid'
            value={dynamicFeedVideoType}
            onChange={async (v) => {
              dfStore.dynamicFeedVideoType = v.target.value
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

      {dynamicFeedVideoType !== DynamicFeedVideoType.DynamicOnly && (
        <div className='section' css={S.filterSection}>
          <div className='title'>充电专属</div>
          <div className='content' css={flexVerticalCenterStyle}>
            <Checkbox
              checked={hideChargeOnlyVideos}
              onChange={async (e) => {
                const val = e.target.checked
                const set = dfStore.hideChargeOnlyVideosForKeysSet
                if (val) {
                  set.add(selectedKey)
                } else {
                  set.delete(selectedKey)
                }
                await delay(100)
                onRefresh?.()
              }}
              css={css`
                margin-left: 5px;
              `}
            >
              <AntdTooltip
                title={
                  <>
                    隐藏「{CHARGE_ONLY_TEXT}」视频
                    <br />
                    程序会针对 UP 或 分组记忆你的选择~
                  </>
                }
              >
                <span style={{ userSelect: 'none' }}>隐藏「{CHARGE_ONLY_TEXT}」</span>
              </AntdTooltip>
            </Checkbox>
          </div>
        </div>
      )}

      <div className='section' css={S.filterSection}>
        <div className='title'>搜索</div>
        <div className='content'>
          <Input.Search
            style={{ width: 280 }}
            placeholder='按标题关键字过滤'
            type='search'
            autoCorrect='off'
            autoCapitalize='off'
            name={`searchText_${upMid}`}
            // 有自带的历史记录, 何乐而不为
            // 悬浮 autocomplete 时 popover 关闭了
            // autoComplete='on'
            autoComplete='off'
            allowClear
            onSearch={async (val) => {
              dfStore.searchText = val || undefined
              await delay(100)
              onRefresh?.()
            }}
          />
        </div>
      </div>
    </div>
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
            content={filterPopoverContent}
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
