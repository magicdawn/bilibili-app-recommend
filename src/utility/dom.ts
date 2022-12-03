import delay from 'delay'

const TIMEOUT = 10 * 1000
const DELAY_INTERVAL = 200

export async function tryAction(
  selector: string,
  action: (el: HTMLElement) => void | Promise<void>
) {
  let arr: HTMLElement[] = []
  const query = () => {
    arr = Array.from(document.querySelectorAll<HTMLElement>(selector))
  }

  const start = performance.now()
  let elapsed = 0
  while (!arr.length && (elapsed = performance.now() - start) < TIMEOUT) {
    await delay(DELAY_INTERVAL)
    query()
  }

  if (!arr.length) {
    console.log('[bilibili-app-recommend]: tryAction timeout, selector = %s', selector)
    return
  }

  for (const el of arr) {
    await Promise.resolve(action(el))
  }
}

/**
 * 尝试移除元素
 */

export function tryToRemove(selector: string) {
  return tryAction(selector, (el) => el.remove())
}
