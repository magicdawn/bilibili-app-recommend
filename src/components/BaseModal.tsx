import { cx } from '@libs'
import { useMemoizedFn } from 'ahooks'
import { CSSProperties } from 'react'
import { MouseEvent, ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { proxy, useSnapshot } from 'valtio'

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

// Bilibili-evoled toggle dark mode
// document.querySelector('[data-name=darkMode] .main-content').click()
const getIsDarkMode = () => document.body.classList.contains('dark')
const isDarkModeState = proxy({ value: getIsDarkMode() })
const useIsDarkMode = function () {
  return useSnapshot(isDarkModeState)
}

const ob = new MutationObserver(function () {
  isDarkModeState.value = getIsDarkMode()
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})

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
  const { value: isDarkMode } = useIsDarkMode()

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
