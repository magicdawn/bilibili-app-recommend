import { baseDebug } from '$common'
import { antdCss } from '$common/emotion-css'
import { AntdApp } from '$components/AntdApp'
import {
  PLAYER_SCREEN_MODE,
  PlayerScreenMode,
  VideoLinkOpenModeConfig,
} from '$components/VideoCard/index.shared'
import { openInPipOrPopup } from '$components/VideoCard/use/useOpenRelated'
import { Button } from 'antd'
import delay from 'delay'
import ms from 'ms'
import type { MouseEventHandler } from 'react'

const debug = baseDebug.extend('main:video-play-page')

export function initVideoPlayPage() {
  handleFullscreen()
  addOpenInPipWindowButton()
}

/**
 * 创意来源: https://github.com/hakadao/BewlyBewly/issues/101#issuecomment-1874308120
 * 试用了下, 感觉不错, 在本脚本里实现了
 */

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

  // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
}

async function addOpenInPipWindowButton() {
  if (window.top !== window) {
    // inside a iframe
    return
  }

  await delay(1000)
  const el = document.createElement('div')
  document
    .querySelector<HTMLDivElement>(
      '.video-info-meta .video-info-detail-list.video-info-detail-content',
    )
    ?.appendChild(el)

  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    // make it pause
    const currentPaused = !!document.querySelectorAll<HTMLDivElement>(
      '#bilibili-player .bpx-player-container.bpx-state-paused',
    ).length
    if (!currentPaused) {
      document
        .querySelector<HTMLElement>('#bilibili-player [role="button"][aria-label="播放/暂停"]')
        ?.click()
    }

    // open in pipwindow
    const u = new URL(location.href)
    u.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.WebFullscreen)
    const newHref = u.href
    openInPipOrPopup(newHref, '')
  }

  const root = createRoot(el)
  root.render(
    <>
      <AntdApp>
        <Button size='small' css={antdCss.btn} onClick={handleClick}>
          {VideoLinkOpenModeConfig.Popup.icon}
          <span css={{ marginLeft: 4 }}>{VideoLinkOpenModeConfig.Popup.label}</span>
        </Button>
      </AntdApp>
    </>,
  )
}
