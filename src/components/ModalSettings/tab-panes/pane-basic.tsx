import { inlineFlexVerticalCenterStyle } from '$common/emotion-css'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { TabIcon } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode, VideoLinkOpenModeConfig } from '$components/VideoCard/index.shared'
import { CheckboxSettingItem, HelpInfo } from '$components/piece'
import { cx } from '$libs'
import { IconPark } from '$modules/icon/icon-park'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { AntdMessage } from '$utility'
import { Button, Select, Space, Tag } from 'antd'
import styles from '../index.module.scss'
import { toastAndReload } from '../index.shared'

export function TabPaneBasic() {
  const { videoLinkOpenMode } = useSettingsSnapshot()

  const openModeOptions = useMemo(() => {
    return Object.values(VideoLinkOpenMode)
      .filter((mode) => VideoLinkOpenModeConfig[mode].enabled ?? true)
      .map((mode) => {
        const config = VideoLinkOpenModeConfig[mode]
        return {
          config,
          value: mode,
          label: (
            <span
              css={css`
                display: flex;
                align-items: center;
                .label {
                  margin-left: 8px;
                }
              `}
            >
              {config.icon}
              <span className='label'>{config.label}</span>
            </span>
          ),
        }
      })
  }, [])

  return (
    <div className={styles.tabPane}>
      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>
          <TabIcon tabKey={ETab.RecommendApp} size={30} mr={5} /> 推荐 access_key
          <HelpInfo
            iconProps={{
              name: 'Help',
              size: 18,
              style: { marginTop: 6, marginLeft: 5 },
            }}
          >
            <span css={inlineFlexVerticalCenterStyle}>
              用于「
              <TabIcon tabKey={ETab.RecommendApp} mr={5} />
              推荐」Tab
            </span>
            <br />
            用于 获取推荐 / 提交不喜欢等操作
          </HelpInfo>
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
          <CheckboxSettingItem
            configKey='pureRecommend'
            label='全屏模式'
            tooltip={
              <>
                清空自带推荐内容, 只显示脚本推荐
                <br />
                P.S 需要刷新网页~
                <br />
                P.S 之前版本称 (纯推荐模式)
              </>
            }
            className={styles.check}
            extraAction={toastAndReload}
          />

          <CheckboxSettingItem
            configKey={'useNarrowMode'}
            label='居中模式'
            tooltip={
              <>
                居中两列
                <br />
                切换设置快捷键: <Tag color='green'>shift+c</Tag>
              </>
            }
            className={styles.check}
          />

          <CheckboxSettingItem
            configKey={'showModalFeedOnLoad'}
            label='自动「查看更多」'
            tooltip='打开首页时自动打开「查看更多」弹窗'
            className={styles.check}
            extraAction={(val) => {
              if (val) {
                AntdMessage.success(
                  '已开启自动「查看更多」: 下次打开首页时将自动打开「查看更多」弹窗',
                )
              }
            }}
          />

          <CheckboxSettingItem
            configKey={'showModalFeedEntry'}
            label='「查看更多」按钮'
            tooltip='是否展示「查看更多」按钮'
            className={styles.check}
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>视频链接</div>
        <div className={cx(styles.settingsGroupContent, styles.row)}>
          默认打开模式
          <HelpInfo
            tooltipProps={{ color: 'rgba(0, 0, 0, 0.85)' }} // 默认使用 colorPrimary, 链接可能看不清
          >
            选择点击视频(封面图片 或 标题)时打开的模式 <br />
            {openModeOptions.map(({ value, config }) => {
              return (
                !!config.desc && (
                  <div
                    key={value}
                    css={css`
                      display: flex;
                      align-items: flex-start;
                      margin-top: 10px;
                      &:first-child {
                        margin-top: 0;
                      }
                      .label {
                        display: inline-flex;
                        align-items: center;
                        .text {
                          min-width: 95px;
                          margin-left: 4px;
                          margin-right: 10px;
                        }
                      }
                    `}
                  >
                    <span className='label'>
                      {config.icon}
                      <span className='text'>{config.label}</span>
                    </span>
                    <span className='desc'>{config.desc}</span>
                  </div>
                )
              )
            })}
          </HelpInfo>
          <Select
            css={css`
              width: 160px;
              margin-left: 8px;
            `}
            options={openModeOptions}
            value={videoLinkOpenMode}
            onChange={(v) => {
              updateSettings({ videoLinkOpenMode: v })
            }}
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <div className={styles.settingsGroupTitle}>预览</div>
        <div className={cx(styles.settingsGroupContent, styles.row)}>
          <CheckboxSettingItem
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

          <CheckboxSettingItem
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
        <div className={styles.settingsGroupTitle}>
          帮助
          <span
            css={css`
              margin-left: 8px;
              margin-right: 4px;
              font-size: 14px;
              position: relative;
              top: 4px;
            `}
          >
            (当前版本: v{__SCRIPT_VERSION__})
          </span>
          <IconPark
            name={'Copy'}
            size={16}
            onClick={() => {
              const content = `v${__SCRIPT_VERSION__}`
              GM.setClipboard(content)
              AntdMessage.success(`已复制当前版本: ${content}`)
            }}
            css={css`
              position: relative;
              top: 4px;
              cursor: pointer;
            `}
          />
        </div>
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
