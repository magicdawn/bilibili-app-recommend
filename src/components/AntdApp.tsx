import { useIsDarkMode } from '$platform'
import { useSettingsSnapshot } from '$settings'
import { Global, css as _css, css } from '@emotion/react'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ComponentProps, ReactNode } from 'react'
import { colorPrimaryIdentifier, useCurrentTheme } from './ModalSettings/theme'

export function AntdApp({
  children,
  injectGlobalStyle = false,
}: {
  children: ReactNode
  injectGlobalStyle?: boolean
}) {
  const dark = useIsDarkMode()
  const { colorPrimary } = useCurrentTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary,
          colorBgSpotlight: colorPrimary, // tooltip bg
          zIndexPopupBase: 11000, // base-modal 10002
          // bilibili.com default: PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif
          fontFamily: 'inherit', // use default
        },
      }}
    >
      {injectGlobalStyle && <GlobalStyle />}
      {children}
    </ConfigProvider>
  )
}

function GlobalStyle() {
  const { colorPrimary } = useCurrentTheme()
  const { styleFancy } = useSettingsSnapshot()

  return (
    <>
      <Global
        styles={_css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
          }
        `}
      />
      {styleFancy && (
        <Global
          styles={css`
            body,
            .large-header,
            #i_cecream,
            .bili-header .bili-header__channel {
              background-color: var(--bg2);
            }
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
      overlayStyle={{ width: 'max-content', maxWidth: '50vw', ...props.overlayInnerStyle }}
    >
      {props.children}
    </Tooltip>
  )
}
