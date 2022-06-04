import { CollapseBtn } from '@components/CollapseBtn'
import { RecItem } from '@define'
import { cx } from '@libs'
import { getRecommendTimes } from '@service'
import { updateConfig, useConfigStore } from '@settings'
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
  const [items, setItems] = useSafeState<RecItem[]>([])

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
      setItems(await getRecommendTimes(2))
      clearActive()
    } finally {
      setLoading(false)
    }
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    let more = await getRecommendTimes(2)
    const set = new Set(items.map((item) => item.param))
    more = more.filter((item) => {
      return !set.has(item.param)
    })
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

  const addActiveIndex = useMemoizedFn((step: number) => {
    if (!show) return

    let index = activeIndex === null ? getInitialIndex() : activeIndex + step
    if (index < 0) index = 0
    if (index > items.length - 1) index = items.length - 1

    // console.log({ activeIndex, index, initialIndex: getInitialIndex() })
    setActiveIndex(index)
    makeVisible(index)
  })

  const prev = useCallback(() => {
    addActiveIndex(-1)
  }, [])
  const next = useCallback(() => {
    addActiveIndex(1)
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
  useKeyPress('uparrow', prev)
  useKeyPress('downarrow', next)

  // actions
  useKeyPress('enter', open)
  useKeyPress('esc', clearActive)

  // refresh
  const onShortcutRefresh = useMemoizedFn(() => {
    if (!show) return
    refresh()
  })
  useKeyPress('r', onShortcutRefresh, { exactMatch: true }) // prevent refresh when cmd+R reload page

  // TODO: vim mode
  // h 向左移动一个字符。
  // j 向下移动一个字符。
  // k 向上移动一个字符。
  // l 向右移动一个字符。

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
          threshold={320} // 差不多一行高度
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
                    key={item.param}
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

  const cards = [...document.querySelectorAll<HTMLDivElement>(`.${styles.card}`)]
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

function getCardAt(index: number) {
  const cards = [...document.querySelectorAll<HTMLDivElement>(`.${styles.card}`)]
  return cards[index]
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

// ;(window as any).getInitialIndex = getInitialIndex
