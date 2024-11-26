import { APP_NAMESPACE } from '$common'
import { useIsDarkMode } from '$modules/dark-mode'
import { UseApp } from '$utility/antd-static'
import { StyleProvider, type StyleProviderProps } from '@ant-design/cssinjs'
import { cache as emotionCssDefaultCache } from '@emotion/css'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ReactNode } from 'react'
import { GlobalStyle } from './GlobalStyle'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'

// https://github.com/emotion-js/emotion/issues/1105
emotionCssDefaultCache.compat = true

/**
 * bilibili.com default: PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif
 *
 * 由于 B站 默认 css, 加上了 !important, 这里如果需要自定义也需要加上
 * 优先使用 Bilibili-Evolved 自定义字体 `--custom-font-family--options--font-family`
 */
export const APP_CUSTOM_FONT_IDENTIFIER = `--${APP_NAMESPACE}-custom-font-family`
export const APP_CUSTOM_FONT = `'Alibaba PuHuiTi 3.0',PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif`
export const USING_FONT = `var(--custom-font-family--options--font-family, var(${APP_CUSTOM_FONT_IDENTIFIER})) !important`

function compose(...fns: Array<(c: ReactNode) => ReactNode>) {
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
            fontFamily: USING_FONT,
          },
          components: {
            Notification: {
              zIndexPopup: 11000,
            },
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
