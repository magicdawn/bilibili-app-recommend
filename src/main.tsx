// load config first
import './settings'

import sleep from 'delay'
import { createRoot } from 'react-dom/client'
import './common/global.less'
import { PureRecommend } from './components/PureRecommend'
import { SectionRecommend } from './components/SectionRecommend'
import { settings } from './settings'
import { getIsInternalTesting } from './platform'
import { tryAction, tryToRemove } from '$utility/dom'

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
  // 提示有插件影响
  tryToRemove('.adblock-tips')
  // 变灰
  tryAction('html.gray', (el) => el.classList.remove('gray'))

  if (settings.pureRecommend) {
    return initHomepagePureRecommend()
  } else {
    return initHomepageSection()
  }
}

async function initHomepageSection() {
  const timeout = 10 * 1000 // 10s
  const timeoutTs = Date.now() + timeout

  let insert: ((reactNode: HTMLElement) => void) | null = null

  /* eslint-disable no-constant-condition */
  while (true) {
    if (document.querySelector('.bili-layout > section.bili-grid')) {
      const previousElement = document.querySelector('.bili-layout > section.bili-grid')
      insert = (reactNode) => previousElement?.insertAdjacentElement('afterend', reactNode)
      break
    }

    if (getIsInternalTesting() && document.querySelector('.bili-feed4-layout')) {
      insert = (reactNode) =>
        document.querySelector('.bili-feed4-layout')?.insertAdjacentElement('afterbegin', reactNode)
      break
    }

    if (Date.now() > timeoutTs) break
    await sleep(200)
  }

  if (!insert) {
    console.error('[bilibili-app-recommend]: init fail')
    return
  }

  // attach to dom
  const recommendContainer = document.createElement('section')
  insert(recommendContainer)

  // react render
  const root = createRoot(recommendContainer)
  root.render(<SectionRecommend />)
}

async function initHomepagePureRecommend() {
  if (getIsInternalTesting()) {
    // 新版 bili-feed4
    document.querySelector('.bili-feed4 .bili-feed4-layout')?.remove()
    tryToRemove('.bili-feed4 .header-channel')
  } else {
    document.querySelector('.bili-layout')?.remove()
    tryToRemove('.bili-footer') // build 版本, .bili-footer 还不存在, 后来出来的
  }

  const biliLayout = document.createElement('div')
  biliLayout.classList.add(
    getIsInternalTesting() ? 'bili-feed4-layout' : 'bili-layout',
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
