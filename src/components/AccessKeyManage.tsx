import { useSettingsSnapshot } from '$settings'
import { auth, deleteAccessToken } from '$utility/auth'
import { useRequest } from 'ahooks'
import { Button, Space } from 'antd'
import { CSSProperties } from 'react'
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

  return (
    <Space size='small' style={style} className={className}>
      {!accessKey ? (
        <>
          <AntdTooltip title={waitWindowTip}>
            <Button onClick={runAsync} disabled={loading} size='middle'>
              <span>获取 access_key</span>
            </Button>
          </AntdTooltip>
          {btnAccessKeyHelpLink}
        </>
      ) : (
        <>
          <AntdTooltip title={waitWindowTip}>
            <Button onClick={runAsync} disabled={loading}>
              <span>重新获取 access_key</span>
            </Button>
          </AntdTooltip>
          <Button onClick={onDeleteAccessToken}>
            <span>删除 access_key</span>
          </Button>
          {btnAccessKeyHelpLink}
        </>
      )}
    </Space>
  )
}
