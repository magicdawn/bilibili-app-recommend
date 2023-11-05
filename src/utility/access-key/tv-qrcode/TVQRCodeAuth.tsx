import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { css } from '@emotion/react'
import { once } from 'lodash'
import { QRCodeSVG } from 'qrcode.react'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'

const initialValue = {
  show: false,
  qrcode: '',
  auth_code: '',
  message: '',
}
const store = proxy({ ...initialValue })
export const tvqrcodeAuthStore = store

export function updateStore(data: Partial<typeof initialValue>) {
  renderOnce()
  Object.assign(store, data)
}

export function showQRCode(data: Partial<typeof initialValue>) {
  updateStore({ ...initialValue, ...data, show: true })
}

export function hideQRCode() {
  updateStore({ ...initialValue })
}

export function TVQRCodeAuth() {
  const { qrcode, show, message } = useSnapshot(store)

  return (
    <BaseModal
      {...{
        show,
        onHide: hideQRCode,
        hideWhenMaskOnClick: false,
        hideWhenEsc: false,
        styleModal: { width: '700px' },
      }}
    >
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}>使用移动端 Bilibili App 扫码获取 access_key</div>
        <div className='space' style={{ flex: 1 }}></div>
        <ModalClose onClick={hideQRCode} />
      </div>

      <div className={BaseModalClass.modalBody}>
        <div
          className='wrapper'
          css={css`
            text-align: center;
          `}
        >
          <p
            css={css`
              font-size: 20px;
              margin-bottom: 5px;
            `}
          >
            {message || ''}
          </p>

          {qrcode ? (
            <QRCodeSVG value={qrcode} size={200} />
          ) : (
            <div className='qrcode-placeholder'></div>
          )}
        </div>
        {/* <img
          src={qrcode}
          alt='the qrcode url'
          css={css`
            width: 200px;
            height: 200px;
          `}
        /> */}
      </div>
    </BaseModal>
  )
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('tv-qrcode-auth')
  document.body.appendChild(container)
  const r = createRoot(container)
  r.render(<TVQRCodeAuth />)
})
