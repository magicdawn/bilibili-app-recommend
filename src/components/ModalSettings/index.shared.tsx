import { AntdMessage } from '$utility'
import { delay } from 'es-toolkit'
import type { ReactNode } from 'react'

export async function toastAndReload(msg = '即将刷新网页!') {
  AntdMessage.info(msg)
  await delay(500)
  location.reload()
}

export function explainForFlag(checked: ReactNode, unchecked: ReactNode) {
  return (
    <>
      ✅: {checked} <br />
      ❎: {unchecked} <br />
    </>
  )
}
