import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { useIsDarkMode } from '$platform'
import { QRCode } from 'antd'
import { once } from 'lodash'
import mitt from 'mitt'
import { pEvent } from 'p-event'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { qrcodeConfirm } from './api'

const initialValue = {
  show: false,
  qrcodeUrl: '',
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
  const { qrcodeUrl, show, message } = useSnapshot(store)
  const onHide = hideQrCodeModal

  const dark = useIsDarkMode()

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={false}
      hideWhenEsc={false}
      cssModalMask={css`
        backdrop-filter: blur(10px);
      `}
      cssModal={css`
        width: 260px;
        aspect-ratio: 10 / 16;
      `}
    >
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}></div>
        <div className='space' style={{ flex: 1 }}></div>
        <ModalClose onClick={onHide} />
      </div>

      <div
        className={BaseModalClass.modalBody}
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        `}
      >
        <div
          css={css`
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 25px;
            margin-bottom: 2px;
          `}
        >
          {message || ''}
        </div>

        {qrcodeUrl && (
          <QRCode
            css={css`
              margin: 0 auto;
              margin-bottom: 40px;
              padding: 8px;
              flex-shrink: 0;
            `}
            value={qrcodeUrl}
            size={200}
            icon='https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/72/9c/b6/729cb6d8-75f5-0a56-0508-3a26cbba69ae/AppIcon-1x_U007emarketing-0-6-0-0-85-220-0.png/230x0w.webp'
          />
        )}

        <div
          className='footnote'
          css={css`
            font-size: 13px;
          `}
        >
          打开「哔哩哔哩」或「bilibili」APP <br />
          扫码获取 access_key
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
