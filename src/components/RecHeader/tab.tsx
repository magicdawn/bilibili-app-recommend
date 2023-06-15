import { HelpInfo } from '$components/piece'
import { IconPark } from '$icon-park'
import { updateSettings, useSettingsSnapshot } from '$settings'
import { useHasLogined } from '$utility'
import { toast } from '$utility/toast'
import { css } from '@emotion/react'
import { Radio } from 'antd'

const iconCss = css`
  margin-right: 4px;
  vertical-align: top;
  margin-top: 4px;
`

const iconCssInTips = css`
  margin-right: 4px;
  margin-top: -4px;
  vertical-align: middle;
`

export const TabConfig = [
  {
    key: 'recommend-app',
    label: (
      <>
        <IconPark name='Iphone' size={18} css={iconCss} />
        推荐
      </>
    ),
  },
  {
    key: 'recommend-pc',
    label: (
      <>
        <IconPark name='Computer' size={18} css={iconCss} />
        推荐
      </>
    ),
  },
  { key: 'onlyFollow', label: '已关注' },
  { key: 'dynamic', label: '动态' },
  { key: 'watchlater', label: '稍后再看' },
] as const

export const TAB_ALLOW_VALUES = TabConfig.map((x) => x.key)
export type TabType = typeof TAB_ALLOW_VALUES extends ReadonlyArray<infer T> ? T : never

export function useCurrentSourceTab(): TabType {
  const { videoSourceTab } = useSettingsSnapshot()
  const logined = useHasLogined()
  if (!TAB_ALLOW_VALUES.includes(videoSourceTab)) return 'recommend-app' // invalid
  if (!logined) return 'recommend-app' // not logined
  return videoSourceTab
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

export function VideoSourceTab({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const logined = useHasLogined()
  const tab = useCurrentSourceTab()

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
            return toastNeedLogin()
          }
          updateSettings({ videoSourceTab: newValue })

          // so that `RecGrid.refresh` can access latest `tab`
          setTimeout(() => {
            onRefresh()
          })
        }}
      >
        {TabConfig.map(({ key, label }) => (
          <Radio.Button css={radioBtnCss} tabIndex={-1} value={key} key={key}>
            {label}
          </Radio.Button>
        ))}
      </Radio.Group>
      <HelpInfo
        iconProps={{ name: 'Tips', size: 16, style: { marginLeft: 6 } }}
        tooltip={
          <>
            <IconPark name='Iphone' size={18} css={iconCssInTips} />
            推荐: 使用手机 APP 端推荐 API
            <br />
            <IconPark name='Computer' size={18} css={iconCssInTips} />
            推荐: 使用新版首页顶部推荐 API
            <br />
            已关注: 推荐中只保留「已关注」,会很慢
            <br />
            动态: 视频投稿动态
            <br />
            稍后再看: 默认随机乱序, 可在设置-高级设置中关闭乱序
          </>
        }
      />
    </>
  )
}
