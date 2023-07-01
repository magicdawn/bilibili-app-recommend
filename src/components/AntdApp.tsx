import { useIsDarkMode } from '$platform'
import { Global, css as _css } from '@emotion/react'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ComponentProps, ReactNode } from 'react'
import { colorPrimaryIdentifier, useCurrentTheme } from './ModalSettings/theme'

export function AntdApp({ children }: { children: ReactNode }) {
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
          fontFamily: 'inherit', // use B 站首页默认字体, PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif
        },
      }}
    >
      <Global
        styles={_css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
          }
        `}
      />
      {children}
    </ConfigProvider>
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
