import { baseDebug } from '$common'
import { ModalSettings } from '$components/ModalSettings'
import { getHeaderHeight, useHeaderHeight } from '$header'
import { IconPark } from '$icon-park'
import { css } from '$libs'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { useHasLogined } from '$utility'
import { isCurrentTyping } from '$utility/dom'
import { toast } from '$utility/toast'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button, Radio, Space } from 'antd'
import {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useSticky } from 'react-use-sticky'
import { proxy, useSnapshot } from 'valtio'
import { AccessKeyManage } from '../AccessKeyManage'
import { ModalFeed } from '../ModalFeed'
import { HelpInfo } from '../piece'
import { TabType, useCurrentSourceTab } from './tab'

const debug = baseDebug.extend('RecHeader')

const verticalAlignStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

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
    onRefresh: () => void | Promise<void>
    refreshing: boolean
  }
>(function RecHeader({ onRefresh, refreshing }, ref) {
  const { accessKey, pureRecommend, usePcDesktopApi } = useSettingsSnapshot()

  const { modalFeedVisible, modalConfigVisible } = useSnapshot(headerState)
  useKeyPress(
    ['shift.comma'],
    (e) => {
      if (isCurrentTyping()) return
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
              background-color: var(--bg1_float);
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
          <VideoSourceTab refreshing={refreshing} onRefresh={onRefresh} />
        </div>

        <div className='right'>
          <Space size={'small'}>
            {!usePcDesktopApi && !accessKey && <AccessKeyManage style={{ marginLeft: 5 }} />}

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
    </>
  )
})

function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能!')
}

const btnCss = css`
  height: 26px;
  line-height: 26px;
`

export function VideoSourceTab({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void | Promise<void>
  refreshing: boolean
}) {
  const logined = useHasLogined()
  const tab = useCurrentSourceTab()

  return (
    <>
      <Radio.Group
        disabled={refreshing}
        optionType='button'
        buttonStyle='solid'
        size='middle'
        value={tab}
        style={{ overflow: 'hidden' }}
        onChange={(e) => {
          const newValue = e.target.value as TabType
          switch (newValue) {
            case 'onlyFollow':
              if (!logined) return toastNeedLogin()
              updateSettings({ onlyFollowMode: true, useDynamicApi: false })
              break
            case 'dynamic':
              if (!logined) return toastNeedLogin()
              updateSettings({ onlyFollowMode: false, useDynamicApi: true })
              break
            case 'normal':
            default:
              updateSettings({ onlyFollowMode: false, useDynamicApi: false })
              break
          }

          onRefresh()
        }}
      >
        <Radio.Button css={btnCss} value={'normal' satisfies TabType}>
          推荐
        </Radio.Button>
        <Radio.Button css={btnCss} value={'onlyFollow' satisfies TabType}>
          已关注
        </Radio.Button>
        <Radio.Button css={btnCss} value={'dynamic' satisfies TabType}>
          动态
        </Radio.Button>
      </Radio.Group>
      <HelpInfo
        iconProps={{ size: 18, style: { marginLeft: 10 } }}
        tooltip={
          <>
            已关注: 推荐中只保留「已关注」,会很慢
            <br />
            动态: 视频投稿动态
          </>
        }
      />
    </>
  )
}

export type RefreshButtonActions = { click: () => void }
export type RefreshButtonProps = {
  style?: CSSProperties
  className?: string
  onRefresh?: (e?: MouseEvent) => void
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
      if (isCurrentTyping()) return
      if (!refreshHotkeyEnabled) return
      click()
    },
    { exactMatch: true }
  )

  const tab = useCurrentSourceTab()
  const text = tab === 'dynamic' ? '刷新' : '换一换'

  const onClick: MouseEventHandler = useMemoizedFn((e?: MouseEvent) => {
    setDeg((d) => d + 360)
    return onRefresh?.(e)
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
