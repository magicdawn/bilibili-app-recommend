import utilityStyles from '$common/utility.module.less'
import { BaseModal } from '$components/BaseModal'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { css, cx } from '$libs'
import { config, useConfigSnapshot } from '$settings'
import Config from '@icon-park/react/lib/icons/Config'
import { useId } from 'react'
import styles from './index.module.less'
import { ConfigCheck } from '$components/piece'

const style = {
  check: css`
    margin-left: 20px;
    /* min-width: 150px; */

    &:first-child {
      margin-left: 0;
    }
  `,
}

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
              onChange={(e) => {
                config.pureRecommend = (e.target as HTMLInputElement).checked
              }}
            />
            <label htmlFor={pureRecommendId}>开启纯享模式</label>

            <ConfigCheck configKey={'initialShowMore'} label='自动查看更多' css={style.check} />
            <ConfigCheck configKey={'useNarrowMode'} label='启用窄屏模式' css={style.check} />
          </div>
        </div>
      </main>
    </BaseModal>
  )
}
