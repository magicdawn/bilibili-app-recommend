import { useIsDarkMode } from '$platform'
import { ConfigProvider, Tooltip, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ComponentProps, ReactNode } from 'react'
import { useCurrentTheme } from './ModalSettings/theme'

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
          zIndexPopupBase: 11000, // base-modal 10001
        },
      }}
    >
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
