import { AccessKeyManage } from '$components/AccessKeyManage'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { SettingsCheck, SettingsCheckUi } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { resetSettings, settings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
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
            <SettingsCheck
              configKey={'usePcDesktopApi'}
              label='使用桌面端接口(默认使用 App 端接口)'
              className={styles.check}
            />

            {!usePcDesktopApi && (
              <div className={styles.row}>
                <AccessKeyManage />
              </div>
            )}
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>开关</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <SettingsCheckUi
              label='开启纯推荐模式'
              checked={pureRecommend}
              className={styles.check}
              onChange={(val) => {
                settings.pureRecommend = val
                return toastAndReload()
              }}
            />

            <SettingsCheck
              configKey={'initialShowMore'}
              label='自动查看更多'
              className={styles.check}
            />

            <SettingsCheck
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
              <button
                className='primary-btn roll-btn'
                style={{ display: 'inline-flex' }}
                onClick={onResetSettings}
              >
                <span>恢复默认设置</span>
              </button>
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <SettingsCheck
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
              <a
                className='primary-btn roll-btn'
                href='https://github.com/magicdawn/bilibili-app-recommend#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E'
                target='_blank'
              >
                快捷键使用说明
              </a>

              <a
                className='primary-btn roll-btn'
                target='_blank'
                href='https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
              >
                access_key 说明
              </a>
            </div>
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
