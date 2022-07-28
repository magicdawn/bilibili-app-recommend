import { cx } from '$libs'
import { useMemoizedFn } from 'ahooks'
import delay from 'delay'
import { ChangeEventHandler, memo, useCallback, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
// local
import { RecItemWithUniqId } from '$define'
import { getRecommendTimes } from '$service'
import { updateConfig, useConfigSnapshot } from '$settings'
import { BaseModal } from '../BaseModal'
import { CollapseBtn } from '../CollapseBtn'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'
import { useShortcut } from './useShortcut'
import { useUUID } from '$common/hooks/useUUID'
import { toast } from '$utility/toast'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const [items, setItems] = useState<RecItemWithUniqId[]>([])
  const [loading, setLoading] = useState(false)

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
      clearActiveIndex() // before
      setItems(await getRecommendTimes(2))
      clearActiveIndex() // and after
    } finally {
      setLoading(false)
    }
  })

  const fetchMore = useMemoizedFn(async (page: number) => {
    const more = await getRecommendTimes(2)
    setItems((items) => [...items, ...more])
  })

  // 窄屏模式
  const { useNarrowMode, initialShowMore } = useConfigSnapshot()
  const updateUseNarrowMode: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const val = e.target.checked
    updateConfig({ useNarrowMode: val })
  }, [])
  const updateInitialShowMore: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const val = e.target.checked
    updateConfig({ initialShowMore: val })
    if (val) {
      toast('已开启自动查看更多: 下次打开首页时将直接展示本推荐弹框')
    }
  }, [])
  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  // 快捷键
  const { activeIndex, clearActiveIndex } = useShortcut({
    show,
    refresh,
    maxIndex: items.length - 1,
  })

  const checkboxNarrowModeId = useUUID()
  const checkboxInitialShowMoreId = useUUID()

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
            className={styles.checkbox}
            id={checkboxInitialShowMoreId}
            checked={initialShowMore}
            onChange={updateInitialShowMore}
          />
          <label htmlFor={checkboxInitialShowMoreId}>自动查看更多</label>

          <input
            type='checkbox'
            className={styles.checkbox}
            id={checkboxNarrowModeId}
            checked={useNarrowMode}
            onChange={updateUseNarrowMode}
          />
          <label htmlFor={checkboxNarrowModeId}>启用窄屏模式</label>
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
                    loading={loading}
                    item={item}
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
