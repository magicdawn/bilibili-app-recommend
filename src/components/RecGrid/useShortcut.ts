import { config } from '$settings'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { RefObject, useCallback, useState } from 'react'
import { cls } from './index'

interface IOptions {
  enabled: boolean
  refresh: () => void | Promise<void>
  minIndex?: number
  maxIndex: number
  containerRef: RefObject<HTMLElement>
  getScrollerRect: () => DOMRect | null | undefined
  openDislikeAt: (index: number) => void
}

// 快捷键
export function useShortcut({
  enabled,
  refresh,
  minIndex = 0,
  maxIndex,
  containerRef,
  getScrollerRect,
  openDislikeAt,
}: IOptions) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeIndexIsValid = useMemoizedFn(() => {
    if (activeIndex === null) return false
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

  const addActiveIndex = useMemoizedFn((step: number, e?: KeyboardEvent) => {
    if (!enabled) return

    // 防止 scroller focus 的情况下, 因键盘产生滑动, 进而页面抖动
    e?.preventDefault()

    const index = activeIndexIsValid() ? activeIndex! + step : getInitialIndex()
    // overflow
    if (index < minIndex) {
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
  })

  // by 1
  const prev = useCallback((e: KeyboardEvent) => {
    addActiveIndex(-1, e)
  }, [])
  const next = useCallback((e: KeyboardEvent) => {
    addActiveIndex(1, e)
  }, [])
  useKeyPress('leftarrow', prev)
  useKeyPress('rightarrow', next)

  // by row
  const prevRow = useCallback((e: KeyboardEvent) => {
    addActiveIndex(-getColCount(), e)
  }, [])
  const nextRow = useCallback((e: KeyboardEvent) => {
    addActiveIndex(getColCount(), e)
  }, [])
  useKeyPress('uparrow', prevRow)
  useKeyPress('downarrow', nextRow)

  // actions
  const clearActiveIndex = useMemoizedFn(() => {
    if (!enabled) return
    setActiveIndex(null)
  })
  const open = useMemoizedFn(() => {
    if (!enabled || typeof activeIndex !== 'number') return
    openVideoAt(activeIndex)
  })
  const dislike = useMemoizedFn(() => {
    if (!enabled || typeof activeIndex !== 'number') return
    openDislikeAt(activeIndex)
  })

  useKeyPress('esc', clearActiveIndex)
  useKeyPress('enter', open)
  useKeyPress('backspace', dislike)

  // refresh
  const onShortcutRefresh = useMemoizedFn(() => {
    if (!enabled) return
    refresh()
  })
  useKeyPress('r', onShortcutRefresh, { exactMatch: true }) // prevent refresh when cmd+R reload page

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
  }

  function openVideoAt(index: number) {
    const card = getCardAt(index)
    if (!card) return
    const videoLink = card.querySelector<HTMLAnchorElement>('.bili-video-card__wrap > a')
    videoLink?.click()
  }

  function getColCount() {
    if (config.useNarrowMode) return 2

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
