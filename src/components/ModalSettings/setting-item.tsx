import { flexCenterStyle } from '$common/emotion-css'
import { AntdTooltip } from '$components/_base/antd-custom'
import type { BooleanSettingsKey } from '$modules/settings'
import { settings, updateSettings, useSettingsSnapshot } from '$modules/settings'
import { Button, Checkbox, Switch } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { ComponentProps, ReactNode } from 'react'

function useSettingsBooleanKey(
  configKey: BooleanSettingsKey,
  extraAction?: (val: boolean) => void,
) {
  const snap = useSettingsSnapshot()
  const checked = !!snap[configKey]
  const onChange = useCallback((val: boolean) => {
    updateSettings({ [configKey]: val })
    extraAction?.(val)
  }, [])
  const checkboxOnChange = useCallback((e: CheckboxChangeEvent) => {
    onChange(e.target.checked)
  }, [])
  const onToggle = useCallback(() => {
    onChange(!settings[configKey])
  }, [])
  return { checked, onChange, checkboxOnChange, onToggle }
}

type FlagSettingItemProps = ComponentProps<typeof __FlagSettingItem>

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
  label?: string | ((val: boolean) => ReactNode)
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  tooltipProps?: Omit<ComponentProps<typeof AntdTooltip>, 'title' | 'children'>
  as?: 'checkbox' | 'switch'
  checkboxProps?: ComponentProps<typeof Checkbox>
  switchProps?: ComponentProps<typeof Switch>
}) {
  const { checked, onChange, checkboxOnChange } = useSettingsBooleanKey(configKey, extraAction)

  const wrapTooltip = (children: ReactNode) => {
    if (!tooltip) return children
    return (
      <AntdTooltip {...tooltipProps} title={tooltip}>
        {children}
      </AntdTooltip>
    )
  }

  let usingLabel: ReactNode
  if (typeof label === 'function') {
    usingLabel = label(checked)
  } else {
    usingLabel = label || configKey
  }

  if (as === 'checkbox') {
    let inner: ReactNode = <span style={{ userSelect: 'none' }}>{usingLabel}</span>
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
  label?: FlagSettingItemProps['label']
  extraAction?: FlagSettingItemProps['extraAction']
  tooltip?: ReactNode
  tooltipProps?: FlagSettingItemProps['tooltipProps']
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
  extraAction?: FlagSettingItemProps['extraAction']
  tooltip?: ReactNode
  tooltipProps?: FlagSettingItemProps['tooltipProps']
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

export function ButtonSettingItem({
  configKey,
  tooltip,
  tooltipProps,
  extraAction,
  checkedChildren,
  unCheckedChildren,
}: {
  configKey: BooleanSettingsKey
  tooltip?: ReactNode
  tooltipProps?: FlagSettingItemProps['tooltipProps']
  extraAction?: (val: boolean) => void
  checkedChildren?: ReactNode
  unCheckedChildren?: ReactNode
}) {
  const { checked, onToggle } = useSettingsBooleanKey(configKey, extraAction)
  return (
    <AntdTooltip title={tooltip} {...tooltipProps}>
      <Button onClick={onToggle}>
        <div
          css={[
            flexCenterStyle,
            css`
              line-height: 1;
            `,
          ]}
        >
          {checked ? (checkedChildren ?? '✅') : (unCheckedChildren ?? '❎')}
        </div>
      </Button>
    </AntdTooltip>
  )
}
