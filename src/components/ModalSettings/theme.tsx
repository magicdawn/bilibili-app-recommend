/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { css } from '@emotion/react'
import { ColorPicker } from 'antd'
import { Color } from 'antd/es/color-picker'
import { ReactNode, useMemo, useState } from 'react'
import LX_THEMES from './lx-themes.json'

export interface LxTheme {
  id: string
  name: string
  isDark: boolean
  isCustom: boolean
  colorPrimary: string
}

export const DEFAULT_BILI_PINK_THEME: LxTheme = {
  id: 'default-bili-pink',
  name: 'B站粉',
  isDark: false,
  isCustom: false,
  colorPrimary: '#ff6699',
}

export const COLOR_PICKER_THEME: LxTheme = {
  id: 'color-picker',
  name: '自定义',
  isDark: false,
  isCustom: true,
  colorPrimary: '#ff6699',
}

const ALL_THEMES = [DEFAULT_BILI_PINK_THEME, ...LX_THEMES, COLOR_PICKER_THEME]

/**
 * use outside React
 */
export function getCurrentTheme() {
  const theme =
    ALL_THEMES.find((t) => t.id === (settings.theme || DEFAULT_BILI_PINK_THEME.id)) ||
    DEFAULT_BILI_PINK_THEME
  if (theme.id === COLOR_PICKER_THEME.id && settings.colorPickerThemeSelectedColor) {
    theme.colorPrimary = settings.colorPickerThemeSelectedColor
  }
  return theme
}

/**
 * react hook
 */
export function useCurrentTheme() {
  let { theme: themeId, colorPickerThemeSelectedColor } = useSettingsSnapshot()
  themeId ||= DEFAULT_BILI_PINK_THEME.id
  return useMemo(() => {
    const theme = ALL_THEMES.find((t) => t.id === themeId) || DEFAULT_BILI_PINK_THEME
    if (theme.id === COLOR_PICKER_THEME.id && colorPickerThemeSelectedColor) {
      theme.colorPrimary = colorPickerThemeSelectedColor
    }
    return theme
  }, [themeId, colorPickerThemeSelectedColor])
}

export function ThemesSelect() {
  const activeId = useCurrentTheme().id

  // color-picker
  const { colorPickerThemeSelectedColor } = useSettingsSnapshot()
  const [customColor, setCustomColor] = useState<Color | string>(
    colorPickerThemeSelectedColor || DEFAULT_BILI_PINK_THEME.colorPrimary
  )
  const customColorHex = useMemo(() => {
    return typeof customColor === 'string' ? customColor : customColor.toHexString()
  }, [customColor])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {ALL_THEMES.map((t) => {
        const isActive = activeId === t.id
        const isCustom = t.isCustom

        const preview = (
          <div
            className='preview'
            css={css`
              width: 100%;
              height: 100%;
              background-color: ${isCustom ? customColorHex : t.colorPrimary};
              border-radius: 5px;
            `}
          />
        )

        let previewWrapper: ReactNode = (
          <div
            className='preview-wrapper'
            css={[
              css`
                width: 50px;
                height: 50px;
                padding: 3px;
                border: 2px solid transparent;
                border-radius: 5px;
                margin: 0 auto;
              `,
              isActive &&
                css`
                  border-color: ${t.colorPrimary};
                `,
            ]}
          >
            {preview}
          </div>
        )

        if (t.isCustom) {
          previewWrapper = (
            <ColorPicker
              value={customColor}
              onChange={(c) => setCustomColor(c)}
              onOpenChange={(open) => {
                // 关闭时
                if (!open) {
                  updateSettings({ colorPickerThemeSelectedColor: customColorHex })
                }
              }}
            >
              {previewWrapper}
            </ColorPicker>
          )
        }

        return (
          <div
            key={t.id}
            css={css`
              min-width: 70px;
              text-align: center;
              margin: 0 15px 15px 0;
              cursor: pointer;
            `}
            onClick={(e) => {
              updateSettings({ theme: t.id })
            }}
          >
            {previewWrapper}
            {t.name}
          </div>
        )
      })}
    </div>
  )
}
