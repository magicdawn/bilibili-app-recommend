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
export const $headerHeight = valtioFactory(calcHeaderHeight())

function calcHeaderWidth(): number | undefined {
  const paddingDef = document.documentElement.style.getPropertyValue('--navbar-bounds-padding')
  if (!paddingDef) return

  const percent = minmax(Number(paddingDef.replace('%', '')), 2, 10)
  const width = 100 - percent * 2
  return width
}

export const $headerWidth = valtioFactory(calcHeaderWidth())

function action() {
  $headerHeight.state.value = calcHeaderHeight()
  $headerWidth.state.value = calcHeaderWidth()
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
