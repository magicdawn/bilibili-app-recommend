import { css } from '@emotion/react'

export const flexVerticalCenterStyle = css`
  display: flex;
  align-items: center;
`

export const flexCenterStyle = css`
  ${flexVerticalCenterStyle}
  justify-content: center;
`

// harmonyos_regular 没法对齐
export const antdBtnTextStyle = css`
  display: inline-block;
  margin-top: 2px;
`
