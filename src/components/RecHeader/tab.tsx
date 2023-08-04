import { APP_NAME } from '$common'
import { proxyWithLocalStorage } from '$common/hooks/proxyWithLocalStorage'
import { HelpInfo } from '$components/piece'
import { IconName, IconPark } from '$icon-park'
import { useSettingsSnapshot } from '$settings'
import { checkLoginStatus, getHasLogined, useHasLogined } from '$utility'
import { toast } from '$utility/toast'
import { css } from '@emotion/react'
import { Icon } from '@icon-park/react/es/runtime'
import { Radio } from 'antd'
import { ComponentProps } from 'react'
import { useSnapshot } from 'valtio'
import { type OnRefresh } from './index'

export const VIDEO_SOURCE_TAB_STORAGE_KEY = `${APP_NAME}-video-source-tab`

export const videoSourceTabState = proxyWithLocalStorage<{ value: TabType }>(
  { value: 'recommend-app' },
  VIDEO_SOURCE_TAB_STORAGE_KEY
)

const iconCss = css`
  margin-right: 4px;
`

export type TabType =
  | 'recommend-app'
  | 'recommend-pc'
  | 'onlyFollow'
  | 'dynamic'
  | 'watchlater'
  | 'fav'

type TabConfigItem = {
  key: TabType
  icon: IconName
  iconProps?: ComponentProps<Icon>
  label: string
  desc: string
  swr?: boolean // stale while revalidate
  reuseable?: boolean // can reuse
}

export const TabConfig: TabConfigItem[] = [
  {
    key: 'recommend-app',
    icon: 'Iphone',
    label: '推荐',
    desc: '使用手机 APP 端推荐 API',
  },
  {
    key: 'recommend-pc',
    icon: 'Computer',
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
  },
  {
    key: 'onlyFollow',
    icon: 'Concern',
    label: '已关注',
    desc: '推荐中只保留「已关注」,会很慢',
  },
  {
    key: 'dynamic',
    icon: 'Tumblr',
    iconProps: { size: 16 },
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
  },
  {
    key: 'watchlater',
    icon: 'FileCabinet',
    iconProps: { size: 15 },
    label: '稍后再看',
    desc: '你添加的稍后再看; 默认随机乱序, 可在设置-高级设置 或 稍后再看 Tab 中关闭乱序',
    swr: true,
  },
  {
    key: 'fav',
    icon: 'Star',
    iconProps: { size: 15 },
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置-高级设置 或 收藏 Tab 中关闭乱序',
    reuseable: false,
  },
]

export const TabConfigMap = TabConfig.reduce((val, configItem) => {
  return { ...val, [configItem.key]: configItem }
}, {}) as Record<TabType, TabConfigItem>

export const TAB_ALLOW_VALUES = TabConfig.map((x) => x.key)

function _getCurrentSourceTab(videoSourceTab: TabType, logined: boolean): TabType {
  // invalid
  if (!TAB_ALLOW_VALUES.includes(videoSourceTab)) return 'recommend-app'

  // not logined
  if (!logined) {
    if (videoSourceTab === 'recommend-app' || videoSourceTab === 'recommend-pc') {
      return videoSourceTab
    } else {
      return 'recommend-app'
    }
  }

  return videoSourceTab
}

export function useCurrentSourceTab(): TabType {
  return _getCurrentSourceTab(useSnapshot(videoSourceTabState).value, useHasLogined())
}
export function getCurrentSourceTab(): TabType {
  return _getCurrentSourceTab(videoSourceTabState.value, getHasLogined())
}

function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

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

  return (
    <>
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
          const newValue = e.target.value as TabType

          if (newValue !== 'recommend-app' && newValue !== 'recommend-pc' && !logined) {
            if (!checkLoginStatus()) {
              return toastNeedLogin()
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
        {TabConfig.map(({ key, label, icon, iconProps }) => (
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
              <IconPark name={icon} {...iconProps} size={iconProps?.size || 18} css={iconCss} />
              {label}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
      <HelpInfo
        iconProps={{ name: 'Tips', size: 16, style: { marginLeft: 6 } }}
        tooltip={
          <>
            {TabConfig.map(({ key, label, icon, iconProps, desc }) => (
              <div
                key={key}
                css={css`
                  display: flex;
                  align-items: center;
                  height: 22px;
                `}
              >
                <IconPark name={icon} {...iconProps} size={iconProps?.size || 18} css={iconCss} />
                {label}: {desc}
              </div>
            ))}
          </>
        }
      />
    </>
  )
}
