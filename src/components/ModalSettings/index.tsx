import { APP_NAME } from '$common'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { AntdTooltip } from '$components/AntdApp'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import type { TabType } from '$components/RecHeader/tab.shared'
import {
  TabConfigMap,
  TabKeys,
  useCurrentShowingTabKeys,
  useSortedTabKeys,
} from '$components/RecHeader/tab.shared'
import { FlagSettingItem, HelpInfo } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { useIsDarkMode } from '$platform'
import { getData } from '$service/user/article-draft'
import type { BooleanSettingsKey } from '$settings'
import {
  allowedSettingsKeys,
  resetSettings,
  settings,
  updateSettings,
  useSettingsSnapshot,
} from '$settings'
import { shouldDisableShortcut } from '$utility/dom'
import { toast } from '$utility/toast'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/react'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button, Checkbox, InputNumber, Popconfirm, Slider, Space, Switch, Tabs, Tag } from 'antd'
import delay from 'delay'
import { pick } from 'lodash'
import { proxy, useSnapshot } from 'valtio'
import styles from './index.module.scss'
import { set_HAS_RESTORED_SETTINGS } from './index.shared'
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

async function onRestoreSettings() {
  const remoteSettings = await getData()
  const pickedSettings = pick(remoteSettings || {}, allowedSettingsKeys)

  const len = Object.keys(pickedSettings).length
  if (!len) {
    return toast('备份不存在或没有有效的配置')
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings({ ...pickedSettings })
  return toastAndReload()
}

function useHotkeyForConfig(
  hotkey: string | string[],
  configKey: BooleanSettingsKey,
  label: string
) {
  return useKeyPress(
    hotkey,
    (e) => {
      if (shouldDisableShortcut()) return
      settings[configKey] = !settings[configKey]
      const isCancel = !settings[configKey]
      toast(`已${isCancel ? '禁用' : '启用'}「${label}」`)
    },
    { exactMatch: true }
  )
}

const modalSettingsStore = proxy({
  // FIXME: default tab should be basic
  tab: 'basic',
  // tab: 'video-source-tab-config',
})

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  const {
    filterEnabled,
    filterMinPlayCount,
    filterMinPlayCountEnabled,
    filterMinDuration,
    filterMinDurationEnabled,
    filterOutGotoTypePicture,
  } = useSettingsSnapshot()

  useHotkeyForConfig(['shift.p'], 'autoPreviewWhenKeyboardSelect', '键盘选中后自动开始预览')
  useHotkeyForConfig(['shift.m'], 'autoPreviewWhenHover', '鼠标悬浮后自动开始预览')
  useHotkeyForConfig(['shift.c'], 'useNarrowMode', '居中模式')
  useHotkeyForConfig(['shift.y'], 'styleFancy', 'Fancy Style')

  const { tab } = useSnapshot(modalSettingsStore)

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

      {/* issue 设置项里面的滚动条怎么是双份的 */}
      <main className={BaseModalClass.modalBody} style={{ overflow: 'hidden' }}>
        <Tabs
          tabPosition='left'
          size='middle'
          className={styles.settingTabs}
          // defaultActiveKey='basic'
          activeKey={tab}
          onChange={(tab) => (modalSettingsStore.tab = tab)}
          items={[
            {
              label: '常规设置',
              key: 'basic',
              children: <TabPaneBasic />,
            },
            {
              label: '内容过滤',
              key: 'filter',
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle}>
                      内容过滤
                      <HelpInfo
                        iconProps={{ name: 'Tips' }}
                        tooltip={
                          <>
                            启用过滤会大幅降低加载速度, 谨慎开启! <br />
                            仅推荐类 Tab 生效
                          </>
                        }
                      />
                      <Switch
                        css={css`
                          margin-left: 10px;
                        `}
                        checked={filterEnabled}
                        onChange={(val) => {
                          updateSettings({ filterEnabled: val })
                        }}
                      />
                    </div>

                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.settingsGroupSubTitle}>视频</div>
                      <div className={styles.row}>
                        <FlagSettingItem
                          disabled={!filterEnabled}
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
                          disabled={!filterEnabled || !filterMinPlayCountEnabled}
                        />
                      </div>
                      <div className={styles.row} style={{ marginTop: 3 }}>
                        <FlagSettingItem
                          configKey='filterMinDurationEnabled'
                          label='按视频时长过滤'
                          tooltip={<>不显示短视频</>}
                          disabled={!filterEnabled}
                        />
                        <InputNumber
                          style={{ width: 150 }}
                          size='small'
                          min={1}
                          step={10}
                          addonAfter={'单位:秒'}
                          value={filterMinDuration}
                          onChange={(val) => val && updateSettings({ filterMinDuration: val })}
                          disabled={!filterEnabled || !filterMinDurationEnabled}
                        />
                      </div>
                      <FlagSettingItem
                        className={styles.row}
                        style={{ marginTop: 3 }}
                        configKey='enableFilterForFollowedVideo'
                        label='对「已关注」的视频启用过滤'
                        tooltip={<>默认不过滤「已关注」</>}
                        disabled={!filterEnabled}
                      />

                      <div className={styles.settingsGroupSubTitle}>图文</div>
                      <FlagSettingItem
                        className={styles.row}
                        configKey='filterOutGotoTypePicture'
                        label='启用图文(动态 & 专栏)过滤'
                        tooltip={<>过滤掉图文推荐</>}
                        disabled={!filterEnabled}
                      />
                      <FlagSettingItem
                        className={styles.row}
                        disabled={!filterEnabled || !filterOutGotoTypePicture}
                        configKey='enableFilterForFollowedPicture'
                        label='对「已关注」的图文启用过滤'
                        tooltip={<>默认不过滤「已关注」</>}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: '外观设置',
              key: 'ui',
              children: (
                <div className={styles.tabPane}>
                  <div className={styles.settingsGroup}>
                    <div className={styles.settingsGroupTitle} style={{ marginBottom: 15 }}>
                      样式自定义
                    </div>
                    <div className={cx(styles.settingsGroupContent)}>
                      <div className={styles.row}>
                        <FlagSettingItem
                          configKey='styleFancy'
                          label='Fancy Style'
                          tooltip={
                            <>
                              增加卡片大小, 增大卡片间距
                              <br />
                              视频卡片会显示头像
                              <br />
                              切换设置快捷键: <Tag color='green'>shift+y</Tag>
                            </>
                          }
                        />
                      </div>
                      <div className={styles.row} style={{ marginTop: 5 }}>
                        <FlagSettingItem
                          configKey='styleUseStandardVideoSourceTab'
                          label='推荐源切换 Tab 按钮: 使用标准高度'
                          tooltip='默认紧凑高度'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: '主题选择',
              key: 'theme-select',
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
              label: 'Tab 设置',
              key: 'video-source-tab-config',
              children: <TabPaneRecommendTabConfig />,
            },
            {
              label: '高级设置',
              key: 'advance',
              children: <TabPaneAdvance />,
            },
          ]}
        />
      </main>
    </BaseModal>
  )
}

