/**
 * inspired by styles of
 * - https://ai.taobao.com
 * - https://xlog.app/hottest
 *
 * box-shadow playground
 * https://box-shadow.dev/
 */

import { borderColorValue, colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import type { TheCssType } from '$utility/type'
import { borderRadiusValue } from './index.shared'

const borderAndShadow = css`
  border-color: ${colorPrimaryValue};
  box-shadow: 0px 0px 9px 4px ${colorPrimaryValue};
`

const hightlightBackground = (dark: boolean, styleUseWhiteBackground: boolean) => {
  let color
  if (dark) {
    color = '#2d2d2d'
  } else {
    if (styleUseWhiteBackground) {
      color = '#f4f4f5'
    } else {
      color = '#ebeced'
    }
  }
  return css`
    background-color: ${color};
  `
}

export function useCardBorderCss(): TheCssType {
  const {
    styleUseCardBorder: useBorder,
    styleUseCardBorderOnlyOnHover: useBorderOnlyOnHover,
    styleUseCardBoxShadow: useBoxShadow,
    styleUseWhiteBackground,
  } = useSettingsSnapshot()

  const dark = useIsDarkMode()

  return useMemo(() => {
    return [
      css`
        border: 1px solid transparent;
        transition:
          border-color 0.3s ease-in-out,
          box-shadow 0.3s ease-in-out;
      `,

      useBorder && [
        css`
          cursor: pointer;
          border-radius: ${borderRadiusValue};
          &:hover {
            border-color: ${borderColorValue};
            ${useBoxShadow ? borderAndShadow : hightlightBackground(dark, styleUseWhiteBackground)}

            /* cover zoom */
            .bili-video-card__cover {
              transform-origin: center center;
              transition: transform 0.2s ease-out;
              transform: scale(1.05);
            }
          }
        `,
        !useBorderOnlyOnHover &&
          css`
            border-color: ${borderColorValue};
          `,
      ],
    ]
  }, [useBorder, useBorderOnlyOnHover, useBoxShadow, dark, styleUseWhiteBackground])
}

export function getActiveCardBorderCss(active: boolean): TheCssType {
  return (
    active &&
    css`
      border-radius: ${borderRadiusValue};
      ${borderAndShadow}
    `
  )
}
