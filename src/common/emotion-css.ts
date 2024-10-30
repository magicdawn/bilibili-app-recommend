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
const antdBtnTextStyle = css`
  display: inline-block;

  /* 不同 zoom 表现不同 */
  /* margin-top: 1px; */

  /* 使用 line-height 在不同 zoom 下表现更好 */
  line-height: var(--ant-control-height);
`

export const antdCustomCss = {}

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

// https://github.com/magicdawn/magicdawn/issues/136#issuecomment-2170532246
export const inlineContentHeightResetCss = css`
  line-height: 1;
  > * {
    vertical-align: top;
  }
`

export const iconOnlyRoundButtonCss = css`
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  ${flexCenterStyle}
`
