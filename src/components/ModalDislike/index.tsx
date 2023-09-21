import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { colorPrimaryValue } from '$components/ModalSettings/theme'
import { AppRecItem, AppRecItemExtend } from '$define'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { toast, toastOperationFail, toastRequestFail } from '$utility/toast'
import { useKeyPress, useMemoizedFn, useUpdateLayoutEffect } from 'ahooks'
import { useMemo, useState } from 'react'
import { Root, createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/card.service'
import styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
  item: AppRecItem | null
}

export type Reason = { id: number; name: string; toast: string }

export const dislikedIds = proxyMap<string, Reason>()
export function useDislikedIds() {
  return useSnapshot(dislikedIds)
}
export function useDislikedReason(id?: string | false) {
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

  const onDislike = useMemoizedFn(async (reason: Reason) => {
    if (!item) return

    let success = false
    let err: Error | undefined
    try {
      setIsRequesting(true)
      success = await dislike(item, reason.id)
    } catch (e) {
      err = e as Error
    } finally {
      setIsRequesting(false)
    }

    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    success ? toast('已标记不想看') : toastOperationFail()
    if (success) {
      dislikedIds.set(item.param, { ...reason })
      onHide()
    }
  })

  const reasons = useMemo(() => {
    // 此类内容过多 reason_id = 12
    // 推荐过 reason_id = 13
    return item?.three_point?.dislike_reasons || []
  }, [item])

  const keyPressEnabled = () => !!show && !!item

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!keyPressEnabled()) return
    if (!KEYS.includes(e.key)) return

    const index = Number(e.key) - 1
    setActiveIndex(index)

    const btn = document.querySelectorAll<HTMLButtonElement>(`.${styles.reason}`)[index] || null
    btn?.click()
  })

  const [activeIndex, setActiveIndex] = useState(reasons.length - 1)
  useUpdateLayoutEffect(() => {
    setActiveIndex(reasons.length - 1)
  }, [reasons])

  const increaseIndex = (by: number) => {
    return () => {
      if (!keyPressEnabled()) return
      const newIndex = activeIndex + by
      if (newIndex < 0 || newIndex > reasons.length - 1) return
      setActiveIndex(newIndex)
    }
  }

  useKeyPress('leftarrow', increaseIndex(-1))
  useKeyPress('rightarrow', increaseIndex(1))
  useKeyPress('uparrow', increaseIndex(-2))
  useKeyPress('downarrow', increaseIndex(2))

  useKeyPress('enter', (e) => {
    if (!keyPressEnabled()) return
    if (activeIndex < 0 || activeIndex > reasons.length - 1) return
    e.preventDefault()
    e.stopImmediatePropagation()
    document.querySelector<HTMLButtonElement>(`.${styles.reason}.${styles.active}`)?.click()
  })

  const activeReasonName = useMemo(() => {
    return reasons[activeIndex]?.name || ''
  }, [reasons, activeIndex])

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
          {reasons.map((reason, index) => {
            return (
              <button
                className={cx(styles.reason, { [styles.active]: index === activeIndex })}
                style={{
                  ...(index === activeIndex && { borderColor: colorPrimaryValue }),
                }}
                key={reason.id}
                data-id={reason.id}
                onClick={() => {
                  setActiveIndex(index)
                  onDislike(reason)
                }}
                disabled={isRequesting}
              >
                <span className={styles.reasonNo} style={{ backgroundColor: colorPrimaryValue }}>
                  {index + 1}
                </span>
                {reason.name}
              </button>
            )
          })}
        </div>

        <div className={styles.tipsContainer}>
          <div className={styles.tips}>
            <IconPark name='Info' size={15} style={{ marginRight: 5 }} />
            使用删除键打开弹窗, 数字键选择, Esc 关闭
          </div>
          {activeReasonName && (
            <div className={styles.tips}>
              <IconPark name='Info' size={15} style={{ marginRight: 5 }} />
              已选择「{activeReasonName}」, 回车键提交
            </div>
          )}
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
  // esc 关闭, 等一个 tick, esc 先处理完
  setTimeout(() => {
    updateProps({ show: false, item: null })
  })
}

function updateProps(newProps: Partial<IProps>) {
  Object.assign(currentProps, newProps)
  modalDislikeVisibleState.value = currentProps.show
  getRoot().render(<ModalDislike {...currentProps} onHide={onHide} />)
}

let _root: Root
function getRoot() {
  _root ||= (() => {
    const container = document.createElement('div')
    container.classList.add('show-dislike-container')
    document.body.appendChild(container)
    return createRoot(container)
  })()
  return _root
}

export function showModalDislike(item: AppRecItemExtend) {
  // 已经是 dislike 状态
  if (item?.param && dislikedIds.has(item.param)) return
  updateProps({ show: true, item })
}

// setTimeout(() => {
//   // @ts-ignore
//   showModalDislike(null)
// }, 1000)
