import { APP_NAME, APP_NAME_ROOT_CLASSNAME } from '$common'
import { $headerWidth } from '$header'
import { useColors, useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { UseApp } from '$utility/antd-static'
import { StyleProvider, type StyleProviderProps } from '@ant-design/cssinjs'
import { cache as emotionCssDefaultCache } from '@emotion/css'
import { CacheProvider, Global, css as _css, css, type EmotionCache } from '@emotion/react'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ComponentProps, ReactNode } from 'react'
import {
  colorPrimaryIdentifier,
  colorPrimaryValue,
  useColorPrimaryHex,
  useCurrentTheme,
} from './ModalSettings/theme.shared'

// https://github.com/emotion-js/emotion/issues/1105
emotionCssDefaultCache.compat = true

// bilibili.com default: PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif
const USING_FONT_FAMILY = 'HarmonyOS_Regular,PingFang SC,Helvetica Neue,Microsoft YaHei,sans-serif'
// const USING_FONT_FAMILY = 'PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif'

function compose(...fns: ((c: ReactNode) => ReactNode)[]) {
  return function (c: ReactNode) {
    return fns.reduceRight((content, fn) => fn(content), c)
  }
}

export function AntdApp({
  children,
  injectGlobalStyle = false,
  renderAppComponent = false,
  emotionCache = emotionCssDefaultCache,
  styleProviderProps,
}: {
  children: ReactNode
  injectGlobalStyle?: boolean
  renderAppComponent?: boolean
  emotionCache?: EmotionCache
  styleProviderProps?: StyleProviderProps
}) {
  const dark = useIsDarkMode()
  const colorPrimary = useColorPrimaryHex()

  const wrap = compose(
    // emotion cache
    (c) => <CacheProvider value={emotionCache}>{c}</CacheProvider>,

    // antd style
    (c) => <StyleProvider {...styleProviderProps}>{c}</StyleProvider>,

    // antd config
    (c) => (
      <ConfigProvider
        locale={zhCN}
        button={{ autoInsertSpace: false }}
        theme={{
          cssVar: true,
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary,
            colorBgSpotlight: colorPrimary, // tooltip bg
            zIndexPopupBase: 11000, // base-modal 10002
            fontFamily: USING_FONT_FAMILY,
          },
          components: {
            // Message: {
            //   contentBg: colorPrimary,
            //   colorText: '#fff',
            // },
          },
        }}
      >
        {c}
      </ConfigProvider>
    ),
  )

  return wrap(
    <>
      {renderAppComponent && <UseApp />}
      {injectGlobalStyle && <GlobalStyle />}
      {children}
    </>,
  )
}

function GlobalStyle() {
  const { colorPrimary } = useCurrentTheme()
  const { pureRecommend, styleUseCustomGrid, styleUseWhiteBackground } = useSettingsSnapshot()
  const { c, bg } = useColors()

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
            --${APP_NAME}-color: ${c};
            --${APP_NAME}-bg-color: ${bg};
          }

          .${APP_NAME_ROOT_CLASSNAME} {
            font-family: ${USING_FONT_FAMILY};
            --back-top-right: 24px;

            .bili-video-card a:not(.disable-hover):hover{
              color: ${colorPrimaryValue} !important;
            }
          }

          @media (max-width: 1440px) {
            .${APP_NAME_ROOT_CLASSNAME} {
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

              /* em 有点深井冰 */
              /* :root {
                scrollbar-color: ${colorPrimaryValue} #f69;
              } */
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

            // handle background-color
            styleUseWhiteBackground
              ? css`
                  /* same as #i_cecream */
                  body {
                    background-color: var(--bg1);
                  }
                `
              : css`
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
          ]}
        />
      )}
    </>
  )
}

export function AntdTooltip(props: ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      {...props}
      overlayStyle={{
        width: 'max-content',
        maxWidth: '50vw',
        ...props.overlayInnerStyle,
      }}
    >
      {props.children}
    </Tooltip>
  )
}
