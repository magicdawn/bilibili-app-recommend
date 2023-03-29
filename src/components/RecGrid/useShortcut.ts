import { VideoCardActions } from '$components/VideoCard'
import { settings } from '$settings'
import { isCurrentTyping } from '$utility/dom'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { RefObject, useState } from 'react'
import { cls } from './index'

interface IOptions {
  enabled: boolean
  refresh: () => void | Promise<void>
  minIndex?: number
  maxIndex: number

  /** 用于获取 cards */
  containerRef: RefObject<HTMLElement>

  /** 判断 active card 与 scroller 关系, 判定 activeIndex 是否有效 */
  getScrollerRect: () => DOMRect | null | undefined

  /** 调整 scrollY  */
  changeScrollY?: (options: { offset?: number; absolute?: number }) => void

  /** video-card */
  videoCardRefs: Array<VideoCardActions | undefined | null>
}

// 快捷键
export function useShortcut({
  enabled,
  refresh,
  minIndex = 0,
  maxIndex,
  containerRef,
  getScrollerRect,
  changeScrollY,
  videoCardRefs,
}: IOptions) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const isEnabled = useMemoizedFn(() => {
    if (!enabled) return false
    if (isCurrentTyping()) return false
    return true
  })

  const activeIndexIsValid = useMemoizedFn(() => {
    if (typeof activeIndex !== 'number') return false
    if (!containerRef.current) return false

    const scrollerRect = getScrollerRect()
    const rect = containerRef.current
      .querySelector<HTMLDivElement>(`.${cls.card}.${cls.cardActive}`)
      ?.getBoundingClientRect()
    if (!scrollerRect || !rect) return false

    // active 在 scroller 上方, 超过一屏
    if (rect.top - scrollerRect.top < -(scrollerRect.height + rect.height)) {
      return false
    }
    // active 在 scroller 下方, 超过一屏
    if (rect.top - scrollerRect.top > scrollerRect.height * 2 + rect.height) {
      return false
    }

    return true
  })

  const addActiveIndex = (step: number | (() => number)) => (e?: KeyboardEvent) => {
    if (!isEnabled()) return

    // 防止 scroller focus 的情况下, 因键盘产生滑动, 进而页面抖动
    e?.preventDefault()

    let _step = typeof step === 'number' ? step : step()
    const index = activeIndexIsValid() ? activeIndex! + _step : getInitialIndex()

    // overflow
    if (index < minIndex) {
      makeVisible(minIndex)
      return
    }
    if (index > maxIndex) {
      // 滚动到最后一项: 防止不能向下移动, 也不会加载更多, 卡死状态
      makeVisible(maxIndex)
      return
    }

    // console.log({ activeIndex, index, initialIndex: getInitialIndex() })
    setActiveIndex(index)
    makeVisible(index)
  }

  // by 1
  useKeyPress('leftarrow', addActiveIndex(-1), { exactMatch: true })
  useKeyPress('rightarrow', addActiveIndex(1), { exactMatch: true })
  // by row
  // 在 render 时调用 getColCount 会出现 useNarrowMode:false, UI 还没更新, 返回还是两列的情况
  useKeyPress(
    'uparrow',
    addActiveIndex(() => -getColCount()),
    { exactMatch: true }
  )
  useKeyPress('downarrow', addActiveIndex(getColCount), { exactMatch: true })

  // actions
  const clearActiveIndex = () => {
    if (!isEnabled()) return
    setActiveIndex(undefined)
  }

  useKeyPress('esc', clearActiveIndex)
  useKeyPress('enter', () => {
    if (!isEnabled() || typeof activeIndex !== 'number') return
    openVideoAt(activeIndex)
  })
  useKeyPress('backspace', () => {
    if (!isEnabled() || typeof activeIndex !== 'number') return
    videoCardRefs[activeIndex]?.onTriggerDislike()
  })

  // 稍候再看
  // s 与 BILIBILI-Envoled 快捷键冲突
  useKeyPress(
    ['s', 'w'],
    () => {
      if (!isEnabled() || typeof activeIndex !== 'number') return
      videoCardRefs[activeIndex]?.onToggleWatchLater()
    },
    { exactMatch: true }
  )

  useKeyPress(
    ['period', 'p'],
    () => {
      if (!isEnabled() || typeof activeIndex !== 'number') return
      videoCardRefs[activeIndex]?.onStartPreviewAnimation()
    },
    { exactMatch: true }
  )

  function getInitialIndex() {
    const scrollerRect = getScrollerRect()
    if (!scrollerRect) return 0

    const cards = getCards()
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const rect = card.getBoundingClientRect()

      // first fully visible card
      if (rect.top >= scrollerRect.top) {
        return i
      }
    }

    return 0
  }

  const CARDS_SELECTOR = `.${cls.card}`
  function getCards() {
    return [...(containerRef.current?.querySelectorAll<HTMLDivElement>(CARDS_SELECTOR) || [])]
  }
  function getCardAt(index: number) {
    return getCards()[index]
  }

  function makeVisible(index: number) {
    const card = getCardAt(index)
    ;(card as any)?.scrollIntoViewIfNeeded?.(false)

    /**
     * for PureRecommend 手动检测
     */
    const scrollerRect = getScrollerRect()
    const rect = card.getBoundingClientRect()
    if (!scrollerRect || !rect) return

    // 上部遮挡
    if (rect.top <= scrollerRect.top) {
      const offset = -(scrollerRect.top - rect.top + 10)
      changeScrollY?.({ offset })
      return
    }
    // 下面
    if (scrollerRect.bottom - rect.bottom < 10) {
      const offset = 10 - (scrollerRect.bottom - rect.bottom)
      changeScrollY?.({ offset })
      return
    }
  }

  function openVideoAt(index: number) {
    const card = getCardAt(index)
    if (!card) return
    const videoLink = card.querySelector<HTMLAnchorElement>('.bili-video-card__wrap > a')
    videoLink?.click()
  }

  function getColCount() {
    if (settings.useNarrowMode) return 2

    let count = countCache.get(window.innerWidth)
    if (count) {
      return count
    }

    const container = containerRef.current
    if (!container) return 0
    const style = window.getComputedStyle(container)
    if (style.display !== 'grid') return 0
    count = style.gridTemplateColumns.split(' ').length

    countCache.set(window.innerWidth, count)
    return count
  }

  return { activeIndex, clearActiveIndex }
}

// use window.innerHeight as cache key
const countCache = new Map<number, number>()
