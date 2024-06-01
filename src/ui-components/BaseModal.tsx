import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { C } from '$common/emotion-css'
import { useIsDarkMode } from '$modules/dark-mode'
import type { TheCssType } from '$utility/type'
import { Close } from '@icon-park/react'
import type { Icon } from '@icon-park/react/es/runtime'
import type { ComponentProps, MouseEvent } from 'react'
import { createPortal } from 'react-dom'

export const BaseModalStyle = {
  modalMask: css`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10002;

    // make .model center
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  modal: css`
    width: 500px;
    max-height: calc(90vh - 50px);

    background-color: #fff;
    border-radius: 10px;
    padding: 0 15px 15px 15px;

    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,

  modalHeader: css`
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: none;
    display: flex;
    align-items: center;
  `,

  modalBody: css`
    padding-top: 0;
    flex-grow: 1;
    overflow-y: scroll;
  `,

  modalTitle: css`
    font-size: 1.5rem;
    margin-bottom: 0;
    line-height: 1.5;
    display: flex;
    align-items: center;
  `,

  btnClose: css`
    margin-left: 10px;

    svg {
      width: 10px;
      height: 10px;
      margin-right: 3px;
      margin-top: -1px;
    }

    :global(body.dark) & {
      color: #eee !important;
      background-color: #333 !important;
      border-color: transparent !important;
      height: auto;
      padding: 8px 12px;
      line-height: 16px;
      font-size: 13px;
    }
  `,
}

interface IProps {
  show: boolean
  onHide: () => void
  children: ReactNode

  // classNames
  clsModalMask?: string
  cssModalMask?: TheCssType

  clsModal?: string
  cssModal?: TheCssType

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

  clsModalMask,
  cssModalMask,

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

    // click from antd select dropdown
    if (target.closest('.ant-select-dropdown')) return

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
      className={clsModalMask}
      css={[BaseModalStyle.modalMask, cssModalMask]}
      onClick={onMaskClick}
    >
      <div
        style={{ ...wrapperStyle, width }}
        className={clsModal}
        css={[BaseModalStyle.modal, cssModal]}
        ref={wrapperRef}
      >
        {children}
      </div>
    </div>,
    container,
  )
}

export const ModalClose = (props: ComponentProps<Icon>) => {
  return (
    <Close
      {...props}
      css={css`
        ${C.size(18)};
        ${C.ml(10)};
        cursor: pointer;
      `}
    />
  )
}
