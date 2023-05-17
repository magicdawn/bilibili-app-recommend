/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { css } from '@emotion/react'
import { useMemo } from 'react'
import LX_THEMES from './lx-themes.json'

export interface LxTheme {
  id: string
  name: string
  isDark: boolean
  isCustom: boolean
  colorPrimary: string
  colorTheme: string
}

export const DEFAULT_BILI_PINK_THEME: LxTheme = {
  id: 'default-bili-pink',
  name: 'B站小粉红',
  isDark: false,
  isCustom: false,
  colorPrimary: '#ff6699',
  colorTheme: '#ff6699',
}

const ALL_THEMES = [DEFAULT_BILI_PINK_THEME, ...LX_THEMES]

/**
 * use outside React
 */
export function getCurrentTheme() {
  return (
    ALL_THEMES.find((t) => t.id === (settings.theme || DEFAULT_BILI_PINK_THEME.id)) ||
    DEFAULT_BILI_PINK_THEME
  )
}

/**
 * react hook
 */
export function useCurrentTheme() {
  const themeId = useSettingsSnapshot().theme || DEFAULT_BILI_PINK_THEME.id
  return useMemo(() => {
    return ALL_THEMES.find((t) => t.id === themeId) || DEFAULT_BILI_PINK_THEME
  }, [themeId])
}

export function ThemesSelect() {
  const activeId = useCurrentTheme().id

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {ALL_THEMES.map((t) => {
        const isActive = activeId === t.id
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
              <div
                className='preview'
                css={css`
                  width: 100%;
                  height: 100%;
                  background-color: ${t.colorPrimary};
                  border-radius: 5px;
                `}
              />
            </div>
            {t.name}
          </div>
        )
      })}
    </div>
  )
}
