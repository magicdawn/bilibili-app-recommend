import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { useIsDarkMode } from '$platform'
import { useSettingsSnapshot } from '$settings'
import { UseApp } from '$utility/antd-static'
import { Global, css as _css, css } from '@emotion/react'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ComponentProps, ReactNode } from 'react'
import {
  colorPrimaryIdentifier,
  colorPrimaryValue,
  useCurrentTheme,
} from './ModalSettings/theme.shared'

// bilibili.com default: PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif
const USING_FONT_FAMILY = 'HarmonyOS_Regular,PingFang SC,Helvetica Neue,Microsoft YaHei,sans-serif'
// const USING_FONT_FAMILY = 'PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif'

export function AntdApp({
  children,
  injectGlobalStyle = false,
  renderAppComponent = false,
}: {
  children: ReactNode
  injectGlobalStyle?: boolean
  renderAppComponent?: boolean
}) {
  const dark = useIsDarkMode()
  const { colorPrimary } = useCurrentTheme()

  return (
    <ConfigProvider
      locale={zhCN}
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
          Message: {
            contentBg: colorPrimary,
            colorText: '#fff',
          },
        },
      }}
    >
      {renderAppComponent && <UseApp />}
      {injectGlobalStyle && <GlobalStyle />}

      {/* using framer-motion UMD */}
      {/* <LazyMotion features={domAnimation}>{children}</LazyMotion> */}
      {children}
    </ConfigProvider>
  )
}

function GlobalStyle() {
  const { colorPrimary } = useCurrentTheme()
  const { styleFancy, pureRecommend } = useSettingsSnapshot()

  return (
    <>
      <Global
        styles={_css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
          }

          .${APP_NAME_ROOT_CLASSNAME} {
            font-family: ${USING_FONT_FAMILY};

            .bili-video-card a:not(.disable-hover):hover{
              color: ${colorPrimaryValue} !important;
            }
          }
        `}
      />
      {pureRecommend && (
        <Global
          styles={css`
            /* 刷新内容按钮 */
            .palette-button-outer {
              .palette-button-wrap {
                .flexible-roll-btn {
                  display: none;
                }
              }
            }
          `}
        />
      )}
      {pureRecommend && styleFancy && (
        <Global
          styles={css`
            body,
            .large-header,
            #i_cecream,
            .bili-header .bili-header__channel {
              background-color: var(--bg2);
            }

            /* @media (min-width: 1140px) and (max-width: 1299.9px) {
              :root {
                --layout-padding: 60px;
              }
            }
            @media (min-width: 1400px) and (max-width: 1559.9px) {
              :root {
                --layout-padding: 60px;
              }
            }
            @media (min-width: 1560px) and (max-width: 2059.9px) {
              :root {
                --layout-padding: 80px;
              }
            }
            @media (min-width: 2060px) {
              :root {
                --layout-padding: 100px;
              }
            } */

            /* .palette-button-outer {
              .palette-button-wrap {
                left: unset !important;
                right: 30px;
                bottom: 80px;
              }
            } */
          `}
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
