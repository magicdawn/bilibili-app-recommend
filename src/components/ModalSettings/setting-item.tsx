import type { BooleanSettingsKey } from '$modules/settings'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { AntdTooltip } from '$ui-components/antd-custom'
import { Checkbox, Switch } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { ReactNode } from 'react'

function __FlagSettingItem({
  configKey,
  label,
  extraAction,
  tooltip,
  as,
  checkboxProps,
  switchProps,
}: {
  configKey: BooleanSettingsKey
  label?: string
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  as?: 'checkbox' | 'switch'
  checkboxProps?: ComponentProps<typeof Checkbox>
  switchProps?: ComponentProps<typeof Switch>
}) {
  const snap = useSettingsSnapshot()
  const checked = !!snap[configKey]
  const onChange = useCallback((val: boolean) => {
    updateSettings({ [configKey]: val })
    extraAction?.(val)
  }, [])
  const checkboxOnChange = useCallback((e: CheckboxChangeEvent) => {
    onChange(e.target.checked)
  }, [])

  const wrapTooltip = (children: ReactNode) => {
    if (!tooltip) return children
    return <AntdTooltip title={tooltip}>{children}</AntdTooltip>
  }

  if (as === 'checkbox') {
    let inner: ReactNode = <span style={{ userSelect: 'none' }}>{label || configKey}</span>
    if (tooltip) inner = wrapTooltip(inner)
    return (
      <Checkbox {...checkboxProps} checked={checked} onChange={checkboxOnChange}>
        {inner}
      </Checkbox>
    )
  }

  if (as === 'switch') {
    let content: ReactNode = <Switch {...switchProps} checked={checked} onChange={onChange} />
    if (tooltip) content = wrapTooltip(content)
    return content
  }
}

export function CheckboxSettingItem({
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
  return (
    <__FlagSettingItem
      {...{
        configKey,
        label,
        extraAction,
        tooltip,
        as: 'checkbox',
        checkboxProps: otherProps,
      }}
    />
  )
}

export function SwitchSettingItem({
  configKey,
  extraAction,
  tooltip,
  ...otherProps
}: {
  configKey: BooleanSettingsKey
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
} & ComponentProps<typeof Switch>) {
  return (
    <__FlagSettingItem
      {...{
        configKey,
        extraAction,
        tooltip,
        as: 'switch',
        switchProps: otherProps,
      }}
    />
  )
}
