/**
 * BILIBILI-Evolved header related
 */

import { minmax } from '$utility/num'
import { valtioFactory } from '$utility/valtio'

const defaultHeader = () => document.querySelector('.bili-header__bar')

function isUsingCustomHeader() {
  const el = defaultHeader()
  return Boolean(el && window.getComputedStyle(el).display === 'none')
}

function calcHeaderHeight() {
  if (!isUsingCustomHeader()) return 64

  const fixed = document.body.classList.contains('fixed-navbar')
  if (!fixed) return 0

  const heightDef = document.documentElement.style.getPropertyValue('--navbar-height')
  if (!heightDef) return 50

  const height = Number(heightDef.replace('px', ''))
  if (isNaN(height)) return 50
  return height
}
// prefix with $ 避免与普通变量冲突
export const $headerHeight = valtioFactory(calcHeaderHeight)

function calcHeaderWidth(): number | undefined {
  const paddingDef = document.documentElement.style.getPropertyValue('--navbar-bounds-padding')
  if (!paddingDef) return

  const percent = minmax(Number(paddingDef.replace('%', '')), 2, 10)
  const width = 100 - percent * 2
  return width
}
export const $headerWidth = valtioFactory(calcHeaderWidth)

function calcEvoledThemeColor() {
  return window.getComputedStyle(document.documentElement).getPropertyValue('--theme-color')
}
export const $evoledThemeColor = valtioFactory(calcEvoledThemeColor)

function action() {
  $headerHeight.updateThrottled()
  $headerWidth.updateThrottled()
  $evoledThemeColor.updateThrottled()
}

const ob = new MutationObserver(() => action())
ob.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['style'],
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
window.addEventListener('unload', () => {
  ob.disconnect()
})

document.body.addEventListener(
  'click',
  (e) => {
    const el = e.target as HTMLElement
    // ensure click ok button
    const isClickOnButton = (el: HTMLElement | null) => !!el?.matches('.be-button.ok')
    if (!isClickOnButton(el) && !isClickOnButton(el.parentElement)) return

    // ensure click from be-popup
    if (!el.closest('.be-popup.picker.open')) return

    setTimeout($evoledThemeColor.updateThrottled, 1000)
  },
  { capture: true, passive: true },
)
