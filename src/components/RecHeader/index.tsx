import { baseDebug } from '$common'
// import { useSticky } from 'react-use-sticky'
import { antdCustomCss, flexCenterStyle } from '$common/emotion-css'
import { useSticky } from '$common/hooks/useSticky'
import { ModalSettings } from '$components/ModalSettings'
import { borderColorValue } from '$components/ModalSettings/theme.shared'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { $headerHeight, $usingEvolevdHeader } from '$header'
import { useIsDarkMode } from '$modules/dark-mode'
import { ConfigIcon } from '$modules/icon'
import { useSettingsSnapshot } from '$modules/settings'
import { getElementOffset, shouldDisableShortcut } from '$utility/dom'
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

const S = {
  configBtn: css`
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    ${flexCenterStyle}
  `,
  leftright: css`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
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
      const yOffset = getElementOffset(container).top
      debug('[refresh:scroll] rect.top = %s, headerHeight = %s', rect.top, headerHeight)
      document.documentElement.scrollTop = yOffset - headerHeight + 2
    }
  })
  useImperativeHandle(ref, () => ({ scroll }))

  const headerHeight = $headerHeight.use()

  const usingEvolevdHeader = $usingEvolevdHeader.use()
  const dark = useIsDarkMode()
  const boxShadow = (() => {
    if (usingEvolevdHeader) {
      return dark ? 'rgba(0, 0, 0, 26%) 0px 2px 10px 1px' : 'rgba(0, 0, 0, 13%) 0 1px 10px 1px;'
    } else {
      return 'inset 0 -1px 0 var(--line_regular)'
    }
  })()

  return (
    <>
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          ref={stickyRef}
          className={clsx('area-header-wrapper', { sticky })}
          css={
            pureRecommend &&
            styleUseStickyTabbarInPureRecommend && [
              css`
                position: sticky;
                top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
                z-index: 1000;
                margin-bottom: 12px;
                border-bottom: 1px solid ${borderColorValue};

                transition:
                  background-color 0.3s ease-in-out,
                  box-shadow 0.3s ease-in-out,
                  margin-bottom 0.3s ease-in-out;
              `,
              sticky &&
                css`
                  margin-inline: calc((100% - 100vw) / 2);
                  padding-inline: calc((100vw - 100%) / 2);

                  background-color: var(--${styleUseWhiteBackground ? 'bg1' : 'bg2'}_float);
                  /* box-shadow: 0 2px 4px rgb(0 0 0 / 8%); */
                  /* box-shadow: inset 0 -1px 0 var(--line_regular); */
                  /* box-shadow: rgba(0, 0, 0, 13%) 0 1px 10px 1px; */
                  box-shadow: ${boxShadow};
                `,
            ]
          }
        >
          <div
            className='area-header'
            css={[
              css`
                margin-bottom: 0;
                height: auto;
                column-gap: 20px; // gap between left & right
                padding-inline: 0;
                padding-block: 8px;
              `,
            ]}
          >
            <div
              data-class-name='left'
              css={[
                S.leftright,
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
                S.leftright,
                css`
                  flex-shrink: 0;
                `,
              ]}
            >
              <Space size={'small'}>
                {rightSlot}

                {!accessKey && <AccessKeyManage style={{ marginLeft: 5 }} />}

                <Button onClick={showModalConfig} css={S.configBtn}>
                  <ConfigIcon {...size(14)} />
                </Button>

                <RefreshButton
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  refreshHotkeyEnabled={!(modalConfigVisible || modalFeedVisible)}
                />

                {showModalFeedEntry && (
                  <Button css={antdCustomCss.button} onClick={showModalFeed} className='gap-0'>
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
        </div>

        <ModalFeed show={modalFeedVisible} onHide={hideModalFeed} />
        <ModalSettings show={modalConfigVisible} onHide={hideModalConfig} />
      </OnRefreshContext.Provider>
    </>
  )
})
