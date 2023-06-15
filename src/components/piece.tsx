import { IconPark } from '$icon-park'
import { BooleanConfigKey, updateSettings, useSettingsSnapshot } from '$settings'
import { css } from '@emotion/react'
import { Checkbox, Tooltip } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { ComponentProps, ReactNode, useCallback } from 'react'
import { SetOptional } from 'type-fest'
import { AntdTooltip } from './AntdApp'

export function FlagSettingItem({
  configKey,
  label,
  className,
  extraAction,
  tooltip,
}: {
  configKey: BooleanConfigKey
  label?: string
  className?: string
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
}) {
  const snap = useSettingsSnapshot()

  const checked = !!snap[configKey]
  const onChange = useCallback((e: CheckboxChangeEvent) => {
    const val = e.target.checked
    updateSettings({ [configKey]: val })
    extraAction?.(val)
  }, [])

  let inner: ReactNode = label || configKey
  if (tooltip)
    inner = (
      <Tooltip title={tooltip} overlayStyle={{ width: 'max-content', maxWidth: '50vw' }}>
        {inner}
      </Tooltip>
    )

  return (
    <Checkbox className={className} checked={checked} onChange={onChange}>
      {inner}
    </Checkbox>
  )
}

export const ModalFeedConfigChecks = function () {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <FlagSettingItem configKey={'initialShowMore'} label='自动查看更多' css={inModalFeedStyle} />
      <FlagSettingItem configKey={'useNarrowMode'} label='启用居中模式' css={inModalFeedStyle} />
    </>
  )
}

export function HelpInfo({
  tooltip,
  iconProps,
}: {
  tooltip?: ReactNode
  iconProps?: SetOptional<ComponentProps<typeof IconPark>, 'name'>
}) {
  return (
    <>
      {tooltip && (
        <AntdTooltip title={tooltip}>
          <IconPark
            name={'Info'}
            size={18}
            {...iconProps}
            style={{ cursor: 'pointer', marginLeft: '4px', ...iconProps?.style }}
          />
        </AntdTooltip>
      )}
    </>
  )
}
