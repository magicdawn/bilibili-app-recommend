/* eslint-disable no-constant-condition */

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
  const timeout = 10 * 1000 // 10s
  const timeoutTs = Date.now() + timeout

  let previousElement: HTMLElement | null = null
  let internalTesting = false

  while (true) {
    if (document.querySelector('.bili-layout > section.bili-grid')) {
      previousElement = document.querySelector('.bili-layout > section.bili-grid')
      break
    }

    if (isInternalTesting() && document.querySelector('.recommended-container')) {
      internalTesting = true
      previousElement = document.querySelector('.recommended-container')
      break
    }

    if (Date.now() > timeoutTs) break
    await sleep(100)
  }

  if (!previousElement) {
    console.error('[bilibili-app-recommend]: init fail')
    return
  }

  // attach to dom
  const recommendContainer = document.createElement('section')
  previousElement.insertAdjacentElement('afterend', recommendContainer)

  // react render
  const root = createRoot(recommendContainer)
  root.render(<SectionRecommend internalTesting={internalTesting} />)
}

/**
 * 是否是内测页面
 */
function isInternalTesting() {
  return (
    document.querySelector<HTMLButtonElement>('button.go-back')?.innerText.trim() === '退出内测'
  )
}
