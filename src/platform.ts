import { once } from 'lodash'
import { useMemo } from 'react'
import { proxy, useSnapshot } from 'valtio'

/**
 * 是否是内测页面
 */

export const checkInternalTesting = once(() => {
  return (
    document.querySelector<HTMLButtonElement>('button.go-back')?.innerText.trim() === '退出内测'
  )
})

export const useIsInternalTesting = function () {
  return useMemo(() => checkInternalTesting(), [])
}

/**
 * BILIBILI-Evolved header
 */

const defaultHeader = document.querySelector('.bili-header__bar')
export const isUsingCustomHeader = Boolean(
  defaultHeader && window.getComputedStyle(defaultHeader).display === 'none'
)
export const HEADER_HEIGHT = isUsingCustomHeader ? 50 : 64

/**
 * BILIBILI-Evolved dark mode
 *
 * Bilibili-evoled toggle dark mode
 * document.querySelector('[data-name=darkMode] .main-content').click()
 */

const getIsDarkMode = () => document.body.classList.contains('dark')
const isDarkModeState = proxy({ value: getIsDarkMode() }) // like vue3 ref()

export const useIsDarkMode = function () {
  return useSnapshot(isDarkModeState).value
}

const bodyOb = new MutationObserver(function () {
  isDarkModeState.value = getIsDarkMode()
})
bodyOb.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
window.addEventListener('unload', () => {
  bodyOb?.disconnect()
})
