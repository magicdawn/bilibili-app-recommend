// load config first
import './settings'

import { APP_NAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { tryAction, tryToRemove } from '$utility/dom'
import sleep from 'delay'
import { createRoot } from 'react-dom/client'
import './common/global.less'
import { PureRecommend } from './components/PureRecommend'
import { SectionRecommend } from './components/SectionRecommend'
import { getIsInternalTesting } from './platform'
import { settings } from './settings'

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
  const timeoutAt = Date.now() + timeout

  let insert: ((reactNode: HTMLElement) => void) | undefined

  while (Date.now() <= timeoutAt) {
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

    await sleep(200)
  }

  if (!insert) {
    console.error(`[${APP_NAME}]: init fail`)
    return
  }

  // attach to dom
  const recommendContainer = document.createElement('section')
  insert(recommendContainer)

  // react render
  const root = createRoot(recommendContainer)
  root.render(
    <AntdApp>
      <SectionRecommend />
    </AntdApp>
  )
}

async function initHomepagePureRecommend() {
  // 新版 bili-feed4
  if (getIsInternalTesting()) {
    document.querySelector('.bili-feed4 .bili-feed4-layout')?.remove()
    tryToRemove('.bili-feed4 .header-channel')
  } else {
    document.querySelector('.bili-layout')?.remove()
    tryToRemove('.bili-footer') // build 版本, .bili-footer 还不存在, 后来出来的
    tryToRemove('.palette-button-wrap > .primary-btn:first-child') // 分区按钮
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
  root.render(
    <AntdApp>
      <PureRecommend />
    </AntdApp>
  )
}
