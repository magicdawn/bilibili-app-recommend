import { getCurrentTheme } from '$components/ModalSettings/theme'
import { singleLine, toastContainer } from './toast.module.less'

export function toast(msg: string, duration = 2000) {
  const div = document.createElement('div')
  div.className = toastContainer
  div.innerText = msg

  const { colorPrimary } = getCurrentTheme()
  div.style.backgroundColor = colorPrimary

  if (!msg.includes('\n') && !msg.includes('<br')) {
    div.classList.add(singleLine)
  }

  document.body.appendChild(div)
  setTimeout(() => div.remove(), duration)
}

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export function toastRequestFail() {
  return toast(REQUEST_FAIL_MSG)
}

export function toastOperationFail() {
  return toast(OPERATION_FAIL_MSG)
}
