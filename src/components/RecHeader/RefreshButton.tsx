import { antdBtnTextStyle, flexCenterStyle } from '$common/emotion-css'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { useSettingsSnapshot } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button } from 'antd'
import { useAnimate } from 'framer-motion'
import type { MouseEvent, MouseEventHandler } from 'react'
import { useCurrentSourceTab } from './tab'
import { ETabType } from './tab.shared'

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

  const tab = useCurrentSourceTab()
  const { shuffleForFav, shuffleForWatchLater, shuffleForPopularWeekly } = useSettingsSnapshot()

  const text =
    tab === ETabType.DynamicFeed ||
    (tab === ETabType.Watchlater && !shuffleForWatchLater) ||
    (tab === ETabType.Fav && !shuffleForFav) ||
    tab === ETabType.PopularGeneral ||
    (tab === ETabType.PopularWeekly && !shuffleForPopularWeekly)
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
      css={css`
        ${flexCenterStyle}
        &.ant-btn:not(:disabled):focus-visible {
          outline: none;
        }
      `}
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
      <span css={antdBtnTextStyle}>{text}</span>
    </Button>
  )
})
