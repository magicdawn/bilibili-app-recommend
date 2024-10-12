import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useSortedTabKeys } from '$components/RecHeader/tab'
import { TabConfig, TabIcon } from '$components/RecHeader/tab-config'
import { ETab, TabKeys } from '$components/RecHeader/tab-enum'
import { EAppApiDevice } from '$define/index.shared'
import { useIsDarkMode } from '$modules/dark-mode'
import { IconPark } from '$modules/icon/icon-park'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { HelpInfo } from '$ui-components/HelpInfo'
import { AntdTooltip } from '$ui-components/antd-custom'
import { AntdMessage } from '$utility'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox, Col, Radio, Space } from 'antd'
import styles from '../index.module.scss'
import { ResetPartialSettingsButton } from './_shared'

export function TabPaneVideoSourceTabConfig() {
  const { appApiDecice } = useSettingsSnapshot()
  const sortedTabKeys = useSortedTabKeys()

  return (
    <div className={styles.tabPane}>
      <div
        css={css`
          display: grid;
          grid-template-columns: 250px 1fr;
          column-gap: 50px;
        `}
      >
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>
            Tab 设置
            <HelpInfo
              iconProps={{
                name: 'Tips',
                style: { marginLeft: 5, marginRight: 20 },
              }}
            >
              勾选显示, 拖动排序
            </HelpInfo>
            <Col flex={1} />
            <ResetPartialSettingsButton keys={['hidingTabKeys', 'customTabKeysOrder']} />
          </div>
          <VideoSourceTabOrder />
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>更多设置</div>
          <div
            className={clsx(styles.settingsGroupContent)}
            css={css`
              display: flex;
              flex-direction: column;
            `}
          >
            <div
              css={css`
                order: ${sortedTabKeys.indexOf(ETab.Watchlater) + 1};
              `}
            >
              <div className={styles.settingsGroupSubTitle}>
                <TabIcon tabKey={ETab.Watchlater} mr={5} mt={-1} />
                稍后再看
              </div>
              <Space size={10}>
                <CheckboxSettingItem
                  configKey='shuffleForWatchLater'
                  label='随机顺序'
                  tooltip='不包括近期添加的「稍后再看」'
                />
                <CheckboxSettingItem
                  configKey='addSeparatorForWatchLater'
                  label='添加分割线'
                  tooltip='添加「近期」「更早」分割线'
                  css={css`
                    margin-left: 20px !important;
                  `}
                />
              </Space>
            </div>

            <div
              css={css`
                order: ${sortedTabKeys.indexOf(ETab.Fav) + 1};
              `}
            >
              <div className={styles.settingsGroupSubTitle}>
                <TabIcon tabKey={ETab.Fav} mr={5} mt={-2} />
                收藏
              </div>
              <Space size={10}>
                <CheckboxSettingItem
                  configKey='shuffleForFav'
                  label='随机顺序'
                  tooltip='随机收藏'
                />
                <CheckboxSettingItem
                  configKey='addSeparatorForFav'
                  label='添加分割线'
                  tooltip='顺序显示时, 按收藏夹添加分割线'
                  css={css`
                    margin-left: 20px !important;
                  `}
                />
              </Space>
            </div>

            <div
              css={css`
                order: ${sortedTabKeys.indexOf(ETab.DynamicFeed) + 1};
              `}
            >
              <div className={styles.settingsGroupSubTitle}>
                <TabIcon tabKey={ETab.DynamicFeed} mr={5} mt={-2} />
                动态
              </div>
              <Space size={10}>
                <CheckboxSettingItem
                  configKey='enableFollowGroupFilterForDynamicFeed'
                  label='启用分组筛选'
                  tooltip='动态筛选里加入分组: 目前基于全部动态 + 分组UP过滤, 速度较慢~'
                />
              </Space>
            </div>

            <div
              css={css`
                order: ${sortedTabKeys.indexOf(ETab.RecommendApp) + 1};
              `}
            >
              <div className={styles.settingsGroupSubTitle}>
                <TabIcon tabKey={ETab.RecommendApp} mr={5} />
                App 推荐
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                App API 设备类型
                <HelpInfo
                  iconProps={{
                    name: 'Tips',
                    style: { marginLeft: 5, marginRight: 10 },
                  }}
                >
                  默认 ipad, 视频有 头像/日期 等信息
                  <br />
                  可选 android, 有图文类型的推荐
                </HelpInfo>
                <Radio.Group
                  optionType='button'
                  buttonStyle='solid'
                  size='small'
                  options={[EAppApiDevice.ipad, EAppApiDevice.android]}
                  value={appApiDecice}
                  onChange={(e) => updateSettings({ appApiDecice: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function useCurrentShowingTabKeys(): ETab[] {
  const { hidingTabKeys } = useSettingsSnapshot()
  return useMemo(() => TabKeys.filter((key) => !hidingTabKeys.includes(key)), [hidingTabKeys])
}

function VideoSourceTabOrder({ className, style }: { className?: string; style?: CSSProperties }) {
  const currentShowingTabKeys = useCurrentShowingTabKeys()
  const sortedTabKeys = useSortedTabKeys()

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useMemoizedFn((e: DragEndEvent) => {
    const { over, active } = e
    if (!over?.id || over.id === active.id) return

    const oldIndex = sortedTabKeys.indexOf(active.id.toString())
    const newIndex = sortedTabKeys.indexOf(over.id.toString())
    // console.log('re-order:', oldIndex, newIndex)
    const newList = arrayMove(sortedTabKeys, oldIndex, newIndex)
    updateSettings({ customTabKeysOrder: newList })
  })

  return (
    <div {...{ className, style }}>
      <Checkbox.Group
        css={css`
          display: block;
          line-height: unset;
        `}
        value={currentShowingTabKeys}
        onChange={(newVal) => {
          if (!newVal.length) {
            return AntdMessage.error('至少选择一项!')
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
  )
}

function VideoSourceTabSortableItem({ id }: { id: ETab }) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { label, desc } = TabConfig[id]

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

        padding-left: 10px;
        padding-right: 6px;
        border: 1px solid ${!dark ? '#ddd' : '#444'};
        border-radius: 6px;
        margin-top: 8px;
      `}
    >
      <AntdTooltip align={{ offset: [0, -10] }} title={desc}>
        <Checkbox
          value={id}
          css={css`
            display: inline-flex;
            align-items: center;
            .ant-checkbox + span {
              user-select: none;
              display: inline-flex;
              align-items: center;
            }
          `}
        >
          <TabIcon tabKey={id} mr={5} />
          {label}
        </Checkbox>
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
          padding: 3px 5px;
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
