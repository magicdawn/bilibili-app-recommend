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

/**
 * emotion css helper, `C` = css-helper
 */

export const C = {
  size(size: number) {
    return css`
      width: ${size}px;
      height: ${size}px;
    `
  },
  ml(size: number) {
    return css`
      margin-left: ${size}px;
    `
  },
  mr(size: number) {
    return css`
      margin-right: ${size}px;
    `
  },
  mt(size: number) {
    return css`
      margin-top: ${size}px;
    `
  },
  mb(size: number) {
    return css`
      margin-bottom: ${size}px;
    `
  },
}
