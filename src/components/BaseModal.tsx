import { cx } from '$libs'
import { useIsDarkMode } from '$platform'
import { useMemoizedFn } from 'ahooks'
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'

interface IProps {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classnames
  clsModalMask?: string
  clsModal?: string

  // behaviors
  hideWhenMaskOnClick?: boolean
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
    document.body.style.overflow = 'overlay' // unlock
  }
}

export function BaseModal({
  show,
  onHide,
  children,
  clsModalMask,
  clsModal,
  hideWhenMaskOnClick = false,
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

    if (hideWhenMaskOnClick) {
      onHide()
    }
  })

  if (!show) {
    return null
  }

  return createPortal(
    <div className={cx(clsModalMask)} onClick={onMaskClick}>
      <div className={cx(clsModal)} style={wrapperStyle} ref={wrapperRef}>
        {children}
      </div>
    </div>,
    container
  )
}
