import { toastContainer } from './toast.module.less'
import ms from 'ms'

export function toast(msg: string, duration: number | string = 2000) {
  let d = typeof duration === 'number' ? duration : ms(duration)

  const div = document.createElement('div')
  div.className = toastContainer
  div.innerText = msg

  document.body.appendChild(div)
  setTimeout(() => div.remove(), d)
}

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export function toastRequestFail() {
  return toast(REQUEST_FAIL_MSG)
}

export function toastOperationFail() {
  return toast(OPERATION_FAIL_MSG)
}
