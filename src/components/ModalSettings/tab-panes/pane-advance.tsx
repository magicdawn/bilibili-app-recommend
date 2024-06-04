import { APP_NAME } from '$common'
import { C, antdCustomCss } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { cx } from '$libs'
import { OpenExternalLinkIcon } from '$modules/icon'
import { IconPark } from '$modules/icon/icon-park'
import {
  allowedSettingsKeys,
  articleDraft,
  initialSettings,
  resetSettings,
  settings,
  updateSettings,
  useSettingsSnapshot,
} from '$modules/settings'
import { AntdMessage } from '$utility'
import { Button, Popconfirm, Slider } from 'antd'
import { pick } from 'lodash'
import styles from '../index.module.scss'
import { set_HAS_RESTORED_SETTINGS, toastAndReload } from '../index.shared'

function onResetSettings() {
  resetSettings()
  return toastAndReload()
}

async function onRestoreSettings() {
  const remoteSettings = await articleDraft.getData()
  const pickedSettings = pick(remoteSettings || {}, allowedSettingsKeys)

  const len = Object.keys(pickedSettings).length
  if (!len) {
    return AntdMessage.error('备份不存在或没有有效的配置')
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings({ ...pickedSettings })
  return toastAndReload()
}

export function TabPaneAdvance() {
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
            <CheckboxSettingItem
              configKey='backupSettingsToArticleDraft'
              label='备份设置到专栏草稿箱中'
              tooltip={`专栏 - 草稿箱 - ${APP_NAME}`}
            />

            <a
              style={{
                marginLeft: 15,
                display: 'inline-flex',
                alignItems: 'center',
              }}
              href='https://member.bilibili.com/platform/upload/text/draft'
              target='_blank'
            >
              <OpenExternalLinkIcon css={[C.size(16), C.mr(4)]} />
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

        <div
          className={styles.settingsGroupTitle}
          style={{ marginTop: 15, justifyContent: 'space-between' }}
        >
          预览
          <Popconfirm
            title={'确认?'}
            onConfirm={() => {
              updateSettings({
                autoPreviewUpdateInterval: initialSettings.autoPreviewUpdateInterval,
                autoPreviewUseContinuousProgress: initialSettings.autoPreviewUseContinuousProgress,
              })
            }}
          >
            <Button css={antdCustomCss.button}>
              <IconPark name='Return' size='16' />
              <span>重置</span>
            </Button>
          </Popconfirm>
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
        <div>
          <CheckboxSettingItem
            configKey={'autoPreviewUseContinuousProgress'}
            label='自动预览: 使用连续式进度条'
            tooltip={
              <>
                ✅ 连续式进度条
                <br />❎ 跳跃式进度条
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
