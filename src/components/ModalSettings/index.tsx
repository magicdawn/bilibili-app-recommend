import { AccessKeyManage, accessKeyLinkBtn } from '$components/AccessKeyManage'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { FlagSettingItem } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { resetSettings, settings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import { Button, Radio, Space } from 'antd'
import delay from 'delay'
import styles from './index.module.less'

async function toastAndReload() {
  toast('即将刷新网页')
  await delay(500)
  location.reload()
}

function onResetSettings() {
  const yes = window.confirm('确定?')
  if (!yes) return
  resetSettings()
  return toastAndReload()
}

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  const { pureRecommend, usePcDesktopApi } = useSettingsSnapshot()

  return (
    <BaseModal {...{ show, onHide, hideWhenMaskOnClick: true, hideWhenEsc: true }}>
      <div className={BaseModalClass.modalHeader}>
        <div className={BaseModalClass.modalTitle}>
          <IconPark name='Config' className={styles.configIcon} />
          设置项
        </div>

        <div className='space' style={{ flex: 1 }}></div>

        <ModalClose onClick={onHide} />
      </div>

      <main className={BaseModalClass.modalBody}>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>接口切换</div>
          <div className={cx(styles.settingsGroupContent)}>
            <Radio.Group
              buttonStyle='solid'
              value={usePcDesktopApi ? 'desktop' : 'app'}
              onChange={(e) => {
                const newValue = e.target.value
                settings.usePcDesktopApi = newValue === 'desktop'
              }}
            >
              <Radio.Button value='desktop'>使用桌面端接口</Radio.Button>
              <Radio.Button value='app'>使用 App 端接口</Radio.Button>
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
              className={styles.check}
              extraAction={toastAndReload}
            />

            <FlagSettingItem
              configKey={'initialShowMore'}
              label='自动查看更多'
              className={styles.check}
              extraAction={(val) => {
                if (val) {
                  toast('已开启自动查看更多: 下次打开首页时将直接展示推荐弹框')
                }
              }}
            />

            <FlagSettingItem
              configKey={'useNarrowMode'}
              label='启用居中模式(居中两列)'
              className={styles.check}
            />
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>高级</div>
          <div className={cx(styles.settingsGroupContent)}>
            <div className={styles.row}>
              <Button onClick={onResetSettings} type='primary' danger>
                恢复默认设置
              </Button>
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <FlagSettingItem
                configKey={'openInIINAWhenRightClick'}
                label='右键在 IINA 中打开'
                className={styles.check}
              />
            </div>
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>帮助</div>
          <div className={cx(styles.settingsGroupContent)}>
            <div className={styles.row}>
              <Space size='small'>
                <Button
                  href='https://github.com/magicdawn/bilibili-app-recommend#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E'
                  target='_blank'
                >
                  查看可用的快捷键
                </Button>
                {accessKeyLinkBtn}
              </Space>
            </div>
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
