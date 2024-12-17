import { css } from '@emotion/react'

export const FAV_PAGE_SIZE = 20

export const favSeparatorCss = {
  item: css`
    display: inline-flex;
    align-items: center;
    font-size: 15px;

    &:not(:first-child) {
      margin-left: 30px;
    }

    /* the icon */
    svg {
      margin-right: 5px;
      margin-top: -1px;
    }
  `,
}
