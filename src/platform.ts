import { valtioFactory } from '$utility/valtio'
import UAParser from 'ua-parser-js'

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

export function useColors() {
  const isDarkMode = useIsDarkMode()
  const { bg, c } = useMemo(() => {
    const bg = window.getComputedStyle(document.body).backgroundColor
    const c = window.getComputedStyle(document.body).color
    return { bg, c }
  }, [isDarkMode])
  return { bg, c }
}

const ob = new MutationObserver(function () {
  $darkMode.updateThrottled()
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
