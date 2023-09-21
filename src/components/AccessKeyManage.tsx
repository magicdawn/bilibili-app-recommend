import { useSettingsSnapshot } from '$settings'
import {
  GET_ACCESS_KEY_VIA_302,
  GET_ACCESS_KEY_VIA_POPUP_WINDOW,
  auth,
  deleteAccessToken,
} from '$utility/auth'
import { useRequest } from 'ahooks'
import { Button, Space } from 'antd'
import { CSSProperties, ReactNode } from 'react'
import { AntdTooltip } from './AntdApp'

const btnAccessKeyHelpLink = (
  <Button
    target='_blank'
    href='https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
  >
    access_key 说明
  </Button>
)

export function AccessKeyManage({
  style,
  className,
}: {
  style?: CSSProperties
  className?: string
}) {
  const { runAsync, loading } = useRequest(auth, { manual: true })
  const { accessKey } = useSettingsSnapshot()
  const onDeleteAccessToken = deleteAccessToken

  const waitWindowTip = '请允许弹出窗口并等待窗口自动关闭'
  const wrapTooltip = (child: ReactNode) => {
    const usingPopupWindow = !GET_ACCESS_KEY_VIA_302 && GET_ACCESS_KEY_VIA_POPUP_WINDOW
    return usingPopupWindow ? <AntdTooltip title={waitWindowTip}>{child}</AntdTooltip> : child
  }

  return (
    <Space size='small' style={style} className={className}>
      {!accessKey ? (
        <>
          {wrapTooltip(
            <Button onClick={runAsync} disabled={loading} size='middle'>
              <span>获取 access_key</span>
            </Button>
          )}
          {btnAccessKeyHelpLink}
        </>
      ) : (
        <>
          {wrapTooltip(
            <Button onClick={runAsync} disabled={loading}>
              <span>重新获取 access_key</span>
            </Button>
          )}
          <Button onClick={onDeleteAccessToken}>
            <span>删除 access_key</span>
          </Button>
          {btnAccessKeyHelpLink}
        </>
      )}
    </Space>
  )
}
