import { useKeyPress, useMemoizedFn } from 'ahooks'
import { useCallback, useState } from 'react'
//
import { config } from '$settings'
import * as styles from './index.module.less'

interface IOptions {
  enabled: boolean
  refresh: () => void | Promise<void>
  minIndex?: number
  maxIndex: number
}

export function useShortcut({ enabled, refresh, minIndex = 0, maxIndex }: IOptions) {
  // 快捷键
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeIndexIsValid = useMemoizedFn(() => {
    if (activeIndex === null) {
      return false
    }

    const activeCard = document.querySelector<HTMLDivElement>(`${CARDS_SELECTOR}.${styles.active}`)
    const scroller = document.querySelector<HTMLDivElement>(`.${styles.modalBody}`)
    if (!activeCard || !scroller) return false
    const scrollerRect = scroller.getBoundingClientRect()
    const rect = activeCard.getBoundingClientRect()

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
  const open = useMemoizedFn(() => {
    if (!activeIndex || !enabled) return
    openVideoAt(activeIndex)
  })
  const clearActiveIndex = useMemoizedFn(() => {
    if (!enabled) return
    setActiveIndex(null)
  })
  useKeyPress('enter', open)
  useKeyPress('esc', clearActiveIndex)

  // refresh
  const onShortcutRefresh = useMemoizedFn(() => {
    if (!enabled) return
    refresh()
  })
  useKeyPress('r', onShortcutRefresh, { exactMatch: true }) // prevent refresh when cmd+R reload page

  return { activeIndex, clearActiveIndex }
}

function getInitialIndex() {
  const scroller = document.querySelector<HTMLDivElement>(`.${styles.modalBody}`)
  if (!scroller) return 0
  const scrollerRect = scroller.getBoundingClientRect()

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

const CARDS_SELECTOR = `#${styles.videoCardBody} .${styles.card}`
function getCards() {
  return [...document.querySelectorAll<HTMLDivElement>(CARDS_SELECTOR)]
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

// use window.innerHeight as cache key
const countCache = new Map<number, number>()

function getColCount() {
  if (config.useNarrowMode) return 2

  let count = countCache.get(window.innerWidth)
  if (count) {
    return count
  }

  const firstCard = document.querySelector<HTMLDivElement>(CARDS_SELECTOR)
  if (!firstCard) {
    throw new Error('expect found first card')
  }

  count = 1
  const top = firstCard.getBoundingClientRect().top

  let next = firstCard.nextElementSibling
  while (next && next.getBoundingClientRect().top === top) {
    count++
    next = next.nextElementSibling
  }

  countCache.set(window.innerWidth, count)
  return count
}
