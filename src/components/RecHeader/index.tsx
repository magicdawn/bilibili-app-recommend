import { baseDebug } from '$common'
// import { useSticky } from 'react-use-sticky'
import { antdCustomCss, flexCenterStyle } from '$common/emotion-css'
import { useSticky } from '$common/hooks/useSticky'
import { ModalSettings } from '$components/ModalSettings'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { $headerHeight } from '$header'
import { ConfigIcon } from '$modules/icon'
import { useSettingsSnapshot } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { Button, Space } from 'antd'
import { size } from 'polished'
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
    styleUseWhiteBackground,
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
    const headerHeight = $headerHeight.get()
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

  const headerHeight = $headerHeight.use()

  const S_leftright = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  `

  return (
    <>
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          ref={stickyRef}
          className='area-header'
          css={[
            css`
              margin-bottom: 0;
              padding: 8px 0;
              height: auto;
              column-gap: 20px; // gap between left & right
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
                background-color: var(--${styleUseWhiteBackground ? 'bg1' : 'bg2'}_float);
                box-shadow: 0 2px 4px rgb(0 0 0 / 8%);
              `,
          ]}
        >
          <div
            data-class-name='left'
            css={[
              S_leftright,
              css`
                /* as item */
                flex-shrink: 1;

                /* as container */
                flex-wrap: wrap;
                row-gap: 8px;
                column-gap: 15px;
              `,
            ]}
          >
            <VideoSourceTab onRefresh={onRefresh} />
            {leftSlot}
          </div>

          <div
            data-class-name='right'
            css={[
              S_leftright,
              css`
                flex-shrink: 0;
              `,
            ]}
          >
            <Space size={'small'}>
              {rightSlot}

              {!accessKey && <AccessKeyManage style={{ marginLeft: 5 }} />}

              <Button onClick={showModalConfig} css={configStyles.btn}>
                <ConfigIcon {...size(14)} />
              </Button>

              <RefreshButton
                refreshing={refreshing}
                onRefresh={onRefresh}
                refreshHotkeyEnabled={!(modalConfigVisible || modalFeedVisible)}
              />

              {showModalFeedEntry && (
                <Button css={antdCustomCss.button} onClick={showModalFeed}>
                  <span>查看更多</span>
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
