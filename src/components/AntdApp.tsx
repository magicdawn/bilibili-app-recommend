import { useIsDarkMode } from '$platform'
import { ConfigProvider, theme } from 'antd'
import { ReactNode } from 'react'

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
