import { APP_NAME } from '$common'
import { C, flexVerticalCenterStyle } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { AntdTooltip } from '$components/_base/antd-custom'
import { OpenExternalLinkIcon } from '$modules/icon'
import {
  allowedSettingsKeys,
  resetSettings,
  settings,
  updateSettings,
  useSettingsSnapshot,
} from '$modules/settings'
import { exportSettings, importSettings } from '$modules/settings/file-backup'
import { articleDraft, restoreOmitKeys } from '$modules/settings/index.shared'
import { AntdMessage } from '$utility'
import { Button, Popconfirm, Slider, Space } from 'antd'
import { omit, pick } from 'lodash'
import TablerFileExport from '~icons/tabler/file-export'
import TablerFileImport from '~icons/tabler/file-import'
import TablerRestore from '~icons/tabler/restore'
import { set_HAS_RESTORED_SETTINGS } from '../../../modules/settings/restore-flag'
import styles from '../index.module.scss'
import { toastAndReload } from '../index.shared'
import { ResetPartialSettingsButton, SettingsGroup } from './_shared'

function onResetSettings() {
  resetSettings()
  return toastAndReload()
}

async function onRestoreSettings() {
  const remoteSettings = await articleDraft.getData()
  const pickedSettings = omit(pick(remoteSettings || {}, allowedSettingsKeys), restoreOmitKeys)

  const len = Object.keys(pickedSettings).length
  if (!len) {
    return AntdMessage.error('备份不存在或没有有效的配置')
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings(pickedSettings)
  return toastAndReload()
}

export function TabPaneAdvance() {
  const { autoPreviewUpdateInterval } = useSettingsSnapshot()

  return (
    <div className={styles.tabPane}>
      <SettingsGroup title='设置项'>
        <Space size={20}>
          <Popconfirm
            title='确定'
            description='确定恢复默认设置? 该操作不可逆!'
            onConfirm={onResetSettings}
          >
            <Button danger type='primary'>
              <TablerRestore />
              恢复默认设置
            </Button>
          </Popconfirm>

          <Space size={5}>
            <AntdTooltip title='导出所有设置项到文件中, 包含 access_key 等数据'>
              <Button onClick={() => exportSettings()}>
                <TablerFileExport />
                导出设置
              </Button>
            </AntdTooltip>
            <AntdTooltip title='从文件中导入设置项, 将覆盖当前设置, 该操作不可逆!'>
              <Button onClick={() => importSettings()}>
                <TablerFileImport />
                导入设置
              </Button>
            </AntdTooltip>
          </Space>
        </Space>
      </SettingsGroup>

      <SettingsGroup title='备份/恢复'>
        <div css={flexVerticalCenterStyle}>
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

        <Popconfirm
          title='确定'
          description='将覆盖本地设置? 该操作不可逆!'
          onConfirm={onRestoreSettings}
        >
          <Button danger type='primary'>
            <TablerRestore />
            从专栏草稿箱中恢复
          </Button>
        </Popconfirm>
      </SettingsGroup>

      <SettingsGroup
        titleCss={css`
          justify-content: space-between;
        `}
        title={
          <>
            预览
            <ResetPartialSettingsButton
              keys={['autoPreviewUpdateInterval', 'autoPreviewUseContinuousProgress']}
            />
          </>
        }
      >
        <div css={flexVerticalCenterStyle}>
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
      </SettingsGroup>
    </div>
  )
}
