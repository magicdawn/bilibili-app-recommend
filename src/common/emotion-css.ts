export const flexVerticalCenterStyle = css`
  display: flex;
  align-items: center;
`

export const inlineFlexVerticalCenterStyle = css`
  display: inline-flex;
  align-items: center;
`

export const flexCenterStyle = css`
  ${flexVerticalCenterStyle}
  justify-content: center;
`

// harmonyos_regular 没法对齐
export const antdBtnTextStyle = css`
  display: inline-block;
  margin-top: 1px;
`

export const antdCustomCss = {
  button: css`
    ${flexCenterStyle}
    >span {
      ${antdBtnTextStyle}
    }
  `,
}
