import { ModalFeedConfigChecks } from '$components/piece'
import { RecGrid, RecGridRef } from '$components/RecGrid'
import { cx } from '$libs'
import { useConfigSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { memo, useMemo, useRef } from 'react'
import { BaseModal } from '../BaseModal'
import { CollapseBtn } from '../CollapseBtn'
import styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const recGridRef = useRef<RecGridRef>(null)

  // 窄屏模式
  const { useNarrowMode } = useConfigSnapshot()
  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  const onRefresh = useMemoizedFn(() => {
    return recGridRef.current?.refresh()
  })

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

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
          <ModalFeedConfigChecks />
        </CollapseBtn>

        <button className={`primary-btn roll-btn ${styles.btnRefresh}`} onClick={onRefresh}>
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
        <RecGrid
          ref={recGridRef}
          shortcutEnabled={show}
          onScrollToTop={onScrollToTop}
          infiteScrollUseWindow={false}
          scrollerRef={scrollerRef}
        />
      </div>
    </BaseModal>
  )
})
