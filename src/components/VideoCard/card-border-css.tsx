/**
 * inspired by styles of
 * - https://ai.taobao.com
 * - https://xlog.app/hottest
 *
 * box-shadow playground
 * https://box-shadow.dev/
 */

import { borderColorValue, colorPrimaryValue } from '$components/css-vars'
import { useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { tweakLightness } from '$utility/css'
import type { TheCssType } from '$utility/type'
import { bgValue, borderRadiusValue } from '../css-vars'

const c = tweakLightness(colorPrimaryValue, 0.1)
const borderAndShadow = css`
  border-color: ${c};
  box-shadow: 0px 0px 9px 4px ${c};
`

const hightlightBackground = (dark: boolean) => {
  return css`
    background-color: ${tweakLightness(bgValue, dark ? 0.03 : -0.04)};
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
    __internalVideoCardUsePadding,
  } = useSettingsSnapshot()

  const dark = useIsDarkMode()

  return useMemo(() => {
    return [
      css`
        border: 1px solid transparent;
        transition-property: border-color, box-shadow, background-color;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
      `,

      useBorder && [
        css`
          cursor: pointer;
          border-radius: ${borderRadiusValue};
          &:hover {
            border-color: ${borderColorValue};
            ${hightlightBackground(dark)}
            ${useBoxShadow && borderAndShadow}
            ${useDelayForHover && coverZoom}
          }
        `,

        !useBorderOnlyOnHover &&
          css`
            border-color: ${borderColorValue};
          `,

        // add padding & negative margin
        useBorderOnlyOnHover &&
          !useBoxShadow &&
          __internalVideoCardUsePadding &&
          css`
            margin-inline: -6px;
            .bili-video-card__wrap {
              padding: 6px;
              padding-bottom: 0;
            }
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
    __internalVideoCardUsePadding,
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
