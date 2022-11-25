import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { RecItem } from '$define'
import { IconPark } from '$icon-park'
import { toast, toastOperationFail, toastRequestFail } from '$utility/toast'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { useMemo, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/card.service'
import styles from './index.module.less'

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

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!show) return
    if (!item) return
    if (!KEYS.includes(e.key)) return

    // 使用 btn.click 无需 isRequesting 判断
    // if (isRequesting) return

    const index = Number(e.key) - 1
    const btn = document.querySelectorAll<HTMLButtonElement>(`.${styles.reason}`)[index] || null
    btn?.click()
  })

  return (
    <BaseModal
      {...{
        show,
        onHide,
        clsModal: styles.modal,
        hideWhenMaskOnClick: true,
        hideWhenEsc: true,
      }}
    >
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}>
          我不想看
          <span className={styles.titleDesc}>(选择后将减少相似内容推荐)</span>
        </div>
        <div className='space' style={{ flex: 1 }}></div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={BaseModalClass.modalBody}>
        <div className={styles.reasonList}>
          {reasons.map((r, index) => {
            return (
              <button
                className={styles.reason}
                data-id={r.reason_id}
                onClick={() => onDislike(r.reason_id, r.reason_name)}
                disabled={isRequesting}
                key={r.reason_id}
              >
                <span className={styles.reasonNo}>{index + 1}</span>
                {r.reason_name}
              </button>
            )
          })}
        </div>

        <div className={styles.tips}>
          <IconPark name='Info' size={15} style={{ marginRight: 5 }} />
          使用删除键打开弹框, 数字键选择, Esc 关闭
        </div>
      </div>
    </BaseModal>
  )
}

const currentProps: IProps = {
  show: false,
  onHide,
  item: null,
}

// for outside consumer
const modalDislikeVisibleState = proxy({
  value: currentProps.show,
})

export const useModalDislikeVisible = function () {
  return useSnapshot(modalDislikeVisibleState).value
}

function onHide() {
  updateProps({ show: false, item: null })
}

function updateProps(newProps: Partial<IProps>) {
  Object.assign(currentProps, newProps)
  modalDislikeVisibleState.value = currentProps.show
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
  // 已经是 dislike 状态
  if (item?.param && dislikedIds.has(item.param)) return

  updateProps({ show: true, item })
}

// setTimeout(() => {
//   // @ts-ignore
//   showModalDislike(null)
// }, 1000)
