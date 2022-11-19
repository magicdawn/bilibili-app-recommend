import utilityStyles from '$common/utility.module.less'
import { BaseModal } from '$components/BaseModal'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { cx } from '$libs'
import { config, useConfigSnapshot } from '$settings'
import Config from '@icon-park/react/lib/icons/Config'
import { useId } from 'react'
import styles from './index.module.less'

export function ModalConfig({ show, onHide }: { show: boolean; onHide: () => void }) {
  const pureRecommendId = useId()

  const { pureRecommend } = useConfigSnapshot()

  return (
    <BaseModal
      {...{
        show,
        onHide,
        clsModalMask: styles.modalMask,
        clsModal: styles.modal,
        hideWhenMaskOnClick: true,
      }}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>
          <Config theme='outline' size='24' fill='#333' className={styles.configIcon} />
          设置项
        </div>

        <div className='space' style={{ flex: 1 }}></div>

        <button className={`primary-btn roll-btn ${styles.btnClose}`} onClick={onHide}>
          <svg style={{ transform: 'rotate(0deg)' }}>
            <use xlinkHref='#widget-close'></use>
          </svg>
          <span>关闭</span>
        </button>
      </div>

      <main className={styles.modalBody}>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>access_key</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <AccessKeyManage />
          </div>
        </div>

        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle}>Feature 开关</div>
          <div className={cx(styles.settingsGroupContent, styles.row)}>
            <input
              type='checkbox'
              className={utilityStyles.checkbox}
              id={pureRecommendId}
              checked={pureRecommend}
              onChange={(e) => {
                config.pureRecommend = (e.target as HTMLInputElement).checked
              }}
            />
            <label htmlFor={pureRecommendId}>开启纯享模式</label>
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
