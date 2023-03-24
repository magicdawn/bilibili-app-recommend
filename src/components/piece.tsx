import { ConfigKey, updateSettings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import { css } from '@emotion/react'
import { ChangeEventHandler, useCallback, useId } from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

const checkStyles = {
  container: css`
    display: inline-flex;
    align-items: center;
  `,
  checkbox: css`
    cursor: pointer;
    outline: none;
  `,
  label: css`
    margin-left: 2px;
    user-select: none;
    cursor: pointer;
  `,
}

export function FlagSettingItem({
  configKey,
  label,
  className,
  extraAction,
}: {
  configKey: ConfigKey
  label?: string
  className?: string
  extraAction?: (val: boolean) => void | Promise<void>
}) {
  const snap = useSettingsSnapshot()

  const checked = !!snap[configKey]
  const onChange = useCallback((e: CheckboxChangeEvent) => {
    const val = e.target.checked
    updateSettings({ [configKey]: val })
    extraAction?.(val)
  }, [])

  return (
    <Checkbox className={className} checked={checked} onChange={onChange}>
      {label || configKey}
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
      <FlagSettingItem
        configKey={'useNarrowMode'}
        label='启用居中模式(居中两列)'
        css={inModalFeedStyle}
      />
    </>
  )
}
