import { APP_NAME } from '$common'
import delay from 'delay'

const TIMEOUT = 10 * 1000
const DELAY_INTERVAL = 200

export async function tryAction(
  selector: string,
  action: (el: HTMLElement) => void | Promise<void>,
  selectorPredicate: (el: HTMLElement) => boolean = () => true
) {
  let arr: HTMLElement[] = []
  const query = () => {
    arr = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(selectorPredicate)
  }
  query()

  const start = performance.now()
  const timeoutAt = start + TIMEOUT
  while (!arr.length && performance.now() < timeoutAt) {
    await delay(DELAY_INTERVAL)
    query()
  }

  if (!arr.length) {
    console.warn(`[${APP_NAME}]: tryAction timeout, selector = %s`, selector)
    return
  }

  for (const el of arr) {
    await Promise.resolve(action(el))
  }
}

/**
 * 尝试移除元素
 */

export async function tryToRemove(
  selector: string,
  selectorPredicate?: (el: HTMLElement) => boolean,
  delayMs?: number
) {
  if (typeof delayMs === 'number') await delay(delayMs)
  return tryAction(selector, (el) => el.remove(), selectorPredicate)
}

/**
 * input 输入种, 用于拦截快捷键处理
 */

export function isCurrentTyping() {
  // if activeElement is input, disable shortcut
  const activeTagName = (document.activeElement?.tagName || '').toLowerCase()
  if (['input', 'textarea'].includes(activeTagName)) {
    return true
  }

  // if search panel is open, disable shortcut
  if (document.querySelector('.center-search__bar.is-focus')) {
    return true
  }

  return false
}
