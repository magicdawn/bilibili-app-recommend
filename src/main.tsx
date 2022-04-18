import { createRoot } from 'react-dom/client'
import $ from 'jquery'
import { SectionRecommend } from './components/section'
import sleep from 'delay'

// declare global {
//   interface Window {
//     GM_addElement: (tag: string, attributes: Record<string, any>) => void
//   }
// }

// import 'bootstrap/dist/css/bootstrap.min.css'
const bootstrapCss = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'

// fixme
import * as settings from '@settings'
;(unsafeWindow as any).settings = settings

main()
export default async function main() {
  // @ts-ignore
  GM_addElement('link', { rel: 'stylesheet', href: bootstrapCss })

  // 用于获取授权
  if (
    location.href.startsWith('https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?')
  ) {
    window.stop()
    return window.top?.postMessage(location.href, 'https://www.bilibili.com')
  }

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

  // legacy reactdom.render
  // render(<SectionRecommend />, container)

  const root = createRoot(container)
  root.render(<SectionRecommend />)
}
