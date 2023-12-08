import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { css } from '@emotion/react'
import { once } from 'lodash'
import mitt from 'mitt'
import { pEvent } from 'p-event'
import { QRCodeSVG } from 'qrcode.react'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { qrcodeConfirm } from './api'

const initialValue = {
  show: false,
  qrcode: '',
  auth_code: '',
  message: '',
}
const store = proxy({ ...initialValue })
export const qrcodeStore = store

export function updateStore(data: Partial<typeof initialValue>) {
  renderOnce()
  Object.assign(store, data)
}

export function showQrCodeModal(data: Partial<typeof initialValue>) {
  updateStore({ ...initialValue, ...data, show: true })
}

export function hideQrCodeModal() {
  emitter.emit('hide')
  updateStore({ ...initialValue })
}

const emitter = mitt<{ hide: void }>()

export function whenQrCodeModalHide() {
  return pEvent(emitter, 'hide')
}

/**
 * 掉登录, 风控, 所以不再提供
 * https://github.com/lzghzr/TampermonkeyJS/blob/master/libBilibiliToken/libBilibiliToken.js#L99-L106
 */
async function confirmQrCodeLoginWithCookie() {
  if (!store.auth_code) return
  await qrcodeConfirm(store.auth_code)
}

export function TvQrCodeAuth() {
  const { qrcode, show, message } = useSnapshot(store)
  const onHide = hideQrCodeModal
  return (
    <BaseModal
      {...{
        show,
        onHide,
        hideWhenMaskOnClick: false,
        hideWhenEsc: false,
        styleModal: { width: '600px' },
      }}
    >
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}>使用移动端 Bilibili App 扫码获取 access_key</div>
        <div className='space' style={{ flex: 1 }}></div>
        <ModalClose onClick={onHide} />
      </div>

      <div className={BaseModalClass.modalBody}>
        <div
          className='wrapper'
          css={css`
            text-align: center;
          `}
        >
          <div
            css={css`
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              margin-bottom: 5px;
            `}
          >
            {message || ''}
          </div>

          {qrcode ? (
            <QRCodeSVG value={qrcode} size={200} />
          ) : (
            <div className='qrcode-placeholder'></div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('modal-tv-qrcode-auth', APP_NAME_ROOT_CLASSNAME)
  document.body.appendChild(container)
  const r = createRoot(container)
  r.render(
    <AntdApp>
      <TvQrCodeAuth />
    </AntdApp>,
  )
})
