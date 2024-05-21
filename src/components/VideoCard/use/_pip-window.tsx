import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { isEdge } from '$platform'
import createEmotion from '@emotion/css/create-instance'
import { Global } from '@emotion/react'
import { useHover } from 'ahooks'
import { App } from 'antd'
import { once } from 'lodash'
import RadixIconsCross2 from '~icons/radix-icons/cross-2'
import RadixIconsLockClosed from '~icons/radix-icons/lock-closed'
import RadixIconsLockOpen1 from '~icons/radix-icons/lock-open-1'
import RadixIconsOpenInNewWindow from '~icons/radix-icons/open-in-new-window'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { PLAYER_SCREEN_MODE } from '../index.shared'

export function renderInPipWindow(newHref: string, pipWindow: Window) {
  const cssInsertContainer = pipWindow.document.head
  const { cache } = createEmotion({
    key: 'pip-window',
    container: cssInsertContainer,
  })

  const container = document.createElement('div')
  container.classList.add(APP_NAME_ROOT_CLASSNAME)
  pipWindow.document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <AntdApp
      emotionCache={cache}
      styleProviderProps={{ container: cssInsertContainer }}
      injectGlobalStyle
    >
      <App component={false} message={{ getContainer: () => pipWindow.document.body }}>
        <PipWindowContent newHref={newHref} pipWindow={pipWindow} />
      </App>
    </AntdApp>,
  )
}

export function PipWindowContent({ newHref, pipWindow }: { pipWindow: Window; newHref: string }) {
  const focusOnce = useMemo(() => {
    return once(() => {
      window.focus()
    })
  }, [])
  useKeyPress(
    ['leftarrow', 'rightarrow', 'uparrow', 'downawrrow', 'esc', 'tab'],
    (e) => {
      focusOnce()
    },
    {
      exactMatch: true,
      target: pipWindow.document.documentElement,
    },
  )

  const hovering = useHover(pipWindow.document.documentElement)

  const [locked, setLocked] = useState(() => {
    // edge pipWindow 总是静音开播, 需要交互, so locked = false
    if (isEdge) {
      return false
    }

    return true
  })

  return (
    <>
      <Global
        styles={[
          css`
            * {
              box-sizing: border-box;
            }
            body,
            iframe {
              margin: 0;
              padding: 0;
            }
          `,
        ]}
      />

      <iframe
        src={newHref}
        css={css`
          width: 100%;
          height: 100%;
          border: none;
        `}
      />

      <LockOverlay locked={locked} />

      <div
        css={css`
          position: fixed;
          z-index: 9999;
          right: 10px;
          top: 10px;
          display: ${hovering ? 'flex' : 'none'};
          column-gap: 6px;
          flex-direction: row-reverse;
        `}
      >
        {/* edge 没有 title-bar, 无法关闭 pipWindow, 无法拖动; so 加个关闭按钮 */}
        {isEdge && <CloseButton pipWindow={pipWindow} />}
        <CloseThenOpenButton pipWindow={pipWindow} newHref={newHref} />
        <LockButton locked={locked} setLocked={setLocked} />
      </div>
    </>
  )
}

const S = {
  button: css`
    /* border: 1px solid ${colorPrimaryValue}; */
    svg {
      width: 14px;
      height: 14px;
    }
  `,
}

function LockOverlay({ locked }: { locked: boolean }) {
  const [clickedTimes, setClickedTimes] = useState(0)
  const [targetTimes, setTargetTimes] = useState(3)
  const { message } = App.useApp()

  // TODO: enable drag

  return (
    locked && (
      <div
        className='locked-overlay'
        css={css`
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: transparent;
          user-select: none;
        `}
        onClick={() => {
          const val = clickedTimes + 1
          setClickedTimes(val)
          if (val === targetTimes) {
            setClickedTimes(0)
            setTargetTimes((x) => x + 1)
            message.info('请先点击右上角 🔓解锁按钮 解锁')
          }
        }}
      />
    )
  )
}

function CloseThenOpenButton({ newHref, pipWindow }: { pipWindow: Window; newHref: string }) {
  const onClick = () => {
    pipWindow.close()
    const u = new URL(newHref)
    u.searchParams.delete(PLAYER_SCREEN_MODE)
    GM.openInTab(u.href, { active: true })
  }

  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={<RadixIconsOpenInNewWindow />}
      tooltip={'新窗口打开'}
      onClick={onClick}
      css={S.button}
    />
  )
}

function CloseButton({ pipWindow }: { pipWindow: Window }) {
  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={<RadixIconsCross2 />}
      tooltip={'关闭'}
      css={S.button}
      onClick={() => {
        pipWindow.close()
      }}
    />
  )
}

function LockButton({
  locked,
  setLocked,
}: {
  locked: boolean
  setLocked: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <VideoCardActionButton
      inlinePosition={'right'}
      icon={locked ? <RadixIconsLockClosed /> : <RadixIconsLockOpen1 />}
      tooltip={locked ? '解锁' : '锁定'}
      css={S.button}
      onClick={(e) => {
        setLocked((x) => !x)
      }}
    />
  )
}
