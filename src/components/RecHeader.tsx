import { ModalSettings } from '$components/ModalSettings'
import { IconPark } from '$icon-park'
import { css } from '$libs'
import { HEADER_HEIGHT } from '$platform'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { useHasLogined } from '$utility'
import { isCurrentTyping } from '$utility/dom'
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
import { AccessKeyManage } from './AccessKeyManage'
import { ModalFeed } from './ModalFeed'
import { HelpInfo } from './piece'

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

export function RecHeader({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const { accessKey, pureRecommend, usePcDesktopApi, dynamicMode } = useSettingsSnapshot()

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
              top: ${HEADER_HEIGHT}px;
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
          <a id='影视' className='the-world area-anchor' data-id='25'></a>
          <svg className='icon'>
            <use href='#channel-cinephile'></use>
          </svg>
          {/* <a className='title' href='#'>
            <span>推荐</span>
          </a> */}
          <DynamicModeSwitch onRefresh={onRefresh} />
        </div>

        <div className='right'>
          <Space size={'small'}>
            {!usePcDesktopApi && !accessKey && <AccessKeyManage style={{ marginLeft: 5 }} />}

            <Button onClick={showModalConfig} css={configStyles.btn}>
              <IconPark name='Config' css={configStyles.icon} />
            </Button>

            <RefreshButton
              onClick={onRefresh}
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
}

export function DynamicModeSwitch({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const { dynamicMode, usePcDynamicApi } = useSettingsSnapshot()
  const logined = useHasLogined()

  if (!logined) return null

  return (
    <>
      <Radio.Group
        buttonStyle='solid'
        size='middle'
        value={dynamicMode ? 'dynamicMode' : usePcDynamicApi ? 'dynamicApi' : 'normal'}
        onChange={(e) => {
          const newValue = e.target.value
          switch (newValue) {
            case 'dynamicMode':
              updateSettings({ dynamicMode: true, usePcDynamicApi: false })
              break
            case 'dynamicApi':
              updateSettings({ dynamicMode: false, usePcDynamicApi: true })
              break
            case 'normal':
            default:
              updateSettings({ dynamicMode: false, usePcDynamicApi: false })
              break
          }

          onRefresh()
        }}
      >
        <Radio.Button value='normal'>推荐</Radio.Button>
        <Radio.Button value='dynamicMode'>已关注</Radio.Button>
        <Radio.Button value='dynamicApi'>动态</Radio.Button>
      </Radio.Group>
      <HelpInfo
        tooltip={
          <>
            <ul>
              <li> 推荐</li>
              <li>已关注: 推荐只保留已关注</li>
              <li> 动态: 视频投稿动态</li>
            </ul>
            <br />
            已关注: 只保留「已关注」
            <br />
            1. 动态模式使用更快的 PC 桌面端 API, 设置中 API 切换不影响动态模式.
            <br />
            2. 动态模式是基于筛选, 并不是真正的动态
            <br />
            3. 视频筛选器不起作用
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
  onClick?: (e?: MouseEvent) => void
  refreshHotkeyEnabled?: boolean
}
export const RefreshButton = forwardRef<RefreshButtonActions, RefreshButtonProps>(function (
  { onClick, className = '', style, refreshHotkeyEnabled },
  ref
) {
  refreshHotkeyEnabled ??= true

  const [deg, setDeg] = useState(0)

  const btnOnClickHandler: MouseEventHandler = useMemoizedFn((e?: MouseEvent) => {
    setDeg((d) => d + 360)
    return onClick?.(e)
  })

  // click from outside
  const btn = useRef<HTMLButtonElement>(null)
  useImperativeHandle(
    ref,
    () => ({
      click() {
        btn.current?.click()
      },
    }),
    []
  )

  // refresh
  useKeyPress(
    'r',
    () => {
      if (!refreshHotkeyEnabled) return
      if (isCurrentTyping()) return
      btn.current?.click()
    },
    { exactMatch: true }
  )

  return (
    <Button
      className={className}
      style={style}
      css={css`
        ${verticalAlignStyle}
        &.ant-btn:not(:disabled):focus-visible {
          outline: none;
        }
      `}
      ref={btn}
      onClick={btnOnClickHandler}
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
      <span>换一换</span>
    </Button>
  )
})
