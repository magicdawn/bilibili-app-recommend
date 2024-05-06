import { showModalDislike } from '$components/ModalDislike'
import { isApp, type RecItemType } from '$define'
import { AntdMessage } from '$utility'
import { useHover } from 'ahooks'
import type { MouseEvent } from 'react'
import styles from './index.module.scss'

/**
 * 我不想看
 */

export function useDislikeRelated({
  item,
  authed,
  hoveringOnCover,
}: {
  item: RecItemType
  authed: boolean
  hoveringOnCover: boolean
}) {
  const hasDislikeEntry = isApp(item) && authed && !!item.three_point?.dislike_reasons?.length

  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== 'app') {
        return AntdMessage.error('当前视频不支持提交「我不想看」')
      }
      if (!authed) {
        return AntdMessage.error('请先获取 access_key')
      }
      return
    }

    showModalDislike(item)
  })

  const _iconRef = useRef(null)
  const _iconHovering = useHover(_iconRef)
  const dislikeIconEl = (
    <>
      {hasDislikeEntry && (
        <div
          ref={_iconRef}
          className={styles.btnDislike}
          onClick={onTriggerDislike}
          style={{ display: hoveringOnCover ? 'flex' : 'none' }}
        >
          <svg className={styles.btnDislikeIcon}>
            <use href='#widget-close'></use>
          </svg>
          <span
            className={styles.btnDislikeTip}
            style={{ display: _iconHovering ? 'block' : 'none' }}
          >
            我不想看
          </span>
        </div>
      )}
    </>
  )

  return { dislikeIconEl, hasDislikeEntry, onTriggerDislike }
}
