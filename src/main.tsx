// load config first
import './settings'

import sleep from 'delay'
import { createRoot } from 'react-dom/client'
import './common/global.less'
import { PureRecommend } from './components/PureRecommend'
import { SectionRecommend } from './components/SectionRecommend'
import { config } from './settings'
import { isInternalTesting } from './platform'

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
  if (config.pureRecommend) {
    return initHomepagePureRecommend()
  } else {
    return initHomepageSection()
  }
}

async function initHomepageSection() {
  const timeout = 10 * 1000 // 10s
  const timeoutTs = Date.now() + timeout

  let previousElement: HTMLElement | null = null
  let internalTesting = false

  /* eslint-disable no-constant-condition */
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
  root.render(<SectionRecommend />)
}

async function initHomepagePureRecommend() {
  document.querySelector('.bili-layout')?.remove()
  document.querySelector('.bili-footer')?.remove()

  // 新版 bili-feed4
  document.querySelector('.bili-feed4 .header-channel')?.remove()
  document.querySelector('.bili-feed4 .bili-feed4-layout')?.remove()

  const biliLayout = document.createElement('div')
  biliLayout.classList.add(
    isInternalTesting() ? 'bili-feed4-layout' : 'bili-layout',
    'pure-recommend'
  )

  const header = document.querySelector('.bili-header')
  header?.insertAdjacentElement('afterend', biliLayout)

  const recommendContainer = document.createElement('section')
  biliLayout?.appendChild(recommendContainer)

  // react render
  const root = createRoot(recommendContainer)
  root.render(<PureRecommend />)
}
