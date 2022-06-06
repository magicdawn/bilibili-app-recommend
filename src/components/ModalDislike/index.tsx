import { BaseModal } from '@components/BaseModal'
import { RecItem } from '@define'
import { toast, toastOperationFail, toastRequestFail } from '@utility/toast'
import { useMemoizedFn } from 'ahooks'
import { useMemo, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/card.service'
import * as styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
  item: RecItem | null
}

export type Reason = { id: number; name: string }

export const dislikedIds = proxyMap<string, Reason>()
export function useDislikedIds() {
  return useSnapshot(dislikedIds)
}
export function useDislikedReason(id?: string) {
  const map = useDislikedIds()
  if (!id) return undefined
  return map.get(id)
}
// 不能清理, 因为有两处在同时使用, refresh 之后清理影响其他地方比较奇怪
function clearDislikedIds() {
  dislikedIds.clear()
}

export function ModalDislike({ show, onHide, item }: IProps) {
  const [isRequesting, setIsRequesting] = useState(false)

  const onDislike = useMemoizedFn(async (reasonId: number, reasonName: string) => {
    if (!item) return

    let success = false
    let err: Error | null = null
    try {
      setIsRequesting(true)
      success = await dislike(item, reasonId)
    } catch (e) {
      err = e
    } finally {
      setIsRequesting(false)
    }

    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    success ? toast('已标记不想看') : toastOperationFail()
    if (success) {
      dislikedIds.set(item.param, { id: reasonId, name: reasonName })
      onHide()
    }
  })

  const reasons = useMemo(() => {
    // 此类内容过多 reason_id = 12
    // 推荐过 reason_id = 13
    return [
      ...(item?.dislike_reasons ?? []),
      { reason_id: 12, reason_name: '此类内容过多' },
      { reason_id: 13, reason_name: '推荐过' },
    ]
  }, [item])

  return (
    <BaseModal
      {...{
        show,
        onHide,
        clsModalMask: styles.modalMask,
        clsModal: styles.modal,
        hideWhenMaskOnClick: true,
      }}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>
          我不想看
          <span className={styles.titleDesc}>(选择后将减少相似内容推荐)</span>
        </div>

        <div className='space' style={{ flex: 1 }}></div>

        <button className={`primary-btn roll-btn ${styles.btnClose}`} onClick={onHide}>
          <svg style={{ transform: 'rotate(0deg)' }}>
            <use xlinkHref='#widget-close'></use>
          </svg>
          <span>关闭</span>
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.reasonList}>
          {reasons.map((r) => {
            return (
              <button
                className={styles.reason}
                data-id={r.reason_id}
                onClick={() => onDislike(r.reason_id, r.reason_name)}
                disabled={isRequesting}
                key={r.reason_id}
              >
                {r.reason_name}
              </button>
            )
          })}
        </div>
      </div>
    </BaseModal>
  )
}

let currentProps: IProps = {
  show: false,
  onHide,
  item: null,
}

function onHide() {
  updateProps({ show: false, item: null })
}

function updateProps(newProps: Partial<IProps>) {
  Object.assign(currentProps, newProps)
  getRoot().render(<ModalDislike {...currentProps} onHide={onHide} />)
}

let _root: Root
function getRoot() {
  if (!_root) {
    const container = document.createElement('div')
    container.classList.add('show-dislike-container')
    document.body.appendChild(container)
    _root = createRoot(container)
  }
  return _root
}

export function showModalDislike(item: RecItem) {
  updateProps({ show: true, item })
}
