import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { useIsDarkMode } from '$platform'
import type { SerializedStyles } from '@emotion/react'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import type { MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import BaseModalClass from './BaseModal.module.scss'

export { BaseModalClass }

interface IProps {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classNames
  styleModalMask?: CSSProperties
  clsModalMask?: string
  cssModalMask?: SerializedStyles

  styleModal?: CSSProperties
  clsModal?: string
  cssModal?: SerializedStyles

  width?: CSSProperties['width']

  // behaviors
  hideWhenMaskOnClick?: boolean
  hideWhenEsc?: boolean
}

let showedCount = 0
const modalShowCheck = () => {
  showedCount++
  document.body.style.overflow = 'hidden' // lock
}
const modalHideCheck = () => {
  showedCount--
  if (showedCount < 0) showedCount = 0
  if (showedCount === 0) {
    document.body.style.overflow = '' // unlock
  }
}

export function BaseModal({
  show,
  onHide,
  children,

  styleModalMask,
  clsModalMask,
  cssModalMask,
  styleModal,
  clsModal,
  cssModal,

  width,
  hideWhenMaskOnClick = false,
  hideWhenEsc = false,
}: IProps) {
  // lock body scroll
  useLayoutEffect(() => {
    if (show) {
      modalShowCheck()
    } else {
      modalHideCheck()
    }
  }, [show])

  const wrapperRef = useRef<HTMLDivElement>(null)

  // 深色模式
  const isDarkMode = useIsDarkMode()

  const { bg, c } = useMemo(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor
    const c = window.getComputedStyle(document.body).color
    return { bg, c }
  }, [isDarkMode])

  const wrapperStyle: CSSProperties = useMemo(() => {
    return isDarkMode
      ? {
          '--bg': bg,
          '--c': c,
          'backgroundColor': bg,
          'color': c,
        }
      : // 白色不用特殊处理
        {}
  }, [bg, c, isDarkMode])

  const containerId = useId()
  const container = useMemo(() => {
    const div = document.createElement('div')
    div.classList.add(APP_NAME_ROOT_CLASSNAME)
    div.setAttribute('data-id', 'base-modal-' + containerId)
    document.body.appendChild(div)
    return div
  }, [])

  const onMaskClick = useMemoizedFn((e: MouseEvent) => {
    const target = e.target as HTMLElement

    // click from .modal
    if (wrapperRef.current?.contains(target)) return

    // click from antd tooltip
    if (target.closest('.ant-tooltip-inner[role="tooltip"]')) return

    // click from antd popconfirm
    if (target.closest('.ant-popover-inner[role="tooltip"]')) return

    if (hideWhenMaskOnClick) {
      onHide()
    }
  })

  useKeyPress('esc', (e) => {
    if (!show) return
    if (hideWhenEsc) {
      // prevent other esc handler run
      e.preventDefault()
      e.stopImmediatePropagation()

      // wait the unpreventable esc handlers run, close in next tick
      setTimeout(onHide)
    }
  })

  if (!show) {
    return null
  }

  return createPortal(
    <div
      style={styleModalMask}
      className={cx(BaseModalClass.modalMask, clsModalMask)}
      css={cssModalMask}
      onClick={onMaskClick}
    >
      <div
        style={{ ...wrapperStyle, width, ...styleModal }}
        className={cx(BaseModalClass.modal, clsModal)}
        css={cssModal}
        ref={wrapperRef}
      >
        {children}
      </div>
    </div>,
    container,
  )
}

export const ModalClose = (props: Omit<ComponentProps<typeof IconPark>, 'name'>) => {
  return (
    <IconPark
      {...props}
      name='Close'
      size={18}
      style={{
        cursor: 'pointer',
        marginLeft: 10,
        ...props.style,
      }}
    />
  )
}
