import { baseDebug } from '$common'
import { ModalSettings } from '$components/ModalSettings'
import { getHeaderHeight, useHeaderHeight } from '$header'
import { IconPark } from '$icon-park'
import { css } from '$libs'
import { settings, useSettingsSnapshot } from '$settings'
import { shouldDisableShortcut } from '$utility/dom'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button, Space } from 'antd'
import {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
// import { useSticky } from 'react-use-sticky'
import { verticalAlignStyle } from '$common/emotion-css'
import { useSticky } from '$common/hooks/useSticky'
import { OnRefresh, OnRefreshContext } from '$components/RecGrid/useRefresh'
import { proxy, useSnapshot } from 'valtio'
import { AccessKeyManage } from '../AccessKeyManage'
import { ModalFeed } from '../ModalFeed'
import { VideoSourceTab, useCurrentSourceTab } from './tab'

const debug = baseDebug.extend('RecHeader')

const configStyles = {
  btn: css`
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    ${verticalAlignStyle}
  `,
  icon: css`
    svg {
      width: 14px;
      height: 14px;
    }
  `,
}

export const headerState = proxy({
  modalFeedVisible: settings.initialShowMore,
  modalConfigVisible: false,
})

export const useHeaderState = function () {
  return useSnapshot(headerState)
}

const showModalFeed = () => {
  headerState.modalFeedVisible = true
}
const hideModalFeed = () => {
  headerState.modalFeedVisible = false
}

const showModalConfig = () => {
  headerState.modalConfigVisible = true
}
const hideModalConfig = () => {
  headerState.modalConfigVisible = false
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
  const { accessKey, pureRecommend, styleFancy } = useSettingsSnapshot()

  const { modalFeedVisible, modalConfigVisible } = useSnapshot(headerState)
  useKeyPress(
    ['shift.comma'],
    (e) => {
      if (shouldDisableShortcut()) return
      headerState.modalConfigVisible = !headerState.modalConfigVisible
    },
    { exactMatch: true }
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
        relativeScrolltop
      )
      document.documentElement.scrollTop -= relativeScrolltop
    }
  })
  useImperativeHandle(ref, () => ({ scroll }))

  const headerHeight = useHeaderHeight()

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
              css`
                position: sticky;
                top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
                z-index: 1000;
              `,
            pureRecommend &&
              sticky &&
              css`
                background-color: var(--${styleFancy ? 'bg2' : 'bg1'}_float);
                box-shadow: 0 2px 4px rgb(0 0 0 / 8%);
              `,
          ]}
        >
          <div className='left'>
            <svg className='icon'>
              <use href='#channel-cinephile'></use>
            </svg>
            {/* <a className='title' href='#'>
            推荐
          </a> */}
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

              {!pureRecommend && (
                <Button css={verticalAlignStyle} onClick={showModalFeed}>
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

export type RefreshButtonActions = { click: () => void }
export type RefreshButtonProps = {
  style?: CSSProperties
  className?: string
  onRefresh?: OnRefresh
  refreshHotkeyEnabled?: boolean
  refreshing: boolean
}
export const RefreshButton = forwardRef<RefreshButtonActions, RefreshButtonProps>(function (
  { onRefresh, className = '', style, refreshHotkeyEnabled, refreshing },
  ref
) {
  refreshHotkeyEnabled ??= true

  const [deg, setDeg] = useState(0)

  const btn = useRef<HTMLButtonElement>(null)
  const click = useMemoizedFn(() => {
    if (!btn.current) return
    if (btn.current.disabled) return
    btn.current.click()
  })

  // click from outside
  useImperativeHandle(ref, () => ({ click }), [])

  // refresh
  useKeyPress(
    'r',
    () => {
      if (shouldDisableShortcut()) return
      if (!refreshHotkeyEnabled) return
      click()
    },
    { exactMatch: true }
  )

  const tab = useCurrentSourceTab()
  const { shuffleForFav, shuffleForWatchLater } = useSettingsSnapshot()

  const text =
    tab === 'dynamic-feed' ||
    (tab === 'watchlater' && !shuffleForWatchLater) ||
    (tab === 'fav' && !shuffleForFav)
      ? '刷新'
      : '换一换'

  const onClick: MouseEventHandler = useMemoizedFn((e?: MouseEvent) => {
    setDeg((d) => d + 360)
    return onRefresh?.()
  })

  return (
    <Button
      disabled={refreshing}
      className={className}
      style={style}
      css={css`
        ${verticalAlignStyle}
        &.ant-btn:not(:disabled):focus-visible {
          outline: none;
        }
      `}
      ref={btn}
      onClick={onClick}
    >
      <svg
        style={{
          transform: `rotate(${deg}deg)`,
          width: '11px',
          height: '11px',
          marginRight: 5,
          transition: deg === 360 ? 'transform .5s ease' : 'unset',
        }}
        onTransitionEnd={() => {
          setDeg(0)
        }}
      >
        <use href='#widget-roll'></use>
      </svg>
      <span>{text}</span>
    </Button>
  )
})
