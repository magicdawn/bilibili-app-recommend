import { message } from '$utility'
import { css } from '@emotion/react'
import { FlagSettingItem } from './piece'

export const ModalFeedConfigChecks = function () {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <FlagSettingItem
        configKey={'initialShowMore'}
        label='自动查看更多'
        tooltip='打开首页时默认打开推荐弹窗'
        css={inModalFeedStyle}
        extraAction={(val) => {
          if (val) {
            message.success('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
          }
        }}
      />

      <FlagSettingItem
        configKey='modalFeedFullScreen'
        label='全屏'
        tooltip='世界清净了~'
        css={inModalFeedStyle}
      />
    </>
  )
}
