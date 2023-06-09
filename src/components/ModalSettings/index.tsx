import { AccessKeyManage } from '$components/AccessKeyManage'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { FlagSettingItem, HelpInfo } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import {
  BooleanConfigKey,
  resetSettings,
  settings,
  updateSettings,
  useSettingsSnapshot,
} from '$settings'
import { isCurrentTyping } from '$utility/dom'
import { toast } from '$utility/toast'
import { useKeyPress } from 'ahooks'
import { Button, InputNumber, Popconfirm, Radio, Slider, Space, Tabs, Tag } from 'antd'
import delay from 'delay'
import styles from './index.module.less'
import { ThemesSelect } from './theme'

async function toastAndReload() {
  toast('即将刷新网页')
  await delay(500)
  location.reload()
}

function onResetSettings() {
  resetSettings()
  return toastAndReload()
}

function useHotkeyForConfig(hotkey: string | string[], configKey: BooleanConfigKey, label: string) {
  return useKeyPress(
    hotkey,
    (e) => {
      if (isCurrentTyping()) return

      settings[configKey] = !settings[configKey]
      const isCancel = !settings[configKey]
      toast(`已${isCancel ? '禁用' : '启用'}「${label}」`)
    },
    { exactMatch: true }
  )
}

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  const {
    usePcDesktopApi,
    autoPreviewUpdateInterval,
    filterMinPlayCount,
    filterMinPlayCountEnabled,
    filterMinDuration,
    filterMinDurationEnabled,
  } = useSettingsSnapshot()

  useHotkeyForConfig(['shift.p'], 'autoPreviewWhenKeyboardSelect', '键盘选中后自动开始预览')
  useHotkeyForConfig(['shift.m'], 'autoPreviewWhenHover', '鼠标悬浮后自动开始预览')
  useHotkeyForConfig(['shift.c'], 'useNarrowMode', '居中模式')

  return (
    <BaseModal
      {...{
        show,
        onHide,
        hideWhenMaskOnClick: true,
        hideWhenEsc: true,
        styleModal: { width: 900, maxHeight: 'unset' },
      }}
    >
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}>
          <IconPark name='Config' className={styles.configIcon} />
          设置项
        </div>

        <div className='space' style={{ flex: 1 }}></div>

        <ModalClose onClick={onHide} />
      </div>

      <main className={BaseModalClass.modalBody}>
        <Tabs
          tabPosition='left'
          size='middle'
          // FIXME: modify before release
          // defaultActiveKey='UI'
          defaultActiveKey='normal'
          className={styles.settingTabs}
          items={[
            {
              label: '常规设置',
              key: 'normal',
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>
                      API 切换
                      <HelpInfo tooltip={<>只对推荐 Tab 生效, 详细信息查看 GitHub 主页说明</>} />
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <Radio.Group
                        buttonStyle='solid'
                        value={usePcDesktopApi ? 'desktop' : 'app'}
                        onChange={(e) => {
                          const newValue = e.target.value
                          settings.usePcDesktopApi = newValue === 'desktop'
                        }}
                      >
                        <Radio.Button value='desktop'>使用桌面端 API</Radio.Button>
                        <Radio.Button value='app'>使用 App 端 API</Radio.Button>
                      </Radio.Group>

                      {!usePcDesktopApi && (
                        <div className={styles.row} style={{ marginTop: 5 }}>
                          <AccessKeyManage />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>开关</div>
                    <div className={cx(styles.settingsGroupContent, styles.row)}>
                      <FlagSettingItem
                        configKey='pureRecommend'
                        label='开启纯推荐模式'
                        tooltip={
                          <>
                            首页只保留推荐
                            <br />
                            P.S 需要刷新网页~
                          </>
                        }
                        className={styles.check}
                        extraAction={toastAndReload}
                      />
                      <FlagSettingItem
                        configKey={'initialShowMore'}
                        label='自动查看更多'
                        tooltip='打开首页时默认打开推荐弹框'
                        className={styles.check}
                        extraAction={(val) => {
                          if (val) {
                            toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹框')
                          }
                        }}
                      />
                      <FlagSettingItem
                        configKey={'useNarrowMode'}
                        label='启用居中模式'
                        tooltip={
                          <>
                            居中两列
                            <br />
                            切换设置快捷键: <Tag color='green'>shift+c</Tag>
                          </>
                        }
                        className={styles.check}
                      />
                      <FlagSettingItem
                        configKey='useParallelRequest'
                        label='批量请求时使用并行'
                        tooltip={
                          <>
                            并行快但可能有重复
                            <br />
                            推荐视频大量重复时关闭这个试试~
                          </>
                        }
                        className={styles.check}
                      />
                    </div>
                  </div>

                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>预览</div>
                    <div className={cx(styles.settingsGroupContent, styles.row)}>
                      <FlagSettingItem
                        configKey='autoPreviewWhenKeyboardSelect'
                        label='键盘选中后自动开始预览'
                        className={styles.check}
                        tooltip={
                          <>
                            手动预览快捷键: <Tag color='green'>.</Tag> or <Tag color='green'>p</Tag>
                            <br />
                            切换设置快捷键: <Tag color='green'>shift+p</Tag>
                          </>
                        }
                      />

                      <FlagSettingItem
                        configKey='autoPreviewWhenHover'
                        label='鼠标悬浮后自动开始预览'
                        className={styles.check}
                        tooltip={
                          <>
                            鼠标悬浮后自动开始预览, 预览不再跟随鼠标位置 <br />
                            切换设置快捷键: <Tag color='green'>shift+m</Tag>
                          </>
                        }
                      />

                      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                        预览更新间隔
                        <Slider
                          style={{ flex: 1, margin: '0 15px' }}
                          min={0}
                          max={1000}
                          keyboard
                          onChange={(val) => (settings.autoPreviewUpdateInterval = val)}
                          value={autoPreviewUpdateInterval}
                        />
                        <span style={{ width: '65px' }}>({autoPreviewUpdateInterval}ms)</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>帮助</div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.row}>
                        <Space size='small'>
                          <Button
                            href='https://github.com/magicdawn/bilibili-app-recommend'
                            target='_blank'
                          >
                            GitHub 主页
                          </Button>
                          <Button
                            href='https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend'
                            target='_blank'
                          >
                            GreasyFork 主页
                          </Button>
                          <Button
                            href='https://github.com/magicdawn/bilibili-app-recommend#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E'
                            target='_blank'
                          >
                            查看可用的快捷键
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: '视频过滤',
              key: 'filter',
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>
                      视频过滤
                      <HelpInfo
                        tooltip={
                          <>
                            启用视频过滤会大幅降低加载速度, 谨慎开启! <br />
                            只对推荐 Tab 生效
                          </>
                        }
                      />
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.settingsGroupSubTitle}>过滤范围</div>
                      <FlagSettingItem
                        configKey='enableFilterForFollowed'
                        label='对推荐理由为「已关注」的视频启用过滤'
                        tooltip={<>默认不过滤「已关注」</>}
                      />

                      <div className={styles.settingsGroupSubTitle}>过滤器</div>
                      <div className={styles.row}>
                        <FlagSettingItem
                          configKey='filterMinPlayCountEnabled'
                          label='按播放量过滤'
                          tooltip={<>不显示播放量很少的视频</>}
                        />
                        <InputNumber
                          size='small'
                          min={1}
                          step={1000}
                          value={filterMinPlayCount}
                          onChange={(val) => val && updateSettings({ filterMinPlayCount: val })}
                          disabled={!filterMinPlayCountEnabled}
                        />
                      </div>

                      <div className={styles.row} style={{ marginTop: 8 }}>
                        <FlagSettingItem
                          configKey='filterMinDurationEnabled'
                          label='按视频时长过滤'
                          tooltip={<>不显示短视频</>}
                        />
                        <InputNumber
                          style={{ width: 150 }}
                          size='small'
                          min={1}
                          step={10}
                          addonAfter={'单位:秒'}
                          value={filterMinDuration}
                          onChange={(val) => val && updateSettings({ filterMinDuration: val })}
                          disabled={!filterMinDurationEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: '外观设置',
              key: 'UI',
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
              label: '高级设置',
              key: 'advance',
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>高级</div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.row}>
                        <Popconfirm
                          title='确定'
                          description='确定恢复默认设置? 该操作不可逆!'
                          onConfirm={onResetSettings}
                        >
                          <Button danger type='primary'>
                            恢复默认设置
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>

                    <div className={styles.settingsGroupTitle} style={{ marginTop: 15 }}>
                      稍后再看
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.row}>
                        <FlagSettingItem
                          configKey='shuffleForWatchLater'
                          label='对「稍后再看」Tab 使用随机顺序'
                          tooltip={<>不包括今天添加的「稍后再看」</>}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </main>
    </BaseModal>
  )
}
