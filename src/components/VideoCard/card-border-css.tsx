/**
 * inspired by styles of
 * - https://ai.taobao.com
 * - https://xlog.app/hottest
 *
 * box-shadow playground
 * https://box-shadow.dev/
 */

import { APP_NAMESPACE } from '$common'
import { borderColorValue, colorPrimaryValue } from '$components/css-vars'
import { useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { tweakLightness } from '$utility/css'
import type { TheCssType } from '$utility/type'
import { css as _css } from '@emotion/react'
import { bgValue, borderRadiusValue } from '../css-vars'

const c = tweakLightness(colorPrimaryValue, 0.1)
const borderAndShadow = css`
  border-color: ${c};
  box-shadow: 0px 0px 9px 4px ${c};
`

export function getBg(dark: boolean) {
  const factor = dark ? 1 : -1
  return {
    lv1: tweakLightness(bgValue, dark ? 0.03 : -0.04),
    lv2: tweakLightness(bgValue, 0.08 * factor),
    lv3: tweakLightness(bgValue, 0.12 * factor),
  }
}
export function useBg() {
  const dark = useIsDarkMode()
  return useMemo(() => getBg(dark), [dark])
}

const getHlBgCss = (dark: boolean) => {
  return css`
    background-color: ${getBg(dark).lv1};
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

/**
 * for dislike & blacklist card
 * - show border ALWAYS
 * - hover highlight bg
 * - hover highlight separator
 */
export function useInNormalCardCss(showingInNormalCard: boolean): TheCssType {
  const bg = useBg()
  const sepIdentifier = `--${APP_NAMESPACE}-separator-color`
  return useMemo(() => {
    if (!showingInNormalCard) return undefined
    return _css`
      border-color: ${borderColorValue};
      background-color: ${bgValue};
      ${sepIdentifier}: ${bg.lv1};
      &:hover {
        background-color: ${bg.lv1};
        ${sepIdentifier}: ${bg.lv2};
      }

      /* disable padding */
      margin-inline: 0;
      .bili-video-card__wrap {
        padding: 0;
      }
    `
  }, [bg, showingInNormalCard])
}

export function useCardBorderCss(): TheCssType {
  const {
    styleUseCardBorder: useBorder,
    styleUseCardBorderOnlyOnHover: useBorderOnlyOnHover,
    styleUseCardBoxShadow: useBoxShadow,
    styleUseWhiteBackground,
    useDelayForHover,
    styleUseCardPadding,
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
            ${getHlBgCss(dark)}
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
          styleUseCardPadding &&
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
    styleUseCardPadding,
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
