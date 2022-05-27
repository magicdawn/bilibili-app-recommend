import { cx } from '@libs'
import { ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

interface IProps {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classnames
  clsModalMask?: string
  clsModal?: string
}

export function BaseModal({ show, onHide, children, clsModalMask, clsModal }: IProps) {
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

  // lock body scroll
  useLayoutEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  const containerId = useId()
  const container = useMemo(() => {
    const div = document.createElement('div')
    div.setAttribute('data-id', 'modal-feed-' + containerId)
    document.body.appendChild(div)
    return div
  }, [])

  if (!show) {
    return null
  }

  return createPortal(
    <div className={cx(clsModalMask)}>
      <div className={cx(clsModal)} ref={wrapperRef}>
        {children}
      </div>
    </div>,
    container
  )
}

export default BaseModal
