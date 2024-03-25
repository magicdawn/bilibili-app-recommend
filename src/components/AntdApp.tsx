import { APP_NAME_ROOT_CLASSNAME } from '$common'
import { $headerWidth } from '$header'
import { useSettingsSnapshot } from '$modules/settings'
import { useIsDarkMode } from '$platform'
import { UseApp } from '$utility/antd-static'
import { Global, css as _css, css } from '@emotion/react'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
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
      autoInsertSpaceInButton={false}
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
          // Message: {
          //   contentBg: colorPrimary,
          //   colorText: '#fff',
          // },
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

  const width = $headerWidth.use() ?? 90

  return (
    <>
      <Global
        styles={_css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
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
            // hide default content
            css`
              /* hide original main, in case not deleted */
              #i_cecream .bili-feed4-layout {
                display: none;
              }

              /* enlarge container width */
              #i_cecream,
              .bili-feed4 .bili-header,
              .bili-feed4 .bili-header .bili-header__bar {
                max-width: unset;
              }

              .bili-feed4-layout,
              .bili-feed4 .bili-header .bili-header__channel {
                max-width: ${width}%;
                padding: 0;
              }
            `,

            // handle background-color
            styleFancy
              ? css`
                  body,
                  .large-header,
                  #i_cecream,
                  .bili-header .bili-header__channel {
                    background-color: var(--bg2);
                  }
                `
              : css`
                  /* same as #i_cecream */
                  body {
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
