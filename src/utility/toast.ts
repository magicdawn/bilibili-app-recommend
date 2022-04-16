import $ from 'jquery'
import { toastContainer } from './toast.module.less'

export function toast(msg: string, duration = 2000) {
  const $div = $(`<div class='${toastContainer}'>${msg}</div>`)
  $div.appendTo(document.body)
  setTimeout(() => $div.remove(), duration)
}
