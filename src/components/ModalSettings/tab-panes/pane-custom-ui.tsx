import { APP_NAME } from '$common'
import type { Settings } from '$modules/settings'
import { settings } from '$modules/settings'
import { AntdMessage, shouldDisableShortcut } from '$utility'
import { Tag } from 'antd'
import { isEqual } from 'lodash'
import { pick } from 'radash'
import styles from '../index.module.scss'
import { CheckboxSettingItem, SwitchSettingItem } from '../setting-item'

type CardBorderState = Partial<
  Pick<Settings, 'styleUseCardBorder' | 'styleUseCardBorderOnlyOnHover'>
>
const borderCycleList: CardBorderState[] = [
  { styleUseCardBorder: false }, // no border
  { styleUseCardBorder: true, styleUseCardBorderOnlyOnHover: true }, // on hover
  { styleUseCardBorder: true, styleUseCardBorderOnlyOnHover: false }, // always
]
const borderCycleListLabels = [
  '「卡片边框」: 已禁用',
  '「卡片边框」: 只在悬浮时展示',
  '「卡片边框」: 总是展示',
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

export function TabPaneCustomUI() {
  return (
    <div className={styles.tabPane}>
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle} style={{ marginBottom: 15 }}>
          样式自定义
        </div>

        <div className={clsx(styles.settingsGroupContent)}>
          <div className={styles.row} style={{ marginTop: 5 }}>
            <CheckboxSettingItem
              configKey='styleUseStandardVideoSourceTab'
              label='推荐 Tab: 按钮使用标准高度'
              tooltip='默认紧凑高度'
            />
          </div>

          <div className={styles.row} style={{ marginTop: 5 }}>
            <CheckboxSettingItem
              configKey='styleUseStickyTabbarInPureRecommend'
              label='全屏模式: sticky tab bar'
              tooltip={
                <>
                  默认勾选: Tab 栏会吸附在顶栏下方
                  <br />
                  取消选中: Tab 栏会随页面一起滚动
                </>
              }
            />
          </div>

          <div className={styles.row} style={{ marginTop: 5 }}>
            <CheckboxSettingItem
              configKey='styleUseCustomGrid'
              label='全屏模式: 使用自定义网格配置'
              tooltip={
                <>
                  网格配置指: 网格宽度, 间距, 列数等.
                  <br />
                  自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置; 列数: 4列 -
                  10列; {APP_NAME} 自定义;
                  <br />
                  默认网格配置: bili-feed4 首页使用的网格配置
                </>
              }
            />
          </div>

          <div className={styles.row} style={{ marginTop: 5 }}>
            <CheckboxSettingItem
              configKey='styleUseWhiteBackground'
              label='全屏模式: styleUseWhiteBackground'
            />
          </div>

          <div className={styles.row} style={{ marginTop: 5 }}>
            <CheckboxSettingItem
              configKey='styleUseCardBorder'
              label='视频卡片: 使用边框'
              tooltip=<>
                使用边框后, 整个卡片区域可点击 / 可触发预览 / 可使用右键菜单 <br />
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

            <SwitchSettingItem
              size='small'
              configKey={'styleUseCardBorderOnlyOnHover'}
              checkedChildren='只在悬浮时展示'
              unCheckedChildren='总是展示'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
