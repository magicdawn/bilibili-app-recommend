import utilityStyles from '$common/utility.module.less'
import { BaseModal } from '$components/BaseModal'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { css, cx } from '$libs'
import { config, useConfigSnapshot } from '$settings'
import Config from '@icon-park/react/lib/icons/Config'
import { useId } from 'react'
import styles from './index.module.less'
import { ConfigCheck } from '$components/piece'
import { toast } from '$utility/toast'
import delay from 'delay'
import { useIsDarkMode } from '$platform'

export function ModalConfig({ show, onHide }: { show: boolean; onHide: () => void }) {
  const pureRecommendId = useId()
  const { pureRecommend } = useConfigSnapshot()
  const isDarkMode = useIsDarkMode()

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
          <Config
            theme='outline'
            size='24'
            fill={isDarkMode ? '#fff' : '#333'}
            className={styles.configIcon}
          />
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
                config.pureRecommend = (e.target as HTMLInputElement).checked
                toast('即将刷新网页')
                await delay(500)
                location.reload()
              }}
            />
            <label htmlFor={pureRecommendId}>开启纯分享模式</label>

            <ConfigCheck
              configKey={'initialShowMore'}
              label='自动查看更多'
              className={styles.check}
            />
            <ConfigCheck
              configKey={'useNarrowMode'}
              label='启用窄屏模式'
              className={styles.check}
            />
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
