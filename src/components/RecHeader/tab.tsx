import { APP_NAME } from '$common'
import { flexVerticalCenterStyle } from '$common/emotion-css'
import { proxyWithLocalStorage } from '$common/hooks/proxyWithLocalStorage'
import { type OnRefresh } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/piece'
import { QUERY_DYNAMIC_UP_MID } from '$modules/recommend/dynamic-feed'
import { useSettingsSnapshot } from '$modules/settings'
import { checkLoginStatus, getHasLogined, useHasLogined } from '$utility'
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

export function useCurrentShowingTabKeys(): ETabType[] {
  const { hidingTabKeys } = useSettingsSnapshot()
  return useMemo(() => TabKeys.filter((key) => !hidingTabKeys.includes(key)), [hidingTabKeys])
}

function sortTabKeys(customTabKeysOrder: ETabType[]) {
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
  return useMemo(() => sortTabKeys(customTabKeysOrder), [customTabKeysOrder])
}

//
export function useCurrentTabConfigList(): ({ key: ETabType } & TabConfigItem)[] {
  const { hidingTabKeys, customTabKeysOrder } = useSettingsSnapshot()
  const logined = useHasLogined()

  return useMemo(() => {
    let tabkeys = sortTabKeys(customTabKeysOrder)
    tabkeys = tabkeys.filter(
      (key) => !hidingTabKeys.includes(key) || (!logined && key === ETabType.RecommendApp),
    )
    return tabkeys.map((k) => ({ key: k, ...TabConfig[k] }))
  }, [hidingTabKeys, customTabKeysOrder, logined])
}

function _getCurrentSourceTab(videoSourceTab: ETabType, logined: boolean): ETabType {
  // invalid
  if (!TabKeys.includes(videoSourceTab)) return ETabType.RecommendApp

  // not logined
  if (!logined) {
    // 不允许游客访问
    if (!TabConfig[videoSourceTab].anonymousUsage) {
      return ETabType.RecommendApp
    }
  }

  return videoSourceTab
}

export function useCurrentSourceTab(): ETabType {
  return _getCurrentSourceTab(useSnapshot(videoSourceTabState).value, useHasLogined())
}

export function getCurrentSourceTab(): ETabType {
  return _getCurrentSourceTab(videoSourceTabState.value, getHasLogined())
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
  const tab = useCurrentSourceTab()
  const { styleUseStandardVideoSourceTab } = useSettingsSnapshot()
  const currentTabConfigList = useCurrentTabConfigList()

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
