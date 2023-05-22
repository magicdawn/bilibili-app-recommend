/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { HelpInfo } from '$components/piece'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { css } from '@emotion/react'
import { ColorPicker } from 'antd'
import { Color } from 'antd/es/color-picker'
import { Fragment, ReactNode, useMemo, useState } from 'react'
import LX_THEMES from './lx-themes.json'

export interface LxTheme {
  id: string
  name: string
  isDark?: boolean
  isCustom?: boolean
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

function toThemes(groupName: string, definitionStr: string): LxTheme[] {
  return definitionStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const [colorPrimary, name] = line.split(' ').filter(Boolean)
      return { id: groupName + ':' + name, name, colorPrimary }
    })
}

// https://www.bilibili.com/video/BV1g3411u7Lg/
const LongwashingGroupName = 'UP长期洗涤'
const LongwashingThemes = toThemes(
  LongwashingGroupName,
  `
  #0545b2 理想之蓝
  #f4cd00 柠檬黄
  #ef2729 石榴红
  #f89c00 鹿箭
  #233728 黛绿
  #f2b9b7 和熙粉
  #f3cc91 芝士黄
  #6b4c68 葡萄紫
  #ff7227 落日橙
  #004d62 碧海天
  #23909b 洗碧空
  #aeb400 芥丝绿
  #425a17 箬叶青

  #002FA7 克莱因蓝
  #003153 普鲁士蓝
  #01847F 马尔斯绿
  #FBD26A 申布伦黄
  #470024 勃艮第红
  #492D22 凡戴克棕
  `
)

const helpLinkCss = css`
  text-decoration: underline;
`

const ThemeGroups: { name: string; tooltip?: ReactNode; themes: LxTheme[] }[] = [
  {
    name: 'App',
    themes: [
      DEFAULT_BILI_PINK_THEME,
      { id: 'app-靓紫', name: '靓紫', colorPrimary: '#8500FF' },
      COLOR_PICKER_THEME,
    ],
  },
  {
    name: 'LX Themes',
    themes: LX_THEMES,
    tooltip: (
      <>
        提取自{' '}
        <a target='_blank' href='https://github.com/lyswhut/lx-music-desktop/' css={helpLinkCss}>
          lx-music-desktop
        </a>
        <br />
        Apache License 2.0
      </>
    ),
  },
  {
    name: LongwashingGroupName,
    themes: LongwashingThemes,
    tooltip: (
      <>
        提取自{' '}
        <a target='_blank' href='https://www.bilibili.com/video/BV1g3411u7Lg/' css={helpLinkCss}>
          BV1g3411u7Lg
        </a>{' '}
        &{' '}
        <a target='_blank' href='https://www.bilibili.com/video/BV1xu411q7sU/' css={helpLinkCss}>
          BV1xu411q7sU
        </a>
      </>
    ),
  },
]

const ALL_THEMES = ThemeGroups.map((x) => x.themes).flat()

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
    <div>
      {ThemeGroups.map(({ name, themes, tooltip }) => {
        return (
          <Fragment key={name}>
            <div
              css={css`
                font-size: 1.5em;
                display: flex;
                align-items: center;
                margin-top: 10px;
              `}
            >
              {name}
              <HelpInfo tooltip={tooltip} iconSize={22} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
              {themes.map((t) => {
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
                      // placement='topLeft'
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
                      min-width: 60px;
                      text-align: center;
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
          </Fragment>
        )
      })}
    </div>
  )
}
