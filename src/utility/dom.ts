import { APP_NAME, baseDebug } from '$common'
import delay from 'delay'

const debug = baseDebug.extend('utility:dom')

const DEFAULT_TIMEOUT = 10 * 1000
const DEFAULT_DELAY_INTERVAL = 200

export interface TryActionOptions {
  selectorPredicate?: (el: HTMLElement) => boolean
  delayInterval?: number
  timeout?: number
  warnOnTimeout?: boolean
}

export async function tryAction(
  selector: string,
  action: (el: HTMLElement) => void | Promise<void>,
  moreOptions?: TryActionOptions,
) {
  const selectorPredicate = moreOptions?.selectorPredicate
  const timeout = moreOptions?.timeout ?? DEFAULT_TIMEOUT
  const delayInterval = moreOptions?.delayInterval ?? DEFAULT_DELAY_INTERVAL
  const warnOnTimeout = moreOptions?.warnOnTimeout ?? true

  let arr: HTMLElement[] = []
  const query = () => {
    arr = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (selectorPredicate) arr = arr.filter(selectorPredicate)
  }
  query()

  const start = performance.now()
  const timeoutAt = start + timeout
  while (!arr.length && performance.now() < timeoutAt) {
    await delay(delayInterval)
    query()
  }

  if (!arr.length) {
    if (warnOnTimeout) {
      console.warn(`[${APP_NAME}]: tryAction timeout, selector = \`%s\``, selector)
    }
    return
  }

  debug('tryAction: selector=`%s` count=%s', selector, arr.length)
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
  delayMs?: number,
) {
  if (typeof delayMs === 'number') await delay(delayMs)
  return tryAction(selector, (el) => el.remove(), { selectorPredicate })
}

/**
 * input 输入中, 用于拦截快捷键处理
 */

export function shouldDisableShortcut() {
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

/**
 * https://youmightnotneedjquery.com/#offset
 */

export function getElementOffset(el: HTMLElement) {
  const box = el.getBoundingClientRect()
  const docElem = document.documentElement
  return {
    top: box.top + window.pageYOffset - docElem.clientTop,
    left: box.left + window.pageXOffset - docElem.clientLeft,
  }
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    queueMicrotask(resolve)
  })
}

export function whenIdle(options?: IdleRequestOptions): Promise<void> {
  return new Promise((resolve) => {
    // safari has no requestIdleCallback
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback(() => resolve(), options)
      : setTimeout(resolve)
  })
}

export let ORIGINAL_TITLE: string = ''

export function setPageTitle(title: string) {
  // backup original title on first call
  if (!ORIGINAL_TITLE) {
    ORIGINAL_TITLE = document.title
  }
  document.title = `${title} - ${ORIGINAL_TITLE}`
}
