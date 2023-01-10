import { ConfigKey, updateSettings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import { css } from '@emotion/react'
import { ChangeEventHandler, useCallback, useId } from 'react'

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

/**
 * Settings 上的功能开关
 */

export function SettingsCheckUi({
  className,
  label,
  checked,
  onChange,
}: {
  className?: string
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  const onChangeHandler: ChangeEventHandler = useCallback(
    (e) => {
      const val = (e.target as HTMLInputElement).checked
      onChange(val)
    },
    [onChange]
  )

  const id = useId()

  return (
    <span css={checkStyles.container} className={className}>
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={onChangeHandler}
        css={checkStyles.checkbox}
      />
      <label htmlFor={id} css={checkStyles.label}>
        {label}
      </label>
    </span>
  )
}

export function SettingsCheck({
  configKey,
  label,
  className,
}: {
  configKey: ConfigKey
  label?: string
  className?: string
}) {
  const snap = useSettingsSnapshot()

  const checked = !!snap[configKey]
  const onChange = useCallback((val: boolean) => {
    updateSettings({ [configKey]: val })

    // extra action
    if (val && configKey === 'initialShowMore') {
      toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹框')
    }
  }, [])

  return (
    <SettingsCheckUi
      className={className}
      label={label || configKey}
      checked={checked}
      onChange={onChange}
    />
  )
}

export const ModalFeedConfigChecks = function () {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <SettingsCheck configKey={'initialShowMore'} label='自动查看更多' css={inModalFeedStyle} />
      <SettingsCheck
        configKey={'useNarrowMode'}
        label='启用居中模式(居中两列)'
        css={inModalFeedStyle}
      />
    </>
  )
}
