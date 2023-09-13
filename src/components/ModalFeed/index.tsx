import { colorPrimaryValue } from '$components/ModalSettings/theme'
import { RecGrid, RecGridRef } from '$components/RecGrid'
import { OnRefresh, OnRefreshContext } from '$components/RecGrid/useRefresh'
import { RefreshButton } from '$components/RecHeader'
import { VideoSourceTab } from '$components/RecHeader/tab'
import { ModalFeedConfigChecks } from '$components/piece'
import { cx } from '$libs'
import { useIsDarkMode } from '$platform'
import { useSettingsSnapshot } from '$settings'
import { css } from '@emotion/react'
import { useMemoizedFn } from 'ahooks'
import { CSSProperties, ReactNode, memo, useMemo, useRef, useState } from 'react'
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

  const onRefresh: OnRefresh = useMemoizedFn((...args) => {
    return recGridRef.current?.refresh(...args)
  })

  const [extraInfo, setExtraInfo] = useState<ReactNode>(null)

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const dark = useIsDarkMode()
  const modalBorderStyle: CSSProperties | undefined = useMemo(
    () => (dark ? { border: `1px solid ${colorPrimaryValue}` } : undefined),
    [dark]
  )

  const [refreshing, setRefreshing] = useState(false)

  return (
    <BaseModal
      {...{ show, onHide }}
      clsModalMask={cx(narrowStyleObj)}
      clsModal={cx(styles.modal, narrowStyleObj)}
      styleModal={{
        ...modalBorderStyle,
      }}
    >
      <OnRefreshContext.Provider value={onRefresh}>
        <div className={cx(BaseModalClass.modalHeader, styles.modalHeader)}>
          {/* <div
          className={BaseModalClass.modalTitle}
          css={css`
            margin-right: 4px;
          `}
        >
          推荐
        </div> */}

          <VideoSourceTab onRefresh={onRefresh} />
          {extraInfo}

          <div className='space' style={{ flex: 1 }}></div>

          <CollapseBtn>
            <ModalFeedConfigChecks />
          </CollapseBtn>

          <RefreshButton
            css={css`
              margin-left: 8px;
            `}
            refreshing={refreshing}
            onRefresh={onRefresh}
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
            setRefreshing={setRefreshing}
            setExtraInfo={setExtraInfo}
          />
        </div>
      </OnRefreshContext.Provider>
    </BaseModal>
  )
})
