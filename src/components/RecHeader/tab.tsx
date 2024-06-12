import { flexVerticalCenterStyle } from '$common/emotion-css'
import { type OnRefresh } from '$components/RecGrid/useRefresh'
import { QUERY_DYNAMIC_UP_MID } from '$modules/rec-services/dynamic-feed'
import { useSettingsSnapshot } from '$modules/settings'
import { HelpInfo } from '$ui-components/HelpInfo'
import { checkLoginStatus, useHasLogined } from '$utility'
import { proxyWithGmStorage } from '$utility/valtio'
import { Radio } from 'antd'
import type { TabConfigItem } from './tab-config'
import { TabConfig, TabIcon, toastNeedLogin } from './tab-config'
import { ETab, TabKeys } from './tab-enum'

/**
 * initial tab
 */

export const videoSourceTabState = await proxyWithGmStorage<{ value: ETab }>(
  { value: ETab.RecommendApp },
  `video-source-tab`,
)

if (QUERY_DYNAMIC_UP_MID && videoSourceTabState.value !== ETab.DynamicFeed) {
  videoSourceTabState.value = ETab.DynamicFeed
}

function getSortedTabKeys(customTabKeysOrder: ETab[]) {
  return TabKeys.slice().sort((a, b) => {
    let aIndex = customTabKeysOrder.indexOf(a)
    let bIndex = customTabKeysOrder.indexOf(b)
    if (aIndex === -1) aIndex = TabKeys.indexOf(a)
    if (bIndex === -1) bIndex = TabKeys.indexOf(b)
    return aIndex - bIndex
  })
}

export function useSortedTabKeys() {
  const { customTabKeysOrder } = useSettingsSnapshot()
  return useMemo(() => getSortedTabKeys(customTabKeysOrder), [customTabKeysOrder])
}

function useCurrentDisplayingTabKeys() {
  const { hidingTabKeys, customTabKeysOrder, showPopularWeeklyOnlyOnWeekend } =
    useSettingsSnapshot()
  const logined = useHasLogined()
  const keys = useMemo(() => {
    const tabkeys = getSortedTabKeys(customTabKeysOrder)
    return tabkeys.filter((key) => {
      if (key === ETab.RecommendApp && !logined) {
        return true
      }

      if (key === ETab.DynamicFeed && QUERY_DYNAMIC_UP_MID) {
        return true
      }

      // if (key === ETabType.PopularWeekly && showPopularWeeklyOnlyOnWeekend) {
      //   return isWeekendForPopularWeekly()
      // }

      return !hidingTabKeys.includes(key)
    })
  }, [hidingTabKeys, customTabKeysOrder, showPopularWeeklyOnlyOnWeekend, logined])

  if (QUERY_DYNAMIC_UP_MID && keys.includes(ETab.DynamicFeed)) {
    return [ETab.DynamicFeed]
  }

  return keys
}

function useCurrentDisplayingTabConfigList(): ({ key: ETab } & TabConfigItem)[] {
  const keys = useCurrentDisplayingTabKeys()
  return useMemo(() => keys.map((key) => ({ key, ...TabConfig[key] })), [keys])
}

export function useCurrentUsingTab(): ETab {
  const tab = useSnapshot(videoSourceTabState).value
  const displayTabKeys = useCurrentDisplayingTabKeys()
  const logined = useHasLogined()
  const fallbackTab = ETab.RecommendApp

  // invalid
  if (!displayTabKeys.includes(tab)) return fallbackTab

  // not logined
  if (!logined) {
    // 不允许游客访问
    if (!TabConfig[tab].anonymousUsage) {
      return fallbackTab
    }
  }

  return tab
}

const iconCss = css`
  margin-right: 4px;
  margin-top: -1px;
`

const radioBtnCss = css`
  height: 26px;
  line-height: unset;

  &:has(:focus-visible) {
    outline: none;
    outline-offset: unset;
  }

  > .ant-radio-button + span {
    height: 100%;
  }
`

const radioBtnStandardCss = css`
  height: 32px;
`

export function VideoSourceTab({ onRefresh }: { onRefresh: OnRefresh }) {
  const logined = useHasLogined()
  const tab = useCurrentUsingTab()
  const { styleUseStandardVideoSourceTab } = useSettingsSnapshot()
  const currentTabConfigList = useCurrentDisplayingTabConfigList()

  return (
    <div css={flexVerticalCenterStyle}>
      <Radio.Group
        optionType='button'
        buttonStyle='solid'
        size='middle'
        value={tab}
        css={css`
          display: inline-flex;
          align-items: center;
          overflow: hidden;
        `}
        onFocus={(e) => {
          // 不移除 focus, refresh `r` 无法响应
          const target = e.target as HTMLElement
          target.blur()
        }}
        onChange={(e) => {
          const newValue = e.target.value as ETab

          if (!logined) {
            if (!TabConfig[newValue].anonymousUsage) {
              if (!checkLoginStatus()) {
                return toastNeedLogin()
              }
            }
          }

          videoSourceTabState.value = newValue

          // so that `RecGrid.refresh` can access latest `tab`
          setTimeout(() => {
            // reuse results & keep original order when switch tab
            onRefresh(true, { watchlaterKeepOrder: true })
          })
        }}
      >
        {currentTabConfigList.map(({ key, label }) => (
          <Radio.Button
            css={[radioBtnCss, styleUseStandardVideoSourceTab && radioBtnStandardCss]}
            className='video-source-tab' // can be used to customize css
            tabIndex={-1}
            value={key}
            key={key}
          >
            <span
              css={css`
                display: flex;
                align-items: center;
                line-height: unset;
                height: 100%;
              `}
            >
              <TabIcon tabKey={key} moreCss={iconCss} active={key === tab} />
              {label}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
      <HelpInfo iconProps={{ name: 'Tips', size: 16, style: { marginLeft: 6 } }}>
        <>
          {currentTabConfigList.map(({ key, label, desc }) => (
            <div
              key={key}
              css={css`
                display: flex;
                align-items: center;
                height: 22px;
              `}
            >
              <TabIcon tabKey={key} moreCss={iconCss} active />
              {label}: {desc}
            </div>
          ))}
        </>
      </HelpInfo>
    </div>
  )
}
