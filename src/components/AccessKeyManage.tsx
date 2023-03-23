import { CollapseBtnRef } from '$components/CollapseBtn'
import { useSettingsSnapshot } from '$settings'
import { auth, deleteAccessToken } from '$utility/auth'
import { useMemoizedFn, useRequest } from 'ahooks'
import { useRef } from 'react'

export const accessKeyLinkBtn = (
  <a
    className='primary-btn roll-btn'
    target='_blank'
    href='https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
  >
    access_key 说明
  </a>
)

export function AccessKeyManage() {
  const { runAsync, loading } = useRequest(auth, { manual: true })
  const { accessKey } = useSettingsSnapshot()

  const collapseBtnRef = useRef<CollapseBtnRef>(null)
  const onGetAuth = useMemoizedFn(async () => {
    const accessKey = await runAsync()
    if (accessKey) {
      collapseBtnRef.current?.set(false)
    }
  })

  const onDeleteAccessToken = deleteAccessToken

  return (
    <>
      {!accessKey ? (
        <>
          {accessKeyLinkBtn}
          <button className='primary-btn roll-btn' onClick={onGetAuth} disabled={loading}>
            <span>获取 access_key</span>
          </button>
        </>
      ) : (
        <>
          {accessKeyLinkBtn}
          <button className='primary-btn roll-btn' onClick={() => onGetAuth()} disabled={loading}>
            <span>重新获取 access_key</span>
          </button>
          <button className='primary-btn roll-btn' onClick={onDeleteAccessToken}>
            <span>删除 access_key</span>
          </button>
        </>
      )}
    </>
  )
}
