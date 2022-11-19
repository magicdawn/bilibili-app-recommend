/**
 * 是否是内测页面
 */

import { once } from 'lodash'
import { useMemo } from 'react'

export const checkInternalTesting = once(() => {
  return (
    document.querySelector<HTMLButtonElement>('button.go-back')?.innerText.trim() === '退出内测'
  )
})

export const useIsInternalTesting = function () {
  return useMemo(() => checkInternalTesting(), [])
}
