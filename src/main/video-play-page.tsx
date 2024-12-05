import { baseDebug } from '$common'
import { AntdApp } from '$components/AntdApp'
import {
  ForceAutoPlay,
  PlayerScreenMode,
  QueryKey,
  VideoLinkOpenModeConfig,
} from '$components/VideoCard/index.shared'
import {
  hasDocumentPictureInPicture,
  openInPipOrPopup,
} from '$components/VideoCard/use/useOpenRelated'
import { getBiliPlayer } from '$modules/bilibili/player'
import { getBiliPlayerConfigAutoPlay } from '$modules/bilibili/player-config'
import { onVideoChange } from '$modules/bilibili/video-page'
import { css } from '@emotion/react'
import { Button } from 'antd'
import { delay } from 'es-toolkit'
import ms from 'ms'

const debug = baseDebug.extend('main:video-play-page')

export async function initVideoPlayPage() {
  // open in pipwindow
  if (hasDocumentPictureInPicture) {
    // GM command
    registerOpenInPipCommand()

    // 按钮, 但会导致闪一下, 然后按钮没了. 可能类似 ssr dehydrate
    // addOpenInPipWindowButton()
  }

  await handleFullscreen()
  await handleForceAutoPlay()
}

/**
 * 创意来源: https://github.com/hakadao/BewlyBewly/issues/101#issuecomment-1874308120
 * 试用了下, 感觉不错, 在本脚本里实现了
 */

async function handleFullscreen() {
  const targetMode = new URL(location.href).searchParams.get(QueryKey.PlayerScreenMode)
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
    debug('current mode: %s', getCurrentMode())
    action?.()
    await delay(100)
  }
  debug('handleFullscreen to %s complete', targetMode)

  // Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
}

async function handleForceAutoPlay() {
  // already on
  if (getBiliPlayerConfigAutoPlay()) return
  // no need
  const isON = new URL(location.href).searchParams.get(QueryKey.ForceAutoPlay) === ForceAutoPlay.ON
  if (!isON) return

  const playing = (): boolean => {
    const player = getBiliPlayer()
    return !!player && !player.isPaused()
  }

  const timeoutAt = Date.now() + ms('30s')
  while (Date.now() <= timeoutAt && !playing()) {
    getBiliPlayer()?.play()
    await delay(1000)
  }
  debug('handleForceAutoPlay complete, playing = %s', playing())
}

function pausePlayingVideoAndOpenInPipWindow() {
  // make it pause
  const player = getBiliPlayer()
  if (player && !player.isPaused()) {
    player.pause()
  }

  // open in pipwindow
  const u = new URL(location.href)
  u.searchParams.set(QueryKey.PlayerScreenMode, PlayerScreenMode.WebFullscreen)
  const newHref = u.href
  openInPipOrPopup(newHref, '')
}

function registerOpenInPipCommand() {
  GM.registerMenuCommand?.('🎦 小窗打开', () => {
    pausePlayingVideoAndOpenInPipWindow()
  })
}

async function addOpenInPipWindowButton() {
  if (window.top !== window) {
    // inside a iframe
    return
  }

  const el = document.createElement('div')

  onVideoChange(async () => {
    await delay(1500)
    document
      .querySelector<HTMLDivElement>(
        '.video-info-meta .video-info-detail-list.video-info-detail-content',
      )
      ?.appendChild(el)
  })

  const root = createRoot(el)
  root.render(
    <>
      <AntdApp>
        <Button
          size='small'
          css={css`
            height: 22px;
            line-height: 22px;
            gap: 0;
          `}
          onClick={pausePlayingVideoAndOpenInPipWindow}
        >
          {VideoLinkOpenModeConfig.Popup.icon}
          <span css={{ marginLeft: 4 }}>{VideoLinkOpenModeConfig.Popup.label}</span>
        </Button>
      </AntdApp>
    </>,
  )
}
