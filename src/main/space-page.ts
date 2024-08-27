import { tryAction } from '$utility'

export async function initSpacePage() {
  addDynEntry()
}

async function addDynEntry() {
  const mid = parseMid()
  if (!mid) return

  const btnHtml = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    target="_blank"
    class="h-f-btn"
    style="width: auto; padding-inline: 15px;">BAR-查看动态</a>`

  await tryAction(
    '.h-action',
    (container) => container?.insertAdjacentHTML('afterbegin', btnHtml),
    {
      pollTimeout: 10_000,
      pollInterval: 1_000,
    },
  )
}

function parseMid() {
  const url = new URL(location.href)
  const mid = url.pathname
    .split('/')
    .map((x) => x.trim())
    .filter((x) => x)[0]
  if (!mid || !/^\d+$/.test(mid)) return
  return mid
}
