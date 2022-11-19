import { ConfigKey, updateConfig, useConfigSnapshot } from '$settings'
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
 * Config 上的功能开关
 */

export function ConfigCheck({
  configKey,
  label,
  className,
}: {
  configKey: ConfigKey
  label?: string
  className?: string
}) {
  const snap = useConfigSnapshot()

  const checked = !!snap[configKey]
  const onChange: ChangeEventHandler = useCallback((e) => {
    const val = (e.target as HTMLInputElement).checked
    updateConfig({ [configKey]: val })

    // extra action
    if (val && configKey === 'initialShowMore') {
      toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹框')
    }
  }, [])

  const id = useId()

  return (
    <span css={checkStyles.container} className={className}>
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={onChange}
        css={checkStyles.checkbox}
      />
      <label htmlFor={id} css={checkStyles.label}>
        {label || configKey}
      </label>
    </span>
  )
}

export const ModalFeedConfigChecks = function () {
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <ConfigCheck configKey={'initialShowMore'} label='自动查看更多' css={inModalFeedStyle} />
      <ConfigCheck configKey={'useNarrowMode'} label='启用窄屏模式' css={inModalFeedStyle} />
    </>
  )
}
