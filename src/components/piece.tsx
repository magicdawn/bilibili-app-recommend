import { IconPark } from '$icon-park'
import type { BooleanSettingsKey } from '$modules/settings'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { Checkbox, Tooltip } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { SetOptional } from 'type-fest'
import { AntdTooltip } from './AntdApp'

export function FlagSettingItem({
  configKey,
  label,
  extraAction,
  tooltip,
  ...otherProps
}: {
  configKey: BooleanSettingsKey
  label?: string
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
} & ComponentProps<typeof Checkbox>) {
  const snap = useSettingsSnapshot()

  const checked = !!snap[configKey]
  const onChange = useCallback((e: CheckboxChangeEvent) => {
    const val = e.target.checked
    updateSettings({ [configKey]: val })
    extraAction?.(val)
  }, [])

  let inner: ReactNode = <span style={{ userSelect: 'none' }}>{label || configKey}</span>
  if (tooltip)
    inner = (
      <Tooltip title={tooltip} overlayStyle={{ width: 'max-content', maxWidth: '50vw' }}>
        {inner}
      </Tooltip>
    )

  return (
    <Checkbox {...otherProps} checked={checked} onChange={onChange}>
      {inner}
    </Checkbox>
  )
}

export function HelpInfo({
  children,
  iconProps,
  tooltipProps,
}: {
  children?: ReactNode
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  iconProps?: SetOptional<ComponentProps<typeof IconPark>, 'name'>
}) {
  return (
    <>
      {children && (
        <AntdTooltip {...tooltipProps} title={children}>
          <IconPark
            name={'Info'}
            size={18}
            {...iconProps}
            style={{
              cursor: 'pointer',
              marginLeft: '4px',
              ...iconProps?.style,
            }}
          />
        </AntdTooltip>
      )}
    </>
  )
}
