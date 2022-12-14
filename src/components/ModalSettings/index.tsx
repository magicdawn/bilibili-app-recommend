import utilityStyles from '$common/utility.module.less'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { SettingsCheck } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { resetSettings, settings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import delay from 'delay'
import { useId } from 'react'
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
  const pureRecommendId = useId()
  const { pureRecommend } = useSettingsSnapshot()

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
        {/* <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>Auth</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <AccessKeyManage />
          </div>
        </div> */}

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>开关</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <input
              type='checkbox'
              className={utilityStyles.checkbox}
              id={pureRecommendId}
              checked={pureRecommend}
              onChange={(e) => {
                settings.pureRecommend = (e.target as HTMLInputElement).checked
                return toastAndReload()
              }}
            />
            <label htmlFor={pureRecommendId}>开启纯推荐模式</label>
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

            {/* <div className={styles.row} style={{ marginTop: 10 }}>
              <SettingsCheck
                configKey={'getRecommendParallelRequest'}
                label='推荐接口使用并行请求'
                className={styles.check}
              />
            </div> */}
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
