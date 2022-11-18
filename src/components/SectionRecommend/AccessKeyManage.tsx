import { CollapseBtn, CollapseBtnRef } from '$components/CollapseBtn'
import { useConfigSnapshot } from '$settings'
import { auth, deleteAccessToken } from '$utility/auth'
import { useMemoizedFn, useRequest } from 'ahooks'
import { useRef } from 'react'

export function AccessKeyManage() {
  const collapseBtnRef = useRef<CollapseBtnRef>(null)
  const { accessKey } = useConfigSnapshot()

  const useAuthRequest = useRequest(auth, { manual: true })

  const onGetAuth = useMemoizedFn(async () => {
    const accessKey = await useAuthRequest.runAsync()
    if (accessKey) {
      collapseBtnRef.current?.set(false)
    }
  })

  const onDeleteAccessToken = deleteAccessToken

  const onExplainAccessKey = useMemoizedFn(() => {
    const explainUrl =
      'https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
    window.open(explainUrl, '_blank')
  })

  return (
    <>
      {!accessKey ? (
        <>
          <button className='primary-btn roll-btn' onClick={onExplainAccessKey}>
            <span>access_key 说明</span>
          </button>
          <button
            className='primary-btn roll-btn'
            onClick={onGetAuth}
            disabled={useAuthRequest.loading}
          >
            <span>获取 access_key</span>
          </button>
        </>
      ) : (
        <>
          <button className='primary-btn roll-btn' onClick={onExplainAccessKey}>
            <span>access_key 说明</span>
          </button>
          <button
            className='primary-btn roll-btn'
            onClick={() => onGetAuth()}
            disabled={useAuthRequest.loading}
          >
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
