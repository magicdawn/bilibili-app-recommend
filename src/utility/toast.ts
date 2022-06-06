import $ from 'jquery'
import { toastContainer } from './toast.module.less'

export function toast(msg: string, duration = 2000) {
  const $div = $(`<div class='${toastContainer}'>${msg}</div>`)
  $div.appendTo(document.body)
  setTimeout(() => $div.remove(), duration)
}

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export function toastRequestFail() {
  return toast(REQUEST_FAIL_MSG)
}

export function toastOperationFail() {
  return toast(OPERATION_FAIL_MSG)
}
