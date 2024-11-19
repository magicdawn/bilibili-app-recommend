import { APP_CLS_ROOT, APP_NAMESPACE } from '$common'
import { $headerWidth, $usingEvolevdHeader, useBackToTopRight } from '$header'
import { useColors, useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { Global, css as _css, css } from '@emotion/react'
import { USING_FONT_FAMILY } from './AntdApp'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'
import {
  bgIdentifier,
  borderColorIdentifier,
  colorPrimaryIdentifier,
  colorPrimaryValue,
  getBorderColor,
} from './css-vars'

export function GlobalStyle() {
  const colorPrimary = useColorPrimaryHex()
  const { pureRecommend, styleUseCustomGrid, styleUseWhiteBackground, styleHideTopChannel } =
    useSettingsSnapshot()
  const dark = useIsDarkMode()
  const { c, bg } = useColors()
  const backToTopRight = useBackToTopRight()
  const usingEvolevdHeader = $usingEvolevdHeader.use()

  // 会有多次变宽的效果, 看起来很诡异!!!
  // bilibili-default -> 90 % -> evolved宽度计算
  const width = $headerWidth.use() ?? 90
  // const padding = width === 90 ? 0 : '0 10px'
  const padding = '0 10px'

  return (
    <>
      <Global
        styles={_css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
            --${APP_NAMESPACE}-bg-color: ${bg};
            --${APP_NAMESPACE}-color: ${c};
            ${borderColorIdentifier}: ${getBorderColor(dark, styleUseWhiteBackground)};
          }

          .${APP_CLS_ROOT} {
            font-family: ${USING_FONT_FAMILY};
            --back-top-right: 24px;

            .bili-video-card a:not(.disable-hover):hover{
              color: ${colorPrimaryValue} !important;
            }
          }

          @media (max-width: 1440px) {
            .${APP_CLS_ROOT} {
              --back-top-right: 16px;
            }
          }
        `}
      />

      {pureRecommend && (
        <Global
          styles={[
            css`
              /* hide original main, in case not deleted */
              #i_cecream .bili-feed4-layout {
                display: none;
              }

              /* download tip */
              /* 立即登录免费领大会员优惠券 */
              /* 广告 */
              .desktop-download-tip,
              .vip-login-tip,
              .palette-button-adcard {
                display: none !important;
              }
            `,

            styleUseCustomGrid &&
              css`
                /* enlarge container width */
                #i_cecream,
                .bili-feed4 .bili-header,
                .bili-feed4 .bili-header .bili-header__bar {
                  max-width: unset;
                }

                .bili-feed4-layout,
                .bili-feed4 .bili-header .bili-header__channel {
                  max-width: ${width}%;
                  /* 与 bilibili-evolve 视觉上对齐 */
                  padding: ${padding};
                }
              `,

            styleUseCustomGrid &&
              typeof backToTopRight === 'number' &&
              css`
                .${APP_CLS_ROOT} {
                  --back-top-right: ${backToTopRight}px;
                }
              `,

            styleHideTopChannel &&
              css`
                .bili-header__channel,
                .bili-header__banner {
                  display: none !important;
                }

                ${!usingEvolevdHeader &&
                css`
                  .bili-feed4 .bili-header {
                    min-height: 64px !important;
                  }
                `}

                .bili-feed4 .bili-header .bili-header__bar {
                  &.slide-down,
                  &:not(.slide-down) {
                    animation: headerSlideDown 0.3s linear forwards !important;
                    box-shadow: 0 2px 4px ${dark ? 'rgb(255 255 255 / 5%)' : 'rgb(0 0 0 / 8%)'} !important;
                  }
                }

                .bili-header__bar:not(.slide-down) {
                  background-color: var(--bg1);
                  color: var(--text1);
                  transition: background-color 0.2s linear;
                  animation-name: headerSlideDown;

                  .left-entry {
                    .mini-header__title,
                    .entry-title,
                    .default-entry,
                    .loc-mc-box__text,
                    .download-entry,
                    .loc-entry {
                      color: var(--text1);
                    }
                  }
                  .right-entry .right-entry__outside {
                    .right-entry-text,
                    .right-entry-icon {
                      color: var(--text2);
                    }
                  }
                }

                .area-header-wrapper {
                  margin-top: 10px;
                }
              `,

            /**
             * background-color
             */
            styleUseWhiteBackground
              ? css`
                  :root {
                    ${bgIdentifier}: var(--bg1);
                  }
                  /* same as #i_cecream */
                  body {
                    background-color: var(--bg1);
                  }
                `
              : css`
                  :root {
                    ${bgIdentifier}: var(--bg2);
                  }
                  body,
                  .large-header,
                  #i_cecream,
                  .bili-header .bili-header__channel {
                    background-color: var(--bg2);
                  }

                  .bili-header .bili-header__channel .channel-entry-more__link,
                  .bili-header .bili-header__channel .channel-link {
                    background-color: var(--bg1);
                  }
                `,
            dark &&
              css`
                :root {
                  ${bgIdentifier}: #222;
                }
              `,
          ]}
        />
      )}
    </>
  )
}
