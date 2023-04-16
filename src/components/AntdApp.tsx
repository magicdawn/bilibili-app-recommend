import { useIsDarkMode } from '$platform'
import { ConfigProvider, Tooltip, theme } from 'antd'
import { ComponentProps, ReactNode } from 'react'

export function AntdApp({ children }: { children: ReactNode }) {
  const dark = useIsDarkMode()

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#ff6699',
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
      zIndex={11100}
      overlayStyle={{ width: 'max-content', maxWidth: '50vw', ...props.overlayInnerStyle }}
    >
      {props.children}
    </Tooltip>
  )
}
