import { cx } from '@libs'
import { useMemoizedFn } from 'ahooks'
import { MouseEvent, ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
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
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  const wrapperRef = useRef<HTMLDivElement>(null)

  // 打开时判断深色模式等
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const isDark = document.body.classList.contains('dark')
    if (isDark) {
      const bg = window.getComputedStyle(document.body)['background-color']
      const c = window.getComputedStyle(document.body)['color']
      wrapper.style.setProperty('--bg', bg)
      wrapper.style.setProperty('--c', c)
      wrapper.style.setProperty('background-color', 'var(--bg)')
      wrapper.style.setProperty('color', 'var(--c)')
    } else {
      // 白色不用特殊处理
    }
  }, [show])

  const containerId = useId()
  const container = useMemo(() => {
    const div = document.createElement('div')
    div.setAttribute('data-id', 'modal-feed-' + containerId)
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
      <div className={cx(clsModal)} ref={wrapperRef}>
        {children}
      </div>
    </div>,
    container
  )
}
