import { settings } from '$modules/settings'
import { subscribeOnKeys, valtioFactory } from '$utility/valtio'
import { delay } from 'es-toolkit'
import { subscribe } from 'valtio'

/**
 * BILIBILI-Evolved dark mode
 * get: body.dark
 * toggle: document.querySelector('[data-name=darkMode] .main-content').click()
 */

const $darkMode = valtioFactory(() => {
  return (
    document.body.classList.contains('dark') ||
    document.body.classList.contains('bilibili-helper-dark-mode') ||
    document.documentElement.classList.contains('dark')
  )

  // bilibili default dark style
  // <link id="__css-map__" rel="stylesheet" href="//s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/dark.css">
  // !!document.querySelector('link[rel="stylesheet"][id="__css-map__"]')
  // parseCookie().theme_style === 'dark'
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
setTimeout($colors.updateThrottled, 2000) // when onload complete
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

document.addEventListener('click', evolvedDarkModeClickHandler, { passive: true })
async function evolvedDarkModeClickHandler(e: MouseEvent) {
  const t = e.target as HTMLElement
  // role="listitem" data-name="darkMode" class="custom-navbar-item"
  if (!t.closest('.custom-navbar-item[role="listitem"][data-name="darkMode"]')) return
  await delay(0)
  $darkMode.updateThrottled()
  $colors.updateThrottled()
}

window.addEventListener('unload', () => {
  ob.disconnect()
  document.removeEventListener('click', evolvedDarkModeClickHandler)
})
