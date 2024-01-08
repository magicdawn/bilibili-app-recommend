import { baseDebug } from '$common'
import { AUTO_PAGE_FULLSCREEN } from '$components/VideoCard/index.shared'
import delay from 'delay'
import ms from 'ms'

const debug = baseDebug.extend('main:video-play-page')

export function initVideoPlayPage() {
  handleFullscreen()
}

async function handleFullscreen() {
  const autoPageFullscreen =
    new URL(location.href).searchParams.get(AUTO_PAGE_FULLSCREEN.key) === AUTO_PAGE_FULLSCREEN.value
  if (!autoPageFullscreen) return

  // NOTE: aria-label 使用中文, 目前没找到 bilibili.com 在哪切换语言, 应该只有中文
  const getBtn = () => document.querySelector<HTMLElement>('[role="button"][aria-label="网页全屏"]')
  const getCurrentMode = (): PlayerScreenMode =>
    (document.querySelector<HTMLDivElement>('#bilibili-player .bpx-player-container')?.dataset
      .screen as PlayerScreenMode | undefined) || PlayerScreenMode.Normal

  const timeoutAt = Date.now() + ms('30s')
  while (getCurrentMode() !== PlayerScreenMode.WebFullscreen && Date.now() <= timeoutAt) {
    getBtn()?.click()
    await delay(100)
  }
  debug('AUTO_PAGE_FULLSCREEN fulfilled')
}

const enum PlayerScreenMode {
  Normal = 'normal',
  Wide = 'wide',
  WebFullscreen = 'web',
}
