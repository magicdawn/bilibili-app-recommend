import { useSettingsSnapshot } from '$settings'
import { auth, deleteAccessToken } from '$utility/auth'
import { useRequest } from 'ahooks'
import { Button, Space } from 'antd'
import { CSSProperties } from 'react'

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

  return (
    <Space size='small' style={style} className={className}>
      {!accessKey ? (
        <>
          <Button onClick={runAsync} disabled={loading} size='middle'>
            <span>获取 access_key</span>
          </Button>
          {btnAccessKeyHelpLink}
        </>
      ) : (
        <>
          <Button onClick={runAsync} disabled={loading}>
            <span>重新获取 access_key</span>
          </Button>
          <Button onClick={onDeleteAccessToken}>
            <span>删除 access_key</span>
          </Button>
          {btnAccessKeyHelpLink}
        </>
      )}
    </Space>
  )
}
