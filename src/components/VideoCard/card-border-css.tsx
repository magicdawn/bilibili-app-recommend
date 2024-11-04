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
import { bgValue, borderRadiusValue } from './index.shared'

const c = `oklch(from ${colorPrimaryValue} calc(l + 0.1) c h)`
const borderAndShadow = css`
  border-color: ${c};
  box-shadow: 0px 0px 9px 4px ${c};
`

const hightlightBackground = (dark: boolean, styleUseWhiteBackground: boolean) => {
  const bg = dark
    ? `oklch(from ${bgValue} calc(l + 0.025) c h)`
    : `oklch(from ${bgValue} calc(l - 0.03) c h)`
  return css`
    background-color: ${bg};
  `
}

const coverZoom = css`
  /* cover zoom */
  .bili-video-card__cover {
    transform-origin: center center;
    transition: transform 0.2s ease-out;
    transform: scale(1.05);
  }
`

export function useCardBorderCss(): TheCssType {
  const {
    styleUseCardBorder: useBorder,
    styleUseCardBorderOnlyOnHover: useBorderOnlyOnHover,
    styleUseCardBoxShadow: useBoxShadow,
    styleUseWhiteBackground,
    useDelayForHover,
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
            ${useDelayForHover && coverZoom}
          }
        `,
        !useBorderOnlyOnHover &&
          css`
            border-color: ${borderColorValue};
          `,
      ],
    ]
  }, [
    useBorder,
    useBorderOnlyOnHover,
    useBoxShadow,
    dark,
    styleUseWhiteBackground,
    useDelayForHover,
  ])
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
