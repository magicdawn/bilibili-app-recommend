import { APP_NAME, __PROD__ } from '$common'
import { useRefState } from '$common/hooks/useRefState'
import { settings } from '$modules/settings'
import { useEventListener, useMemoizedFn, useRafState, useUnmountedRef } from 'ahooks'
import delay from 'delay'
import type { MouseEvent } from 'react'

const HOVER_DELAY = 800

/**
 * 自动以动画方式预览
 */
export function usePreviewAnimation({
  bvid,
  title,
  autoPreviewWhenHover,
  active,
  tryFetchVideoData,
  videoPreviewWrapperRef,
}: {
  bvid: string
  title: string
  autoPreviewWhenHover: boolean
  active: boolean
  tryFetchVideoData: () => Promise<void>
  videoPreviewWrapperRef: RefObject<HTMLDivElement>
}) {
  const DEBUG_ANIMATION = __PROD__
    ? false
    : // free to change
      false

  const [previewAnimationProgress, setPreviewAnimationProgress] = useRafState<number | undefined>(
    undefined,
  )

  const [mouseMoved, setMouseMoved] = useState(false)

  // 在 pvideodata 加载的时候, useHover 会有变化, so 使用 mouseenter/mouseleave 自己处理
  const [isHovering, setIsHovering, getIsHovering] = useRefState(false)
  const [isHoveringAfterDelay, setIsHoveringAfterDelay, getIsHoveringAfterDelay] =
    useRefState(false)
  const startByHover = useRef(false)

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
      setIsHovering(true)
      updateMouseEnterRelativeX(e)

      await tryFetchVideoData()
      if (settings.useDelayForHover) {
        await delay(HOVER_DELAY)
      }

      // mouse leave after delay
      if (!getIsHovering()) return

      // set delay flag
      setIsHoveringAfterDelay(true)

      // start preview animation
      if (autoPreviewWhenHover && !idRef.current) {
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
      setIsHovering(false)
      setIsHoveringAfterDelay(false)
    },
    { target: videoPreviewWrapperRef },
  )

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      setMouseMoved(true)

      // update mouse enter state in mouseenter-delay
      if (isHovering && !isHoveringAfterDelay) {
        updateMouseEnterRelativeX(e)
      }

      if (!autoPreviewWhenHover) {
        stopAnimation()
      }
    },
    { target: videoPreviewWrapperRef },
  )

  const unmounted = useUnmountedRef()

  // raf id
  const idRef = useRef<number | undefined>(undefined)

  // 停止动画
  //  鼠标动了
  //  不再 active
  //  组件卸载了
  const shouldStopAnimation = useMemoizedFn(() => {
    if (unmounted.current) return true

    // mixed keyboard & mouse control
    if (autoPreviewWhenHover) {
      if (startByHover.current) {
        if (!getIsHovering()) return true
      } else {
        if (!active) return true
      }
    }

    // normal keyboard control
    else {
      if (!active) return true
      if (mouseMoved) return true
    }

    return false
  })

  const stopAnimation = useMemoizedFn((isClear = false) => {
    if (!isClear && DEBUG_ANIMATION) {
      console.log(`[${APP_NAME}]: [animation] stopAnimation: %o`, {
        autoPreviewWhenHover,
        unmounted: unmounted.current,
        isHovering: getIsHovering(),
        active,
        mouseMoved,
      })
    }

    if (idRef.current) cancelAnimationFrame(idRef.current)
    idRef.current = undefined
    setPreviewAnimationProgress(undefined)
    setAnimationPaused(false)
  })

  const [animationPaused, setAnimationPaused, getAnimationPaused] = useRefState(false)

  const resumeAnimationInner = useRef<(progress: number) => void>()

  const onHotkeyPreviewAnimation = useMemoizedFn(async () => {
    // console.log('hotkey preview', animationPaused)
    if (!idRef.current) {
      await tryFetchVideoData()
      onStartPreviewAnimation()
      return
    }

    // toggle
    setAnimationPaused((val) => !val)

    if (animationPaused) {
      // to resume
      resumeAnimationInner.current?.(previewAnimationProgress || 0)
    } else {
      // to pause
    }
  })

  const getProgress = useMemoizedFn(() => {
    return previewAnimationProgress || 0
  })

  const onStartPreviewAnimation = useMemoizedFn((_startByHover = false) => {
    startByHover.current = _startByHover
    setMouseMoved(false)
    setAnimationPaused(false)
    // tryFetchVideoData()
    stopAnimation(true) // clear existing
    setPreviewAnimationProgress((val) => (typeof val === 'undefined' ? 0 : val)) // get rid of undefined

    // ms
    const runDuration = 8000
    const updateProgressInterval = () =>
      typeof settings.autoPreviewUpdateInterval === 'number'
        ? settings.autoPreviewUpdateInterval
        : 400

    let start = performance.now()
    let lastUpdateAt = 0

    // 闭包这里获取不到最新 previewAnimationProgress
    resumeAnimationInner.current = () => {
      start = performance.now() - getProgress() * runDuration
    }

    function frame(t: number) {
      // console.log('in raf run %s', t)
      // 停止动画
      if (shouldStopAnimation()) {
        stopAnimation()
        return
      }

      const update = () => {
        const elapsed = performance.now() - start
        const p = Math.min((elapsed % runDuration) / runDuration, 1)
        // console.log('p', p)
        setPreviewAnimationProgress(p)
      }

      if (!getAnimationPaused()) {
        if (updateProgressInterval()) {
          if (!lastUpdateAt || performance.now() - lastUpdateAt >= updateProgressInterval()) {
            lastUpdateAt = performance.now()
            update()
          }
        } else {
          update()
        }
      }

      idRef.current = requestAnimationFrame(frame)
    }

    idRef.current = requestAnimationFrame(frame)
  })

  return {
    onHotkeyPreviewAnimation,
    onStartPreviewAnimation,
    previewAnimationProgress,
    isHovering,
    isHoveringAfterDelay,
    mouseEnterRelativeX,
  }
}
