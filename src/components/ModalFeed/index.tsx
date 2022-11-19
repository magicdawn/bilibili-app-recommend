import { cx } from '$libs'
import { useMemoizedFn } from 'ahooks'
import { memo, useMemo, useRef } from 'react'
// local
import { ModalFeedConfigChecks } from '$components/piece'
import { RecGrid, RecGridRef } from '$components/RecGrid'
import { useConfigSnapshot } from '$settings'
import { BaseModal } from '../BaseModal'
import { CollapseBtn } from '../CollapseBtn'
import styles from './index.module.less'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const recGrid = useRef<RecGridRef>(null)

  // 窄屏模式
  const { useNarrowMode } = useConfigSnapshot()
  const narrowStyleObj = useMemo(() => ({ [styles.narrowMode]: useNarrowMode }), [useNarrowMode])

  const onRefresh = useMemoizedFn(() => {
    return recGrid.current?.refresh()
  })

  const onScrollToTop = useMemoizedFn(() => {
    if (scroller.current) {
      scroller.current.scrollTop = 0
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

      <div className={styles.modalBody} ref={scroller}>
        <RecGrid
          ref={recGrid}
          shortcutEnabled={show}
          infiteScrollUseWindow={false}
          onScrollToTop={onScrollToTop}
        />
      </div>
    </BaseModal>
  )
})
