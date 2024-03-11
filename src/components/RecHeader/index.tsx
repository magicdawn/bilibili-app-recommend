import { baseDebug } from '$common'
// import { useSticky } from 'react-use-sticky'
import { antdBtnTextStyle, flexCenterStyle } from '$common/emotion-css'
import { useSticky } from '$common/hooks/useSticky'
import { ModalSettings } from '$components/ModalSettings'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { getHeaderHeight, useHeaderHeight } from '$header'
import { IconPark } from '$icon-park'
import { useSettingsSnapshot } from '$modules/settings'
import { getIsInternalTesting } from '$platform'
import { shouldDisableShortcut } from '$utility/dom'
import { css } from '@emotion/react'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button, Space } from 'antd'
import type { ReactNode } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import { useSnapshot } from 'valtio'
import { AccessKeyManage } from '../AccessKeyManage'
import { ModalFeed } from '../ModalFeed'
import { RefreshButton } from './RefreshButton'
import {
  headerState,
  hideModalConfig,
  hideModalFeed,
  showModalConfig,
  showModalFeed,
} from './index.shared'
import { VideoSourceTab } from './tab'

const debug = baseDebug.extend('RecHeader')

const configStyles = {
  btn: css`
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    ${flexCenterStyle}
  `,
  icon: css`
    svg {
      width: 14px;
      height: 14px;
    }
  `,
}

export type RecHeaderRef = {
  scroll: () => void
}

export const RecHeader = forwardRef<
  RecHeaderRef,
  {
    refreshing: boolean
    onRefresh: OnRefresh
    leftSlot?: ReactNode
    rightSlot?: ReactNode
  }
>(function RecHeader({ onRefresh, refreshing, leftSlot, rightSlot }, ref) {
  const {
    accessKey,
    pureRecommend,
    styleFancy,
    showModalFeedEntry,
    styleUseStickyTabbarInPureRecommend,
  } = useSettingsSnapshot()
  const { modalFeedVisible, modalConfigVisible } = useSnapshot(headerState)

  useKeyPress(
    ['shift.comma'],
    (e) => {
      if (shouldDisableShortcut()) return
      headerState.modalConfigVisible = !headerState.modalConfigVisible
    },
    { exactMatch: true },
  )

  const [stickyRef, sticky] = useSticky<HTMLDivElement>()

  const scroll = useMemoizedFn(() => {
    if (!pureRecommend) return

    const container = stickyRef.current?.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const headerHeight = getHeaderHeight()
    if (rect.top < headerHeight) {
      const relativeScrolltop = headerHeight - rect.top + 1
      debug(
        'changing scroll on refresh: rect.top = %s, headerHeight = %s, scrollTop -= %s',
        rect.top,
        headerHeight,
        relativeScrolltop,
      )
      document.documentElement.scrollTop -= relativeScrolltop
    }
  })
  useImperativeHandle(ref, () => ({ scroll }))

  const headerHeight = useHeaderHeight()

  const isInternalTesting = getIsInternalTesting()

  return (
    <>
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          ref={stickyRef}
          className='area-header'
          css={[
            css`
              margin-bottom: 0;
              height: 50px;
            `,
            pureRecommend &&
              styleUseStickyTabbarInPureRecommend &&
              css`
                position: sticky;
                top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
                z-index: 1000;
              `,
            pureRecommend &&
              styleUseStickyTabbarInPureRecommend &&
              sticky &&
              css`
                background-color: var(--${styleFancy ? 'bg2' : 'bg1'}_float);
                box-shadow: 0 2px 4px rgb(0 0 0 / 8%);
              `,
          ]}
        >
          <div className='left'>
            {/* section logo: 推荐 logo, 魔法棒 */}
            {!pureRecommend && !isInternalTesting && (
              <svg className='icon'>
                <use href='#channel-cinephile'></use>
              </svg>
            )}

            <VideoSourceTab onRefresh={onRefresh} />
            {leftSlot}
          </div>

          <div className='right'>
            <Space size={'small'}>
              {rightSlot}

              {!accessKey && <AccessKeyManage style={{ marginLeft: 5 }} />}

              <Button onClick={showModalConfig} css={configStyles.btn}>
                <IconPark name='Config' css={configStyles.icon} />
              </Button>

              <RefreshButton
                refreshing={refreshing}
                onRefresh={onRefresh}
                refreshHotkeyEnabled={!(modalConfigVisible || modalFeedVisible)}
              />

              {showModalFeedEntry && (
                <Button css={flexCenterStyle} onClick={showModalFeed}>
                  <span css={antdBtnTextStyle}>查看更多</span>
                  <svg
                    css={css`
                      width: 12px;
                      height: 12px;
                      margin-left: 2px;
                    `}
                  >
                    <use href='#widget-arrow'></use>
                  </svg>
                </Button>
              )}
            </Space>
          </div>
        </div>

        <ModalFeed show={modalFeedVisible} onHide={hideModalFeed} />
        <ModalSettings show={modalConfigVisible} onHide={hideModalConfig} />
      </OnRefreshContext.Provider>
    </>
  )
})
