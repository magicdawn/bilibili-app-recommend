import { APP_NAME, APP_NAME_ROOT_CLASSNAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { tryAction, tryToRemove } from '$utility/dom'
import { FloatButton } from 'antd'
import delay from 'delay'
import { createRoot } from 'react-dom/client'
import { PureRecommend } from '../components/PureRecommend'
import { SectionRecommend } from '../components/SectionRecommend'
import { getIsInternalTesting, isSafari } from '../platform'
import { settings } from '../settings'

// in this entry, if no insert point found, render to document body
const isHashEntry = (location.hash || '').startsWith(`#/${APP_NAME}/`)

export async function initHomepage() {
  // 提示有插件影响
  tryToRemove('.adblock-tips')
  // 变灰
  tryAction('html.gray', (el) => el.classList.remove('gray'))

  if (!isHashEntry && document.documentElement.classList.contains('bewly-design')) {
    console.warn(`${APP_NAME}: quit for using bewly-design`)
    return
  }

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

    await delay(200)
  }

  if (!insert) {
    console.error(`[${APP_NAME}]: init fail`)
    return
  }

  // attach to dom
  const recommendContainer = document.createElement('section')
  recommendContainer.classList.add(APP_NAME_ROOT_CLASSNAME)
  insert(recommendContainer)

  // react render
  const root = createRoot(recommendContainer)
  root.render(
    <AntdApp injectGlobalStyle renderAppComponent>
      <SectionRecommend />
    </AntdApp>,
  )

  // header
  // https://github.com/magicdawn/bilibili-app-recommend/issues/30
  // 内测模式 + SectionRecommend, 这个 header channel fixed 样式有问题
  // 尝试修复太复杂了, 这里直接移除. 其功能有替代: 滚动到首页顶部查看分区
  if (getIsInternalTesting()) {
    tryToRemove('.bili-feed4 .header-channel')
  }
}

async function initHomepagePureRecommend() {
  // let bilibili default content run
  if (isSafari) await delay(500)

  // antd 回到顶部
  let renderBackTop = false

  // 旧版 v1, 不做支持
  // 新版 v2,
  // 内测 v3,
  // 内测 bili-feed4
  if (getIsInternalTesting()) {
    tryToRemove('#i_cecream .bili-feed4-layout') // main
    tryToRemove('.bili-feed4 .header-channel')
    // 右侧浮动按钮
    tryToRemove('.palette-button-wrap')
    renderBackTop = true
  }

  // 新版首页(v2)
  else {
    document.querySelector('.bili-layout')?.remove()
    tryToRemove('.bili-footer') // build 版本, .bili-footer 还不存在, 后来出来的

    // rm 分区按钮, 显示其他按钮
    tryToRemove(
      '.palette-button-wrap > .primary-btn',
      (el) => el.innerText.includes('分区'),
      2000,
    ).then(() => {
      document.querySelectorAll('.palette-button-wrap .primary-btn').forEach((el) => {
        el.classList.remove('hidden')
        if (el.classList.contains('top-btn')) el.classList.remove('top-btn')
      })
    })
  }

  const insertFn = (reactContainer: HTMLElement) => document.body.appendChild(reactContainer)

  const biliLayout = document.createElement('div')
  biliLayout.classList.add(
    getIsInternalTesting() ? 'bili-feed4-layout' : 'bili-layout',
    'pure-recommend',
  )
  insertFn(biliLayout)

  const reactContainer = document.createElement('section')
  reactContainer.classList.add(APP_NAME_ROOT_CLASSNAME)
  biliLayout.appendChild(reactContainer)

  // react render
  const root = createRoot(reactContainer)
  root.render(
    <AntdApp injectGlobalStyle renderAppComponent>
      <PureRecommend />
      {renderBackTop && (
        <FloatButton.BackTop
          style={{
            // right
            insetInlineEnd: 'var(--back-top-right, 24px)',
          }}
        />
      )}
    </AntdApp>,
  )
}
