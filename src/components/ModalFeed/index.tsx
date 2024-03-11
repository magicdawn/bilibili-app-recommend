import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { RecGridRef } from '$components/RecGrid'
import { RecGrid } from '$components/RecGrid'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { RefreshButton } from '$components/RecHeader/RefreshButton'
import { VideoSourceTab } from '$components/RecHeader/tab'
import { cx } from '$libs'
import { useSettingsSnapshot } from '$modules/settings'
import { useIsDarkMode } from '$platform'
import { AntdMessage } from '$utility'
import { css } from '@emotion/react'
import { useMemoizedFn } from 'ahooks'
import type { CSSProperties, ReactNode } from 'react'
import { memo, useMemo, useRef, useState } from 'react'
import { BaseModal, BaseModalClass, ModalClose } from '../BaseModal'
import { CollapseBtn } from '../CollapseBtn'
import { FlagSettingItem } from '../piece'
import styles from './index.module.scss'

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const recGridRef = useRef<RecGridRef>(null)

  const {
    // 双列模式
    useNarrowMode,
    // 全屏模式
    modalFeedFullScreen,
  } = useSettingsSnapshot()

  const useFullScreen = !useNarrowMode && modalFeedFullScreen
  const dark = useIsDarkMode()

  const moreStyles = useMemo(
    () => ({
      [styles.narrowMode]: useNarrowMode,
      [styles.fullScreenMode]: useFullScreen,
    }),
    [useNarrowMode, useFullScreen],
  )

  const modalBorderStyle: CSSProperties | undefined = useMemo(() => {
    if (useFullScreen) {
      return { border: `5px solid ${colorPrimaryValue}` }
    } else if (dark) {
      return { border: `1px solid ${colorPrimaryValue}` }
    }
  }, [dark, useFullScreen])

  const onRefresh: OnRefresh = useMemoizedFn((...args) => {
    return recGridRef.current?.refresh(...args)
  })

  const [extraInfo, setExtraInfo] = useState<ReactNode>(null)

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const [refreshing, setRefreshing] = useState(false)

  return (
    <BaseModal
      {...{ show, onHide }}
      clsModalMask={cx(moreStyles)}
      clsModal={cx(styles.modal, moreStyles)}
      styleModal={{
        ...modalBorderStyle,
      }}
    >
      <OnRefreshContext.Provider value={onRefresh}>
        <div className={cx(BaseModalClass.modalHeader, styles.modalHeader)}>
          <VideoSourceTab onRefresh={onRefresh} />
          {extraInfo}

          <div className='space' style={{ flex: 1 }}></div>

          {useNarrowMode ? null : useFullScreen ? (
            <ModalFeedConfigChecks />
          ) : (
            <CollapseBtn initialOpen>
              <ModalFeedConfigChecks />
            </CollapseBtn>
          )}

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

function ModalFeedConfigChecks() {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <FlagSettingItem
        configKey={'showModalFeedOnLoad'}
        label='自动查看更多'
        tooltip='打开首页时默认打开推荐弹窗'
        css={inModalFeedStyle}
        extraAction={(val) => {
          if (val) {
            AntdMessage.success('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
          }
        }}
      />

      <FlagSettingItem
        configKey='modalFeedFullScreen'
        label='全屏'
        tooltip='世界清净了~'
        css={inModalFeedStyle}
      />
    </>
  )
}
