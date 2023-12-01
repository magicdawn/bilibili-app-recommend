import { IconPark } from '$icon-park'
import type { BooleanSettingsKey } from '$settings'
import { updateSettings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility'
import { css } from '@emotion/react'
import { Checkbox, Tooltip } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { ComponentProps, ReactNode } from 'react'
import { useCallback } from 'react'
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

export const ModalFeedConfigChecks = function () {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <FlagSettingItem
        configKey={'initialShowMore'}
        label='自动查看更多'
        tooltip='打开首页时默认打开推荐弹窗'
        css={inModalFeedStyle}
        extraAction={(val) => {
          if (val) {
            toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
          }
        }}
      />

      <FlagSettingItem
        configKey='modalFeedFullScreen'
        label='全屏'
        tooltip='世界清净了~~~'
        css={inModalFeedStyle}
      />
    </>
  )
}

export function HelpInfo({
  tooltip,
  iconProps,
  tooltipProps,
}: {
  tooltip?: ReactNode
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  iconProps?: SetOptional<ComponentProps<typeof IconPark>, 'name'>
}) {
  return (
    <>
      {tooltip && (
        <AntdTooltip {...tooltipProps} title={tooltip}>
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
