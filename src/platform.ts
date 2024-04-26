import { settings } from '$modules/settings'
import { subscribeOnKeys, valtioFactory } from '$utility/valtio'
import UAParser from 'ua-parser-js'
import { subscribe } from 'valtio'

/**
 * BILIBILI-Evolved dark mode
 *
 * Bilibili-evoled toggle dark mode
 * document.querySelector('[data-name=darkMode] .main-content').click()
 */

const $darkMode = valtioFactory(() => {
  return (
    document.body.classList.contains('dark') ||
    document.body.classList.contains('bilibili-helper-dark-mode')
  )
})
export function useIsDarkMode() {
  return $darkMode.use()
}

/**
 * color & bg-color 相关
 */

export const $colors = valtioFactory(() => {
  const bg = window.getComputedStyle(document.body).backgroundColor
  const c = window.getComputedStyle(document.body).color
  return { bg, c }
})

export function useColors() {
  return $colors.use()
}

// update
setTimeout($colors.updateThrottled, 2000) // onload complete
subscribe($darkMode.state, $colors.updateThrottled) // when dark mode change
subscribeOnKeys(settings, ['styleUseWhiteBackground'], () =>
  setTimeout($colors.updateThrottled, 500),
) // when settings.styleUseWhiteBackground change

const ob = new MutationObserver(() => {
  setTimeout(() => {
    $darkMode.updateThrottled()
    setTimeout($colors.updateThrottled)
  })
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
ob.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-darkreader-scheme'],
})
window.addEventListener('unload', () => {
  ob.disconnect()
})

export const uaParseResult = UAParser()

// os
export const isMac = uaParseResult.os.name?.toLowerCase() === 'mac os'

// browser
export const isSafari = uaParseResult.browser.name?.toLowerCase() === 'safari'
export const isFirefox = uaParseResult.browser.name?.toLowerCase() === 'firefox'