function TabPaneBasic() {
  return (
    <div className={styles.tabPane}>
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>
          access_key
          <HelpInfo
            iconProps={{
              name: 'Help',
              size: 18,
              style: { marginTop: 6, marginLeft: 5 },
            }}
            tooltip={
              <>
                用于「推荐」Tab
                <br />
                用于 获取推荐 / 提交不喜欢等操作
              </>
            }
          />
        </div>
        <div className={cx(styles.settingsGroupContent)}>
          <div className={styles.row} style={{ marginTop: 5 }}>
            <AccessKeyManage />
          </div>
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
            tooltip='打开首页时默认打开推荐弹窗'
            className={styles.check}
            extraAction={(val) => {
              if (val) {
                toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
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
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>帮助</div>
        <div className={cx(styles.settingsGroupContent)}>
          <div className={styles.row}>
            <Space size='small'>
              <Button href='https://github.com/magicdawn/bilibili-app-recommend' target='_blank'>
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
              <Button
                href='https://github.com/magicdawn/bilibili-app-recommend/blob/main/CHANGELOG.md'
                target='_blank'
              >
                更新日志
              </Button>
              <Button href='https://afdian.net/a/magicdawn' target='_blank'>
                用 ❤️ 发电
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabPaneAdvance() {
  const { autoPreviewUpdateInterval } = useSettingsSnapshot()

  return (
    <div className={styles.tabPane}>
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>设置项</div>
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
          备份/恢复
        </div>
        <div className={cx(styles.settingsGroupContent)}>
          <div className={styles.row}>
            <FlagSettingItem
              configKey='backupSettingsToArticleDraft'
              label='备份设置到专栏草稿箱中'
              tooltip={`专栏 - 草稿箱 - ${APP_NAME}`}
            />

            <a
              style={{ marginLeft: 15, display: 'inline-flex', alignItems: 'center' }}
              href='https://member.bilibili.com/platform/upload/text/draft'
              target='_blank'
            >
              <IconPark name='EfferentFour' size={16} style={{ marginRight: 4 }} />
              去草稿箱浏览
            </a>
          </div>
          <div className={styles.row} style={{ marginTop: 5 }}>
            <Popconfirm
              title='确定'
              description='将覆盖本地设置? 该操作不可逆!'
              onConfirm={onRestoreSettings}
            >
              <Button danger type='primary'>
                从专栏草稿箱中恢复
              </Button>
            </Popconfirm>
          </div>
        </div>

        <div className={styles.settingsGroupTitle} style={{ marginTop: 15 }}>
          稍后再看 & 收藏
        </div>
        <div className={cx(styles.settingsGroupContent)}>
          <div className={styles.row}>
            <FlagSettingItem
              configKey='shuffleForWatchLater'
              label='对「稍后再看」Tab 使用随机顺序'
              tooltip={<>不包括最近添加的「稍后再看」</>}
            />
          </div>
          <div className={styles.row}>
            <FlagSettingItem configKey='shuffleForFav' label='对「收藏」Tab 使用随机顺序' />
          </div>
        </div>

        <div className={styles.settingsGroupTitle} style={{ marginTop: 15 }}>
          预览
        </div>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          自动预览更新间隔
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
  )
}

function TabPaneRecommendTabConfig() {
  const currentShowingTabKeys = useCurrentShowingTabKeys()
  const sortedTabKeys = useSortedTabKeys()

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useMemoizedFn((e: DragEndEvent) => {
    const { over, active } = e
    // console.log(e, over, active)

    // no change
    if (!over?.id) return
    if (over.id === active.id) return

    // change
    const oldIndex = sortedTabKeys.indexOf(active.id.toString())
    const newIndex = sortedTabKeys.indexOf(over.id.toString())
    // console.log('re-order:', oldIndex, newIndex)

    // save
    const item = sortedTabKeys[oldIndex]
    const newSortedKeys = sortedTabKeys.slice()
    newSortedKeys.splice(oldIndex, 1)
    newSortedKeys.splice(newIndex, 0, item)
    updateSettings({ customTabKeysOrder: newSortedKeys })
  })

  return (
    <div className={styles.tabPane}>
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>
          Tab 设置
          <HelpInfo
            iconProps={{ name: 'Tips', style: { marginLeft: 5, marginRight: 20 } }}
            tooltip={<>勾选显示, 拖动排序</>}
          />
          <Button
            onClick={() => {
              updateSettings({ hidingTabKeys: [], customTabKeysOrder: [] })
            }}
          >
            重置
          </Button>
        </div>
        <div className={cx(styles.settingsGroupContent)}>
          <div
            css={css`
              width: 300px;
            `}
          >
            <Checkbox.Group
              css={css`
                display: block;
                line-height: unset;
              `}
              value={currentShowingTabKeys}
              onChange={(newVal) => {
                if (!newVal.length) {
                  return toast('至少选择一项!')
                }
                updateSettings({
                  hidingTabKeys: TabKeys.filter((k) => !newVal.includes(k)),
                })
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={sortedTabKeys} strategy={verticalListSortingStrategy}>
                  {sortedTabKeys.map((key) => (
                    <VideoSourceTabSortableItem key={key} id={key} />
                  ))}
                </SortableContext>
              </DndContext>
            </Checkbox.Group>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoSourceTabSortableItem({ id }: { id: TabType }) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { label, desc, icon, iconProps } = TabConfigMap[id]

  const dark = useIsDarkMode()

  return (
    <div
      key={id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      css={css`
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 35px;

        padding-left: 20px;
        border: 1px solid ${!dark ? '#ddd' : '#444'};
        border-radius: 6px;

        margin-top: 6px;
      `}
    >
      <Checkbox value={id} />
      <AntdTooltip
        title={desc}
        css={css`
          display: inline-flex;
          align-items: center;
        `}
      >
        <IconPark
          name={icon}
          {...iconProps}
          size={iconProps?.size || 18}
          css={css`
            margin: 0 5px 0 10px;
          `}
        />
        {label}
      </AntdTooltip>

      <div
        css={css`
          flex: 1;
        `}
      />

      <div
        {...listeners}
        ref={setActivatorNodeRef}
        css={css`
          cursor: grab;
          font-size: 0;
          padding: 5px;
          margin-right: 10px;
          border-radius: 5px;
          &:hover {
            background-color: ${!dark ? '#eee' : '#999'};
          }
        `}
      >
        <IconPark name='Drag' size={18} />
      </div>
    </div>
  )
}
