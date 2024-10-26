import { AntdTooltip } from '$components/_base/antd-custom'
import type { BooleanSettingsKey } from '$modules/settings'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { Checkbox, Switch } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { ComponentProps, ReactNode } from 'react'

function __FlagSettingItem({
  configKey,
  label,
  extraAction,
  tooltip,
  tooltipProps,
  as,
  checkboxProps,
  switchProps,
}: {
  configKey: BooleanSettingsKey
  label?: string
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  tooltipProps?: Omit<ComponentProps<typeof AntdTooltip>, 'title' | 'children'>
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
    return (
      <AntdTooltip {...tooltipProps} title={tooltip}>
        {children}
      </AntdTooltip>
    )
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
  tooltipProps,
  ...otherProps
}: {
  configKey: BooleanSettingsKey
  label?: string
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  tooltipProps?: ComponentProps<typeof __FlagSettingItem>['tooltipProps']
} & ComponentProps<typeof Checkbox>) {
  return (
    <__FlagSettingItem
      {...{
        configKey,
        label,
        extraAction,
        tooltip,
        tooltipProps,
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
  tooltipProps,
  ...otherProps
}: {
  configKey: BooleanSettingsKey
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  tooltipProps?: ComponentProps<typeof __FlagSettingItem>['tooltipProps']
} & ComponentProps<typeof Switch>) {
  return (
    <__FlagSettingItem
      {...{
        configKey,
        extraAction,
        tooltip,
        tooltipProps,
        as: 'switch',
        switchProps: otherProps,
      }}
    />
  )
}
