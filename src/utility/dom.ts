import delay from 'delay'

const timeout = 10 * 1000

export async function tryToRemove(selector: string) {
  let arr: HTMLElement[] = []
  const query = () => {
    arr = Array.from(document.querySelectorAll<HTMLElement>(selector))
  }

  const start = performance.now()
  let elapsed = 0
  while (!arr.length && (elapsed = performance.now() - start) < timeout) {
    await delay(100)
    query()
  }

  arr.forEach((el) => {
    el.remove()
  })
}
