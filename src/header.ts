import { proxy, useSnapshot } from 'valtio'

/**
 * BILIBILI-Evolved header
 */
const defaultHeader = () => document.querySelector('.bili-header__bar')

function isUsingCustomHeader() {
  return Boolean(defaultHeader() && window.getComputedStyle(defaultHeader()!).display === 'none')
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

const headerHeightState = proxy({ value: calcHeaderHeight() })

export function useHeaderHeight() {
  return useSnapshot(headerHeightState).value
}
export function getHeaderHeight() {
  return headerHeightState.value
}

// let Bilibili-Evolved run first
setTimeout(() => {
  headerHeightState.value = calcHeaderHeight()
  const ob = new MutationObserver(() => {
    headerHeightState.value = calcHeaderHeight()
  })

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
}, 2000)
