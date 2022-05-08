import { createRoot } from 'react-dom/client'
import $ from 'jquery'
import { SectionRecommend } from './components/section'
import sleep from 'delay'

void (function main() {
  // 用于获取授权
  if (
    location.href.startsWith('https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?')
  ) {
    window.stop()
    return window.top?.postMessage(location.href, 'https://www.bilibili.com')
  }

  if (location.pathname === '/') {
    return initHomepage()
  }
})()

async function initHomepage() {
  const start = Date.now()
  const timeout = 10 * 1000 // 10s

  const has = () => $('.bili-layout > section.bili-grid').length > 0
  while (!has() && Date.now() - start < timeout) {
    await sleep(100)
  }
  if (!has()) {
    console.error('[bilibili-app-recommend]: init fail')
    return
  }

  const firstSection = $('.bili-layout > section.bili-grid').eq(0)
  const recommendSection = $('<section></section>')
  recommendSection.insertAfter(firstSection)
  const container = recommendSection[0]

  const root = createRoot(container)
  root.render(<SectionRecommend />)
}
