import { APP_NAME } from '$common'
import { C } from '$common/emotion-css'
import type { Settings } from '$modules/settings'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { AntdMessage, shouldDisableShortcut } from '$utility'
import { Tag } from 'antd'
import { isEqual } from 'es-toolkit'
import { pick } from 'radash'
import styles from '../index.module.scss'
import { explainForFlag } from '../index.shared'
import { CheckboxSettingItem } from '../setting-item'
import { ResetPartialSettingsButton, SettingsGroup } from './_shared'

type CardBorderState = Partial<
  Pick<Settings, 'styleUseCardBorder' | 'styleUseCardBorderOnlyOnHover'>
>
const borderCycleList: CardBorderState[] = [
  { styleUseCardBorder: false }, // no border
  { styleUseCardBorder: true, styleUseCardBorderOnlyOnHover: true }, // on hover
  { styleUseCardBorder: true, styleUseCardBorderOnlyOnHover: false }, // always
]
const borderCycleListLabels = [
  '「卡片边框」: 禁用',
  '「卡片边框」: 仅在悬浮时显示',
  '「卡片边框」: 总是显示',
]
export function useHotkeyForConfigBorder() {
  // useHotkeyForConfig(['shift.b'], 'styleUseCardBorder', '卡片边框')
  return useKeyPress(
    ['shift.b'],
    (e) => {
      if (shouldDisableShortcut()) return

      const curState: CardBorderState = pick(settings, [
        'styleUseCardBorder',
        'styleUseCardBorderOnlyOnHover',
      ])
      const curIndex = borderCycleList.findIndex((state) => {
        return isEqual(state, pick(curState, Object.keys(state) as (keyof CardBorderState)[]))
      })
      if (curIndex === -1) throw new Error('unexpected curIndex = -1')

      const nextIndex = (curIndex + 1) % borderCycleList.length
      const nextState = borderCycleList[nextIndex]
      Object.assign(settings, nextState)

      const nextLabel = borderCycleListLabels[nextIndex]
      AntdMessage.success(nextLabel)
    },
    { exactMatch: true },
  )
}

const S = {
  tabPane: css`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px 30px;
    align-content: flex-start;
  `,

  itemsContainer: css`
    row-gap: 4px;
    display: flex;
    flex-direction: column;
  `,
}

export function TabPaneCustomUI() {
  const { styleUseCardBorder } = useSettingsSnapshot()

  return (
    <div className={styles.tabPane} css={S.tabPane}>
      <SettingsGroup title='样式自定义'>
        <div css={S.itemsContainer}>
          <CheckboxSettingItem
            configKey='styleUseStandardVideoSourceTab'
            label='推荐 Tab: 按钮使用标准高度'
            tooltip={explainForFlag('标准高度', '紧凑高度')}
          />

          <CheckboxSettingItem
            configKey='styleUseStickyTabbarInPureRecommend'
            label='全屏模式: sticky tab bar'
            tooltip={explainForFlag('Tab 栏会吸附在顶栏下方', 'Tab 栏会随页面一起滚动')}
          />

          <CheckboxSettingItem
            configKey='styleUseCustomGrid'
            label='全屏模式: 使用自定义网格配置'
            tooltip={
              <>
                网格配置指: 网格宽度, 间距, 列数等. <br />
                自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置; 列数: 4 - 10列;{' '}
                由{APP_NAME} 自定义; <br />
                默认网格配置: bili-feed4 版本B站首页默认的网格配置; 在 Sarari
                中使用建议取消勾选此项.
              </>
            }
          />

          <CheckboxSettingItem
            configKey='styleUseWhiteBackground'
            label='全屏模式: 使用纯白背景'
            tooltip={explainForFlag('纯白背景', '浅灰色背景')}
          />

          <CheckboxSettingItem
            configKey={'styleHideTopChannel'}
            label='全屏模式: 隐藏顶部分区和Banner'
          />
        </div>
      </SettingsGroup>

      <SettingsGroup
        title={
          <>
            视频卡片
            <ResetPartialSettingsButton
              css={[C.ml(10)]}
              keys={[
                'styleUseCardBorder',
                'styleUseCardBorderOnlyOnHover',
                'styleUseCardBoxShadow',
                'useDelayForHover',
              ]}
            />
          </>
        }
      >
        <div css={S.itemsContainer}>
          <CheckboxSettingItem
            configKey='styleUseCardBorder'
            label='使用卡片边框'
            tooltip=<>
              勾选后, 视频卡片会有边框包裹, 更像是一个卡片~ <br />
              整个卡片区域可点击 / 可触发预览 / 可使用右键菜单 <br />
              否则只是封面区域可以 <br />
              使用快捷键 <Tag color='green'>shift+b</Tag> 切换状态
              <br />
              {borderCycleListLabels.map((label) => (
                <Tag color='success' key={label}>
                  {label}
                </Tag>
              ))}
            </>
          />

          <CheckboxSettingItem
            configKey='styleUseCardBorderOnlyOnHover'
            label='仅在悬浮时显示'
            disabled={!styleUseCardBorder}
            tooltip={explainForFlag('仅在悬浮时显示', '一直显示')}
          />

          <CheckboxSettingItem
            configKey='styleUseCardBoxShadow'
            disabled={!styleUseCardBorder}
            label='悬浮卡片时使用发光效果'
            tooltip={<>悬浮卡片时使用发光效果, 看起来比较花哨~</>}
          />

          <CheckboxSettingItem
            configKey='useDelayForHover'
            label='延迟悬浮预览'
            tooltip={<>延迟悬浮预览</>}
          />

          <CheckboxSettingItem
            configKey='styleUseCardPadding'
            label='卡片外扩'
            tooltip={<>卡片会外扩一点距离</>}
          />
        </div>
      </SettingsGroup>
    </div>
  )
}
