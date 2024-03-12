/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { flexCenterStyle } from '$common/emotion-css'
import { HelpInfo } from '$components/piece'
import { IconPark } from '$icon-park'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { ColorPicker } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { DEFAULT_BILI_PINK_THEME, ThemeGroups, useCurrentTheme } from './theme.shared'

export function ThemesSelect() {
  const activeId = useCurrentTheme().id

  // color-picker
  const { colorPickerThemeSelectedColor } = useSettingsSnapshot()
  const [customColor, setCustomColor] = useState<Color | string>(
    colorPickerThemeSelectedColor || DEFAULT_BILI_PINK_THEME.colorPrimary,
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
              <HelpInfo
                children={tooltip}
                tooltipProps={{ color: 'rgba(0, 0, 0, 0.85)' }} // 默认使用 colorPrimary, 链接可能看不清
                iconProps={{ name: 'Tips', size: 16 }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
              {themes.map((t) => {
                const isActive = activeId === t.id
                const isCustom = t.isCustom

                const innerSize = 30
                const outerSize = innerSize + 8

                let previewWrapper: ReactNode = (
                  <div
                    className='preview-wrapper'
                    css={[
                      css`
                        aspect-ratio: 1;
                        width: ${outerSize}px;
                        border: 2px solid transparent;
                        border-radius: 50%;
                        /* border-radius: 6px; */
                        margin: 0 auto;
                        font-size: 0;
                      `,
                      flexCenterStyle,
                      isActive &&
                        css`
                          border-color: ${t.colorPrimary};
                        `,
                    ]}
                  >
                    <div
                      className='preview'
                      css={[
                        css`
                          aspect-ratio: 1;
                          width: ${innerSize}px;
                          background-color: ${isCustom ? customColorHex : t.colorPrimary};
                          border-radius: 50%;
                          /* border-radius: 4px; */
                        `,
                        flexCenterStyle,
                      ]}
                    >
                      {isActive && <IconPark name='CheckSmall' size={18} fill='#fff' />}
                    </div>
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
                          updateSettings({
                            colorPickerThemeSelectedColor: customColorHex,
                          })
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
