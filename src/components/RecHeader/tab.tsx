import { HelpInfo } from '$components/piece'
import { IconName, IconPark } from '$icon-park'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { checkLoginStatus, getHasLogined, useHasLogined } from '$utility'
import { toast } from '$utility/toast'
import { css } from '@emotion/react'
import { Radio } from 'antd'
import { Fragment } from 'react'
import { OnRefresh } from '.'

const iconCss = css`
  margin-right: 4px;
  vertical-align: middle;
  margin-top: -2px;
`

const iconCssInTips = css`
  margin-right: 4px;
  margin-top: -4px;
  vertical-align: middle;
`

export type TabType = 'dynamic' | 'watchlater' | 'recommend-app' | 'recommend-pc' | 'onlyFollow'

type TabConfigItem = {
  key: TabType
  icon: IconName
  iconSize?: number
  label: string
  desc: string
  swr?: boolean // stale while revalidate
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
    iconSize: 16,
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
  },
  {
    key: 'watchlater',
    icon: 'FileCabinet',
    iconSize: 15,
    label: '稍后再看',
    desc: '默认随机乱序, 可在设置-高级设置中关闭乱序',
    swr: true,
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
  return _getCurrentSourceTab(useSettingsSnapshot().videoSourceTab, useHasLogined())
}
export function getCurrentSourceTab(): TabType {
  return _getCurrentSourceTab(settings.videoSourceTab, getHasLogined())
}

function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

const radioBtnCss = css`
  height: 26px;
  line-height: 26px;

  &:has(:focus-visible) {
    outline: none;
    outline-offset: unset;
  }
`

const radioBtnStandardCss = css`
  height: 32px;
  line-height: 32px;
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

          updateSettings({ videoSourceTab: newValue })

          // so that `RecGrid.refresh` can access latest `tab`
          setTimeout(() => {
            // reuse results & keep original order when switch tab
            onRefresh(true, { watchlaterKeepOrder: true })
          })
        }}
      >
        {TabConfig.map(({ key, label, icon, iconSize }) => (
          <Radio.Button
            css={[radioBtnCss, styleUseStandardVideoSourceTab && radioBtnStandardCss]}
            className='video-source-tab' // can be used to customize css
            tabIndex={-1}
            value={key}
            key={key}
          >
            <IconPark name={icon} size={iconSize || 18} css={iconCss} />
            {label}
          </Radio.Button>
        ))}
      </Radio.Group>
      <HelpInfo
        iconProps={{ name: 'Tips', size: 16, style: { marginLeft: 6 } }}
        tooltip={
          <>
            {TabConfig.map(({ key, label, icon, iconSize, desc }) => (
              <Fragment key={key}>
                <IconPark name={icon} size={iconSize || 18} css={iconCssInTips} />
                {label}: {desc}
                <br />
              </Fragment>
            ))}
          </>
        }
      />
    </>
  )
}
