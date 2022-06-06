import { CollapseBtn } from '@components/CollapseBtn'
import { RecItem, RecItemWithUniqId } from '@define'
import { cx } from '@libs'
import { getRecommendTimes, uniqRecList } from '@service'
import { updateConfig, useConfigStore, config } from '@settings'
import { useKeyPress, useMemoizedFn, useSafeState } from 'ahooks'
import delay from 'delay'
import { ChangeEventHandler, memo, useCallback, useMemo, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { BaseModal } from '../BaseModal'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const [items, setItems] = useSafeState<RecItemWithUniqId[]>([])

  const [loading, setLoading] = useSafeState(false)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const refresh = useMemoizedFn(async () => {
    // scroll to top
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }

    // load
    await delay(50)

    try {
      setLoading(true)
      clearActive() // before
      setItems(await getRecommendTimes(2))
      clearActive() // and after
    } finally {
      setLoading(false)
    }
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    const more = await getRecommendTimes(2)
    setItems((items) => [...items, ...more])
  })

  // 窄屏模式
  const { useNarrowMode } = useConfigStore()
  const updateUseNarrowMode: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const val = e.target.checked
    updateConfig({ useNarrowMode: val })
  }, [])
  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  // 快捷键
  const [activeIndex, setActiveIndex] = useSafeState<number | null>(null)

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

  const addActiveIndex = useMemoizedFn((step: number) => {
    if (!show) return

    let index = activeIndexIsValid() ? activeIndex! + step : getInitialIndex()
    // overflow
    if (index < 0 || index > items.length - 1) {
      return
    }

    // console.log({ activeIndex, index, initialIndex: getInitialIndex() })
    setActiveIndex(index)
    makeVisible(index)
  })

  // by 1
  const prev = useCallback(() => {
    addActiveIndex(-1)
  }, [])
  const next = useCallback(() => {
    addActiveIndex(1)
  }, [])

  // by row
  const prevRow = useCallback(() => {
    addActiveIndex(-getColCount())
  }, [])
  const nextRow = useCallback(() => {
    addActiveIndex(getColCount())
  }, [])

  const open = useMemoizedFn(() => {
    if (!activeIndex || !show) return
    openVideoAt(activeIndex)
  })
  const clearActive = useMemoizedFn(() => {
    if (!show) return
    setActiveIndex(null)
  })

  // by 1
  useKeyPress('leftarrow', prev)
  useKeyPress('rightarrow', next)
  // by row
  useKeyPress('uparrow', prevRow)
  useKeyPress('downarrow', nextRow)

  // actions
  useKeyPress('enter', open)
  useKeyPress('esc', clearActive)

  // refresh
  const onShortcutRefresh = useMemoizedFn(() => {
    if (!show) return
    refresh()
  })
  useKeyPress('r', onShortcutRefresh, { exactMatch: true }) // prevent refresh when cmd+R reload page

  return (
    <BaseModal
      {...{ show, onHide }}
      clsModalMask={cx(styles.modalMask, narrowStyleObj)}
      clsModal={cx(styles.modal, narrowStyleObj)}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>推荐</div>

        <div className='space' style={{ flex: 1 }}></div>

        <CollapseBtn>
          <input
            type='checkbox'
            id={styles.useNarrowMode}
            checked={useNarrowMode}
            onChange={updateUseNarrowMode}
          />
          <label htmlFor={styles.useNarrowMode}>启用窄屏模式</label>
        </CollapseBtn>

        <button className={`primary-btn roll-btn ${styles.btnRefresh}`} onClick={refresh}>
          <svg>
            <use xlinkHref='#widget-roll'></use>
          </svg>
          <span>换一换</span>
        </button>

        <button className={`primary-btn roll-btn ${styles.btnClose}`} onClick={onHide}>
          <svg>
            <use xlinkHref='#widget-close'></use>
          </svg>
          <span>关闭</span>
        </button>
      </div>

      <div className={styles.modalBody} ref={scrollerRef}>
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchMore}
          hasMore={true}
          useWindow={false}
          threshold={360} // 差不多一行高度
          style={{ minHeight: '100%' }}
          loader={
            <div className={styles.loader} key={0}>
              加载中...
            </div>
          }
        >
          <div className={`video-card-list is-full ${styles.videoCardList}`}>
            <div id={styles.videoCardBody} className={cx('video-card-body', narrowStyleObj)}>
              {items.map((item, index) => {
                return (
                  <VideoCard
                    key={item.uniqId}
                    item={item}
                    loading={loading}
                    className={cx(styles.card, { [styles.active]: index === activeIndex })}
                  />
                )
              })}
            </div>
          </div>
        </InfiniteScroll>
      </div>
    </BaseModal>
  )
})

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
  let top = firstCard.getBoundingClientRect().top

  let next = firstCard.nextElementSibling
  while (next && next.getBoundingClientRect().top === top) {
    count++
    next = next.nextElementSibling
  }

  countCache.set(window.innerWidth, count)
  return count
}
