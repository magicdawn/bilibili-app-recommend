import { RecGrid, RecGridRef } from '$components/RecGrid'
import { RefreshButton } from '$components/RecHeader'
import { ModalFeedConfigChecks } from '$components/piece'
import { cx } from '$libs'
import { useSettingsSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { memo, useMemo, useRef } from 'react'
import { BaseModal, BaseModalClass, ModalClose } from '../BaseModal'
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
  const { useNarrowMode } = useSettingsSnapshot()
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
      clsModalMask={cx(narrowStyleObj)}
      clsModal={cx(styles.modal, narrowStyleObj)}
    >
      <div className={cx(BaseModalClass.modalHeader, styles.modalHeader)}>
        <div className={BaseModalClass.modalTitle}>推荐</div>

        <div className='space' style={{ flex: 1 }}></div>

        <CollapseBtn>
          <ModalFeedConfigChecks />
        </CollapseBtn>

        <RefreshButton
          onClick={onRefresh}
          className={styles.btnRefresh}
          refreshHotkeyEnabled={show}
        />

        <ModalClose onClick={onHide} />
      </div>

      <div className={cx(BaseModalClass.modalBody, styles.modalBody)} ref={scrollerRef}>
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
