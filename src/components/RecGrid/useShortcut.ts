import type { VideoCardEmitter } from '$components/VideoCard'
import { settings } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import type { RefObject } from 'react'
import { useState } from 'react'
import { videoGrid } from '../video-grid.module.scss'
import { CardClassNames } from './index'

interface IOptions {
  enabled: boolean
  refresh: () => void | Promise<void>
  minIndex?: number
  maxIndex: number

  /** 用于获取 cards, 获取 col count */
  containerRef: RefObject<HTMLElement>

  /** 判断 active card 与 scroller 关系, 判定 activeIndex 是否有效 */
  getScrollerRect: () => DOMRect | null | undefined

  /** 调整 scrollY  */
  changeScrollY?: (options: { offset?: number; absolute?: number }) => void

  /** video-card */
  videoCardEmitters: Array<VideoCardEmitter>
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
  videoCardEmitters,
}: IOptions) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const isEnabled = useMemoizedFn(() => {
    if (!enabled) return false
    if (shouldDisableShortcut()) return false
    return true
  })

  const activeIndexIsValid = useMemoizedFn(() => {
    if (typeof activeIndex !== 'number') return false
    if (!containerRef.current) return false

    const scrollerRect = getScrollerRect()
    const rect = containerRef.current
      .querySelector<HTMLDivElement>(`.${CardClassNames.card}.${CardClassNames.cardActive}`)
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

  function getStep(direction: 'up' | 'down'): number {
    const card = getCardAt(activeIndex!)
    const activeLeft = card.getBoundingClientRect().left
    const isLeftSame = (left: number) => Math.abs(activeLeft - left) < 1

    /**
     * quick try +- col-count
     */
    {
      const col = getColumnCount(containerRef.current)
      const step = direction === 'down' ? col : -col
      const newCard = getCardAt(activeIndex! + step)
      if (newCard) {
        const left = newCard.getBoundingClientRect().left
        if (isLeftSame(left)) {
          return step
        }
      }
    }

    /**
     * step by step
     */
    let step = 0
    let cur: Element = card
    const next = () => (direction === 'down' ? cur.nextElementSibling : cur.previousElementSibling)
    while (next()) {
      cur = next()!
      if (!cur.classList.contains(CardClassNames.card)) continue

      direction === 'down' ? step++ : step--
      const left = cur.getBoundingClientRect().left
      if (isLeftSame(left)) {
        return step
      }
    }

    return 0
  }

  const addActiveIndex = (step: number | 'up' | 'down') => (e?: KeyboardEvent) => {
    if (!isEnabled()) return

    // 防止 scroller focus 的情况下, 因键盘产生滑动, 进而页面抖动
    e?.preventDefault()

    let newActiveIndex: number
    if (activeIndexIsValid()) {
      const _step = typeof step === 'number' ? step : getStep(step)
      newActiveIndex = activeIndex! + _step
    } else {
      newActiveIndex = getInitialIndex()
    }

    // overflow
    if (newActiveIndex < minIndex) {
      makeVisible(minIndex)
      return
    }
    if (newActiveIndex > maxIndex) {
      // 滚动到最后一项: 防止不能向下移动, 也不会加载更多, 卡死状态
      makeVisible(maxIndex)
      return
    }

    // console.log({ activeIndex, index, initialIndex: getInitialIndex() })
    setActiveIndex(newActiveIndex)
    makeVisible(newActiveIndex)
  }

  // by 1
  useKeyPress('leftarrow', addActiveIndex(-1), { exactMatch: true })
  useKeyPress('rightarrow', addActiveIndex(1), { exactMatch: true })

  useKeyPress('tab', addActiveIndex(1), { exactMatch: true })
  useKeyPress('shift.tab', addActiveIndex(-1), { exactMatch: true })

  // by row
  // 不使用 getColCount 是因为, Separator 类型导致有空的位置
  useKeyPress('uparrow', addActiveIndex('up'), { exactMatch: true })
  useKeyPress('downarrow', addActiveIndex('down'), { exactMatch: true })

  // actions
  const clearActiveIndex = () => {
    if (!isEnabled()) return
    setActiveIndex(undefined)
  }

  const getActiveEmitter = () => {
    if (!isEnabled() || typeof activeIndex !== 'number') return
    return videoCardEmitters[activeIndex]
  }

  useKeyPress('esc', clearActiveIndex)
  useKeyPress('enter', () => {
    if (!isEnabled() || typeof activeIndex !== 'number') return
    getActiveEmitter()?.emit('open')
  })
  useKeyPress('backspace', () => {
    if (!isEnabled() || typeof activeIndex !== 'number') return
    getActiveEmitter()?.emit('trigger-dislike')
  })

  // 稍候再看
  // s 与 BILIBILI-Envoled 快捷键冲突
  useKeyPress(
    ['s', 'w'],
    () => {
      if (!isEnabled() || typeof activeIndex !== 'number') return
      getActiveEmitter()?.emit('toggle-watch-later')
    },
    { exactMatch: true },
  )

  useKeyPress(
    ['period', 'p'],
    () => {
      if (!isEnabled() || typeof activeIndex !== 'number') return
      getActiveEmitter()?.emit('hotkey-preview-animation')
    },
    { exactMatch: true },
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

  const CARDS_SELECTOR = `.${CardClassNames.card}`
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

  return {
    activeIndex,
    clearActiveIndex,
  }
}

// use window.innerHeight as cache key
const countCache1 = new Map<number, number>()
const countCache2 = new Map<number, number>()

// SectionRecommend 没有 narrow-mode
// RecGrid 有 narrow mode
export function getColumnCount(container?: HTMLElement | null, mayHaveNarrowMode = true) {
  if (mayHaveNarrowMode && settings.useNarrowMode) return 2

  const countCache = settings.styleFancy ? countCache1 : countCache2
  let count = countCache.get(Math.trunc(window.innerWidth))
  if (count) {
    return count
  }

  container ||= document.querySelector<HTMLElement>(`.${videoGrid}`)
  if (!container) return 0

  const style = window.getComputedStyle(container)
  if (style.display !== 'grid') return 0
  count = style.gridTemplateColumns.split(' ').length

  countCache.set(window.innerWidth, count)
  return count
}
