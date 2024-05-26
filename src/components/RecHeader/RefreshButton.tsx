import { antdCustomCss } from '$common/emotion-css'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import { useSettingsSnapshot } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { Button } from 'antd'
import { useAnimate } from 'framer-motion'
import type { MouseEvent, MouseEventHandler } from 'react'
import { useCurrentUsingTab } from './tab'
import { ETab } from './tab-enum'

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
  ref,
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
    { exactMatch: true },
  )

  const tab = useCurrentUsingTab()
  const { shuffleForFav, shuffleForWatchLater, shuffleForPopularWeekly } = useSettingsSnapshot()

  const text =
    tab === ETab.DynamicFeed ||
    (tab === ETab.Watchlater && !shuffleForWatchLater) ||
    (tab === ETab.Fav && !shuffleForFav) ||
    (tab === ETab.Hot && !isHotTabUsingShuffle(shuffleForPopularWeekly))
      ? '刷新'
      : '换一换'

  const [scope, animate] = useAnimate()

  const onClick: MouseEventHandler = useMemoizedFn((e?: MouseEvent) => {
    animate(scope.current, { rotate: [0, 360] }, { duration: 0.5, type: 'tween' })
    return onRefresh?.()
  })

  return (
    <Button
      disabled={refreshing}
      className={className}
      style={style}
      css={[
        antdCustomCss.button,
        css`
          &.ant-btn:not(:disabled):focus-visible {
            outline: none;
          }
        `,
      ]}
      ref={btn}
      onClick={onClick}
    >
      <svg
        ref={scope}
        style={{
          width: '11px',
          height: '11px',
          marginRight: 5,
        }}
      >
        <use href='#widget-roll'></use>
      </svg>
      <span>{text}</span>
    </Button>
  )
})
