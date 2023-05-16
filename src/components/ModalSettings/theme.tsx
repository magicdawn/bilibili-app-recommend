/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { updateSettings, useSettingsSnapshot } from '$settings'
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
            style={{
              minWidth: '70px',
              textAlign: 'center',
              margin: '0 20px 20px 0',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              updateSettings({ theme: t.id })
            }}
          >
            <div
              className='preview-wrapper'
              style={{
                width: '50px',
                height: '50px',
                padding: '3px',
                border: '2px solid transparent',
                borderRadius: '5px',
                margin: '0 auto',
                borderColor: isActive ? `${t.colorPrimary}` : 'transparent',
              }}
            >
              <div
                className='preview'
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: `${t.colorPrimary}`,
                  borderRadius: '5px',
                }}
              />
            </div>
            {t.name}
          </div>
        )
      })}
    </div>
  )
}
