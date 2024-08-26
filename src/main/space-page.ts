export async function initSpacePage() {
  addDynEntry()
}

function addDynEntry() {
  const mid = parseMid()
  if (!mid) return

  const btn = `<a
    href="https://www.bilibili.com/?dyn-mid=${mid}"
    target="_blank"
    class="h-f-btn"
    style="width: auto; padding-inline: 15px;">BAR-查看动态</a>`

  const container = document.querySelector<HTMLDivElement>('.h-action')
  container?.insertAdjacentHTML('afterbegin', btn)
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
