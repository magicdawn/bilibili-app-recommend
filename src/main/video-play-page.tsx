/**
 * 创意来源: https://github.com/hakadao/BewlyBewly/issues/101#issuecomment-1874308120
 * 试用了下, 感觉不错, 在本脚本里实现了
 */

import { baseDebug } from '$common'
import { PLAYER_SCREEN_MODE, PlayerScreenMode } from '$components/VideoCard/index.shared'
import delay from 'delay'
import ms from 'ms'

const debug = baseDebug.extend('main:video-play-page')

export function initVideoPlayPage() {
  handleFullscreen()
}

async function handleFullscreen() {
  const targetMode = new URL(location.href).searchParams.get(PLAYER_SCREEN_MODE)
  const next =
    targetMode === PlayerScreenMode.WebFullscreen || targetMode === PlayerScreenMode.Fullscreen
  if (!next) return

  let action: (() => void) | undefined
  // NOTE: aria-label 使用中文, 目前没找到 bilibili.com 在哪切换语言, 应该只有中文
  if (targetMode === PlayerScreenMode.WebFullscreen) {
    action = () =>
      document.querySelector<HTMLElement>('[role="button"][aria-label="网页全屏"]')?.click()
  }
  if (targetMode === PlayerScreenMode.Fullscreen) {
    action = () =>
      document.querySelector<HTMLElement>('[role="button"][aria-label="全屏"]')?.click()
  }

  const getCurrentMode = (): PlayerScreenMode =>
    (document.querySelector<HTMLDivElement>('#bilibili-player .bpx-player-container')?.dataset
      .screen as PlayerScreenMode | undefined) || PlayerScreenMode.Normal

  const timeoutAt = Date.now() + ms('30s')
  while (getCurrentMode() !== targetMode && Date.now() <= timeoutAt) {
    action?.()
    await delay(100)
  }
  debug('handleFullscreen to %s complete', targetMode)
}
