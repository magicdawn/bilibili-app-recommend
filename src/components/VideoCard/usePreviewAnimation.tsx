import { APP_NAME, __PROD__ } from '$common'
import { useRef$, useRefState$ } from '$common/hooks/useRefState'
import { settings } from '$modules/settings'
import { minmax } from '$utility/num'
import { useEventListener, useMemoizedFn, useRafState, useUnmountedRef } from 'ahooks'
import delay from 'delay'
import type { MouseEvent } from 'react'
import type { VideoData } from './card.service'

const HOVER_DELAY = 800

/**
 * 自动以动画方式预览
 */
export function usePreviewAnimation({
  bvid,
  title,
  active,
  videoDuration,
  tryFetchVideoData,
  accessVideoData,
  autoPreviewWhenHover,
  videoPreviewWrapperRef,
}: {
  bvid: string
  title: string
  active: boolean
  videoDuration: number
  tryFetchVideoData: () => Promise<void>
  accessVideoData: () => VideoData | null
  autoPreviewWhenHover: boolean
  videoPreviewWrapperRef: RefObject<HTMLDivElement>
}) {
  const DEBUG_ANIMATION = __PROD__
    ? false
    : // free to change
      false

  const hasVideoData = useMemoizedFn(() => {
    return Boolean(accessVideoData()?.videoshotData)
  })

  const [previewProgress, setPreviewProgress] = useRafState<number | undefined>()
  const [previewT, setPreviewT] = useRafState<number | undefined>()
  const getProgress = useMemoizedFn(() => previewProgress || 0)
  const getT = useMemoizedFn(() => previewT || 0)

  const [mouseMoved, setMouseMoved] = useState(false)

  // 在 pvideodata 加载的时候, useHover 会有变化, so 使用 mouseenter/mouseleave 自己处理
  const $isHovering = useRefState$(false)
  const $isHoveringAfterDelay = useRefState$(false)
  const $startByHover = useRef$(false)

  // mouseenter cursor state
  const [mouseEnterRelativeX, setMouseEnterRelativeX] = useState<number | undefined>(undefined)
  const updateMouseEnterRelativeX = (e: MouseEvent) => {
    const rect = videoPreviewWrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    // https://github.com/alibaba/hooks/blob/v3.7.0/packages/hooks/src/useMouse/index.ts#L62
    const { x } = rect
    const relativeX = e.pageX - window.pageXOffset - x
    setMouseEnterRelativeX(relativeX)
  }

  useEventListener(
    'mouseenter',
    async (e) => {
      $isHovering.set(true)
      updateMouseEnterRelativeX(e)

      await tryFetchVideoData()
      if (settings.useDelayForHover) {
        await delay(HOVER_DELAY)
      }

      // mouse leave after delay
      if (!$isHovering.val) return

      // set delay flag
      $isHoveringAfterDelay.set(true)

      // start preview animation
      if (autoPreviewWhenHover && !idRef.current && hasVideoData()) {
        DEBUG_ANIMATION &&
          console.log(
            `[${APP_NAME}]: [animation] mouseenter onStartPreviewAnimation bvid=%s title=%s`,
            bvid,
            title,
          )
        onStartPreviewAnimation(true)
      }
    },
    { target: videoPreviewWrapperRef },
  )
  useEventListener(
    'mouseleave',
    (e) => {
      $isHovering.set(false)
      $isHoveringAfterDelay.set(false)
    },
    { target: videoPreviewWrapperRef },
  )

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      setMouseMoved(true)

      // update mouse enter state in mouseenter-delay
      if ($isHovering.val && !$isHoveringAfterDelay.val) {
        updateMouseEnterRelativeX(e)
      }

      if (!autoPreviewWhenHover) {
        __stop()
      }
    },
    { target: videoPreviewWrapperRef },
  )

  const unmounted = useUnmountedRef()

  // raf id
  const idRef = useRef<number | undefined>(undefined)

  // 停止动画
  //  - 鼠标动了
  //  - 不再 active
  //  - 组件卸载了
  const __shouldStop = useMemoizedFn(() => {
    if (unmounted.current) return true

    // mouse
    if ($startByHover.val) {
      if (!$isHovering.val) return true
    }
    // normal keyboard control
    else {
      if (!active) return true
      if (mouseMoved) return true
    }

    return false
  })

  const __stop = useMemoizedFn((isClear = false) => {
    if (!isClear && DEBUG_ANIMATION) {
      console.log(`[${APP_NAME}]: [animation] stopAnimation: %o`, {
        autoPreviewWhenHover,
        unmounted: unmounted.current,
        isHovering: $isHovering.val,
        active,
        mouseMoved,
      })
    }

    if (idRef.current) cancelAnimationFrame(idRef.current)
    idRef.current = undefined
    setPreviewProgress(undefined)
    setPreviewT(undefined)
    animationController.reset()
  })

  const __resumeRef = useRef<() => void>()

  const __$paused = useRefState$(false)

  const animationController = {
    shouldStop: __shouldStop,
    stop: __stop,

    get paused() {
      return __$paused.val
    },
    set paused(val: boolean) {
      __$paused.val = val
    },
    togglePaused() {
      const prev = this.paused
      this.paused = !this.paused
      if (prev) {
        // to resume
        __resumeRef.current?.()
      } else {
        // to pause
      }
    },
    reset() {
      this.paused = false
    },
  }

  const onHotkeyPreviewAnimation = useMemoizedFn(async () => {
    // console.log('hotkey preview', animationPaused)
    if (!idRef.current) {
      await tryFetchVideoData()
      if (hasVideoData()) {
        onStartPreviewAnimation()
      }
      return
    }

    // toggle
    animationController.togglePaused()
  })

  const onStartPreviewAnimation = useMemoizedFn((startByHover = false) => {
    $startByHover.set(startByHover)
    setMouseMoved(false)
    animationController.reset()
    animationController.stop(true) // clear existing

    setPreviewProgress((val) => (typeof val === 'undefined' ? 0 : val)) // get rid of undefined
    setPreviewT(undefined)

    // total ms
    const runDuration = 8000
    const durationBoundary = [8_000, 16_000] as const
    {
      const data = accessVideoData()
      if (data) {
        // const imgLen = data.videoshotData.index.length
        // runDuration = minmax(imgLen * 400, ...durationBoundary)
      }
    }

    const getInterval = () => {
      return settings.autoPreviewUpdateInterval
    }

    let start = performance.now()
    let tUpdateAt = 0

    // resume()'s implementation, 闭包这里获取不到最新 previewAnimationProgress
    __resumeRef.current = () => {
      start = performance.now() - getProgress() * runDuration
    }

    function frame(t: number) {
      // stop
      if (animationController.shouldStop()) {
        animationController.stop()
        return
      }

      if (!animationController.paused) {
        const now = performance.now()
        const elapsed = now - start
        const p = minmax((elapsed % runDuration) / runDuration, 0, 1)

        // progress 一直动影响注意力, 但跳动感觉也不好, ...
        // setPreviewProgress(p)

        if (!tUpdateAt || now - tUpdateAt >= getInterval()) {
          setPreviewProgress(p)

          tUpdateAt = now
          if (videoDuration) {
            const t = minmax(Math.round(p * videoDuration), 0, videoDuration)
            setPreviewT(t)
          }
        }
      }

      idRef.current = requestAnimationFrame(frame)
    }

    idRef.current = requestAnimationFrame(frame)
  })

  return {
    onHotkeyPreviewAnimation,
    onStartPreviewAnimation,
    previewProgress,
    previewT,
    isHovering: $isHovering.state,
    isHoveringAfterDelay: $isHoveringAfterDelay.state,
    mouseEnterRelativeX,
  }
}
