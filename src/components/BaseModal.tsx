import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { useIsDarkMode } from '$platform'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import {
  CSSProperties,
  ComponentProps,
  MouseEvent,
  ReactNode,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import BaseModalClass from './BaseModal.module.less'

export { BaseModalClass }

interface IProps {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classnames
  clsModalMask?: string
  clsModal?: string
  styleModalMask?: CSSProperties
  styleModal?: CSSProperties
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
  styleModal,
  clsModal,

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
    const bg = window.getComputedStyle(document.body)['background-color']
    const c = window.getComputedStyle(document.body)['color']
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
    div.setAttribute('data-id', 'base-modal-' + containerId)
    document.body.appendChild(div)
    return div
  }, [])

  const onMaskClick = useMemoizedFn((e: MouseEvent) => {
    // click from .modal
    if (wrapperRef.current?.contains(e.target as HTMLElement)) {
      return
    }

    // click from antd tooltip
    if ((e.target as HTMLElement).closest('.ant-tooltip-inner[role="tooltip"]')) {
      return
    }

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
      className={cx(BaseModalClass.modalMask, clsModalMask)}
      style={styleModalMask}
      onClick={onMaskClick}
    >
      <div
        className={cx(BaseModalClass.modal, clsModal)}
        style={{ ...wrapperStyle, width, ...styleModal }}
        ref={wrapperRef}
      >
        {children}
      </div>
    </div>,
    container
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
