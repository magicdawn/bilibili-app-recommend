import { once } from 'lodash'
import UAParser from 'ua-parser-js'
import { proxy, useSnapshot } from 'valtio'

/**
 * 是否是内测页面
 */

// document.querySelector<HTMLButtonElement>('button.go-back')?.innerText.trim() === '退出内测'
export const getIsInternalTesting = once(() => {
  return !!document.querySelectorAll('.bili-feed4').length
})

/**
 * BILIBILI-Evolved dark mode
 *
 * Bilibili-evoled toggle dark mode
 * document.querySelector('[data-name=darkMode] .main-content').click()
 */

const getIsDarkMode = () =>
  document.body.classList.contains('dark') ||
  document.body.classList.contains('bilibili-helper-dark-mode')
// ||
// document.documentElement.getAttribute('data-darkreader-scheme') === 'dark'
const isDarkModeState = proxy({ value: getIsDarkMode() }) // like vue3 ref()

export function useIsDarkMode() {
  return useSnapshot(isDarkModeState).value
}

export function useColors() {
  const isDarkMode = useIsDarkMode()
  const { bg, c } = useMemo(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor
    const c = window.getComputedStyle(document.body).color
    return { bg, c }
  }, [isDarkMode])
  return { bg, c }
}

const darkOb = new MutationObserver(function () {
  isDarkModeState.value = getIsDarkMode()
})
darkOb.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
darkOb.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-darkreader-scheme'],
})
window.addEventListener('unload', () => {
  darkOb.disconnect()
})

export const uaParseResult = UAParser()

// os
export const isMac = uaParseResult.os.name?.toLowerCase() === 'mac os'

// browser
export const isSafari = uaParseResult.browser.name?.toLowerCase() === 'safari'
export const isFirefox = uaParseResult.browser.name?.toLowerCase() === 'firefox'
