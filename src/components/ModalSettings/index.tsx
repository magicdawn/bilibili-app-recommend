import utilityStyles from '$common/utility.module.less'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { BaseModal, BaseModalClass, ModalClose } from '$components/BaseModal'
import { ConfigCheck } from '$components/piece'
import { IconPark } from '$icon-park'
import { cx } from '$libs'
import { settings, useSettingsSnapshot } from '$settings'
import { toast } from '$utility/toast'
import delay from 'delay'
import { useId } from 'react'
import styles from './index.module.less'

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

        {/* <button className={`primary-btn roll-btn ${BaseModalClass.btnClose}`} onClick={onHide}>
          <svg style={{ transform: 'rotate(0deg)' }}>
            <use xlinkHref='#widget-close'></use>
          </svg>
          <span>关闭</span>
        </button> */}

        <ModalClose onClick={onHide} />
      </div>

      <main className={BaseModalClass.modalBody}>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>Auth</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <AccessKeyManage />
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>开关</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <input
              type='checkbox'
              className={utilityStyles.checkbox}
              id={pureRecommendId}
              checked={pureRecommend}
              onChange={async (e) => {
                settings.pureRecommend = (e.target as HTMLInputElement).checked
                toast('即将刷新网页')
                await delay(500)
                location.reload()
              }}
            />
            <label htmlFor={pureRecommendId}>开启纯推荐模式</label>
            <ConfigCheck
              configKey={'initialShowMore'}
              label='自动查看更多'
              className={styles.check}
            />
            <ConfigCheck
              configKey={'useNarrowMode'}
              label='启用居中模式(居中两列)'
              className={styles.check}
            />
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>IINA</div>
          <div className={styles.settingsGroupContent}>
            <ConfigCheck
              configKey={'openInIINAWhenRightClick'}
              label='右键在 IINA 中打开'
              className={styles.check}
            />
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
