import { APP_NAME } from '$common'
import { flexVerticalCenterStyle } from '$common/emotion-css'
import { proxyWithLocalStorage } from '$common/hooks/proxyWithLocalStorage'
import { type OnRefresh } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/piece'
import { QUERY_DYNAMIC_UP_MID } from '$modules/recommend/dynamic-feed'
import { isWeekendForPopularWeekly } from '$modules/recommend/popular-weekly'
import { useSettingsSnapshot } from '$modules/settings'
import { checkLoginStatus, useHasLogined } from '$utility'
import { Radio } from 'antd'
import {
  ETabType,
  TabConfig,
  TabIcon,
  TabKeys,
  toastNeedLogin,
  type TabConfigItem,
} from './tab.shared'

/**
 * initial tab
 */

const VIDEO_SOURCE_TAB_STORAGE_KEY = `${APP_NAME}-video-source-tab`

export const videoSourceTabState = proxyWithLocalStorage<{ value: ETabType }>(
  { value: ETabType.RecommendApp },
  VIDEO_SOURCE_TAB_STORAGE_KEY,
)

if (QUERY_DYNAMIC_UP_MID && videoSourceTabState.value !== ETabType.DynamicFeed) {
  videoSourceTabState.value = ETabType.DynamicFeed
}

function getSortedTabKeys(customTabKeysOrder: ETabType[]) {
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
      if (key === ETabType.RecommendApp && !logined) {
        return true
      }

      if (key === ETabType.DynamicFeed && QUERY_DYNAMIC_UP_MID) {
        return true
      }

      if (key === ETabType.PopularWeekly && showPopularWeeklyOnlyOnWeekend) {
        return isWeekendForPopularWeekly()
      }

      return !hidingTabKeys.includes(key)
    })
  }, [hidingTabKeys, customTabKeysOrder, showPopularWeeklyOnlyOnWeekend, logined])

  if (QUERY_DYNAMIC_UP_MID && keys.includes(ETabType.DynamicFeed)) {
    return [ETabType.DynamicFeed]
  }

  return keys
}

function useCurrentDisplayingTabConfigList(): ({ key: ETabType } & TabConfigItem)[] {
  const keys = useCurrentDisplayingTabKeys()
  return useMemo(() => keys.map((key) => ({ key, ...TabConfig[key] })), [keys])
}

export function useCurrentUsingTab(): ETabType {
  const tab = useSnapshot(videoSourceTabState).value
  const displayTabKeys = useCurrentDisplayingTabKeys()
  const logined = useHasLogined()
  const fallbackTab = ETabType.RecommendApp

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
        style={{ overflow: 'hidden' }}
        onFocus={(e) => {
          // 不移除 focus, refresh `r` 无法响应
          const target = e.target as HTMLElement
          target.blur()
        }}
        onChange={(e) => {
          const newValue = e.target.value as ETabType

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
        {currentTabConfigList.map(({ key, label, icon, iconProps }) => (
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
              <TabIcon tabKey={key} css={iconCss} />
              {label}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
      <HelpInfo iconProps={{ name: 'Tips', size: 16, style: { marginLeft: 6 } }}>
        <>
          {currentTabConfigList.map(({ key, label, icon, iconProps, desc }) => (
            <div
              key={key}
              css={css`
                display: flex;
                align-items: center;
                height: 22px;
              `}
            >
              <TabIcon tabKey={key} css={iconCss} />
              {label}: {desc}
            </div>
          ))}
        </>
      </HelpInfo>
    </div>
  )
}
