// import order matters
import 'virtual:vite-react-preamble'
import './settings' // load config

import sleep from 'delay'
import { createRoot } from 'react-dom/client'
import { SectionRecommend } from './components/SectionRecommend'

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

  const has = () => document.querySelectorAll('.bili-layout > section.bili-grid').length > 0
  while (!has() && Date.now() - start < timeout) {
    await sleep(100)
  }
  if (!has()) {
    console.error('[bilibili-app-recommend]: init fail')
    return
  }

  const firstSection = document.querySelector('.bili-layout > section.bili-grid')
  const recommendContainer = document.createElement('section')
  firstSection?.insertAdjacentElement('afterend', recommendContainer)

  const root = createRoot(recommendContainer)
  root.render(<SectionRecommend />)
}
