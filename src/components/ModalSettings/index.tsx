import { APP_NAME, __PROD__ } from '$common'
import { C } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { cx } from '$libs'
import { ConfigIcon } from '$modules/icon'
import type { BooleanSettingsKey } from '$modules/settings'
import { settings } from '$modules/settings'
import { BaseModal, BaseModalStyle, ModalClose } from '$ui-components/BaseModal'
import { AntdMessage, shouldDisableShortcut } from '$utility'
import { Tabs, Tag } from 'antd'
import styles from './index.module.scss'
import { TabPaneAdvance } from './tab-panes/pane-advance'
import { TabPaneBasic } from './tab-panes/pane-basic'
import { TabPaneFilter } from './tab-panes/pane-filter'
import { TabPaneVideoSourceTabConfig } from './tab-panes/pane-video-source-tab-config'
import { ThemesSelect } from './theme'

function useHotkeyForConfig(
  hotkey: string | string[],
  configKey: BooleanSettingsKey,
  label: string,
) {
  return useKeyPress(
    hotkey,
    (e) => {
      if (shouldDisableShortcut()) return
      settings[configKey] = !settings[configKey]
      const isCancel = !settings[configKey]
      AntdMessage.success(`已${isCancel ? '禁用' : '启用'}「${label}」`)
    },
    { exactMatch: true },
  )
}

const enum TabPaneKey {
  Basic = 'basic',
  Filter = 'filter',
  CustomUi = 'custom-ui',
  ThemeSelect = 'theme-select',
  VideoSourceTabConfig = 'video-source-tab-config',
  Advance = 'advance',
}

const tab = __PROD__
  ? TabPaneKey.Basic
  : // for debug, free to change this
    TabPaneKey.Advance
const modalSettingsStore = proxy({ tab })

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  useHotkeyForConfig(['shift.p'], 'autoPreviewWhenKeyboardSelect', '键盘选中后自动开始预览')
  useHotkeyForConfig(['shift.m'], 'autoPreviewWhenHover', '鼠标悬浮后自动开始预览')
  useHotkeyForConfig(['shift.c'], 'useNarrowMode', '居中模式')
  useHotkeyForConfig(['shift.y'], 'styleNewCardStyle', '新卡片样式')

  const { tab } = useSnapshot(modalSettingsStore)

  return (
    <BaseModal
      {...{
        show,
        onHide,
        hideWhenMaskOnClick: true,
        hideWhenEsc: true,
        cssModal: css`
          width: 900px;
          max-height: unset;
        `,
      }}
    >
      <div css={BaseModalStyle.modalHeader}>
        <div css={BaseModalStyle.modalTitle}>
          <ConfigIcon css={[C.size(26), C.mr(5), C.mt(-2)]} />
          设置项
        </div>

        <div className='space' style={{ flex: 1 }}></div>

        <ModalClose onClick={onHide} />
      </div>

      {/* issue 设置项里面的滚动条怎么是双份的 */}
      <main css={BaseModalStyle.modalBody} style={{ overflow: 'hidden' }}>
        <Tabs
          tabPosition='left'
          size='middle'
          css={css`
            &.ant-tabs {
              .ant-tabs-tab {
                justify-content: end;
                /* 8 24 */
                padding-inline: 5px 15px;
                /* --ant-tabs-vertical-item-margin: 10px 0 0 0; */
              }
            }
          `}
          activeKey={tab}
          onChange={(tab) => (modalSettingsStore.tab = tab as TabPaneKey)}
          items={[
            {
              label: '常规设置',
              key: TabPaneKey.Basic,
              children: <TabPaneBasic />,
            },
            {
              label: '内容过滤',
              key: TabPaneKey.Filter,
              children: <TabPaneFilter />,
            },
            {
              label: '主题选择',
              key: TabPaneKey.ThemeSelect,
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle} style={{ marginBottom: 15 }}>
                      主题选择
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <ThemesSelect />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: '样式自定',
              key: TabPaneKey.CustomUi,
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle} style={{ marginBottom: 15 }}>
                      样式自定义
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.row}>
                        <CheckboxSettingItem
                          configKey='styleNewCardStyle'
                          label='新卡片样式'
                          tooltip={
                            <>
                              视频卡片: 显示头像, 更大的圆角.
                              <br />
                              切换设置快捷键: <Tag color='green'>shift+y</Tag>
                            </>
                          }
                        />
                      </div>
                      <div className={styles.row} style={{ marginTop: 5 }}>
                        <CheckboxSettingItem
                          configKey='styleUseStandardVideoSourceTab'
                          label='推荐源切换 Tab 按钮: 使用标准高度'
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
                              自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置;
                              列数: 4列 - 10列; {APP_NAME} 自定义;
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
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Tab 设置',
              key: TabPaneKey.VideoSourceTabConfig,
              children: <TabPaneVideoSourceTabConfig />,
            },
            {
              label: '高级设置',
              key: TabPaneKey.Advance,
              children: <TabPaneAdvance />,
            },
          ]}
        />
      </main>
    </BaseModal>
  )
}
