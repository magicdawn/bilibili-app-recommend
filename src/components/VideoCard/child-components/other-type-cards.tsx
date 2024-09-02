import { OPERATION_FAIL_MSG } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import type { Reason } from '$components/ModalDislike'
import { delDislikeId } from '$components/ModalDislike'
import type { AppRecItem, RecItemType } from '$define'
import { IconPark } from '$modules/icon/icon-park'
import { UserBlacklistService } from '$modules/user/relations/blacklist'
import { AntdMessage } from '$utility'
import { toastRequestFail } from '$utility/toast'
import { cancelDislike } from '../card.service'
import styles from '../index.module.scss'
import type { VideoCardEmitter } from '../index.shared'
import { borderRadiusValue, defaultEmitter } from '../index.shared'
import type { IVideoCardData } from '../process/normalize'
import { VideoCardBottom } from './VideoCardBottom'

export const SkeletonCard = memo(function SkeletonCard({ loading }: { loading: boolean }) {
  return (
    <div
      className={clsx('bili-video-card__skeleton', {
        hide: !loading,
        [styles.skeletonActive]: loading,
      })}
    >
      <div
        className='bili-video-card__skeleton--cover'
        style={{ borderRadius: borderRadiusValue }}
      />
      <div
        className='bili-video-card__skeleton--info'
        css={css`
          padding-inline: 5px;
        `}
      >
        <div
          className='bili-video-card__skeleton--avatar'
          css={css`
            width: 32px;
            height: 32px;
            border-radius: 50%;
          `}
        />
        <div
          className='bili-video-card__skeleton--right'
          css={css`
            flex: 1;
            margin-left: 10px;
          `}
        >
          <p className='bili-video-card__skeleton--text'></p>
          <p className='bili-video-card__skeleton--text short'></p>
          <p className='bili-video-card__skeleton--light'></p>
          <p className='bili-video-card__skeleton--text tiny'></p>
        </div>
      </div>
    </div>
  )
})

export const DislikedCard = memo(function DislikedCard({
  item,
  cardData,
  dislikedReason,
  emitter = defaultEmitter,
}: {
  item: AppRecItem
  cardData: IVideoCardData
  dislikedReason: Reason
  emitter?: VideoCardEmitter
}) {
  const onCancelDislike = useMemoizedFn(async () => {
    if (!dislikedReason?.id) return

    let success = false
    let message = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await cancelDislike(item, dislikedReason.id))
    } catch (e) {
      err = e as Error
    }
    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    if (success) {
      AntdMessage.success('已撤销')
      delDislikeId(item.param)
    } else {
      AntdMessage.error(message || OPERATION_FAIL_MSG)
    }
  })

  useMittOn(emitter, 'cancel-dislike', onCancelDislike)

  return (
    <div className={clsx(styles.dislikedWrapper)}>
      <div className={styles.dislikeContentCover}>
        <div className={styles.dislikeContentCoverInner}>
          <IconPark name='DistraughtFace' size={32} className={styles.dislikeIcon} />
          <div className={styles.dislikeReason}>{dislikedReason?.name}</div>
          <div className={styles.dislikeDesc}>{dislikedReason?.toast || '将减少此类内容推荐'}</div>
        </div>
      </div>
      <div className={styles.dislikeContentAction}>
        <VideoCardBottom item={item as RecItemType} cardData={cardData} />
        <div className={styles.dislikeContentActionInner}>
          <button onClick={onCancelDislike}>
            <IconPark name='Return' size='16' style={{ marginRight: 4, marginTop: -2 }} />
            撤销
          </button>
        </div>
      </div>
    </div>
  )
})

export const BlacklistCard = memo(function BlacklistCard({
  cardData,
}: {
  cardData: IVideoCardData
}) {
  const { authorMid, authorName } = cardData

  const onCancel = useMemoizedFn(async () => {
    if (!authorMid) return
    const success = await UserBlacklistService.remove(authorMid)
    if (success) AntdMessage.success(`已移出黑名单: ${authorName}`)
  })

  return (
    <div className={clsx(styles.dislikedWrapper)}>
      <div className={styles.dislikeContentCover}>
        <div className={styles.dislikeContentCoverInner}>
          <IconPark name='PeopleDelete' size={32} className={styles.dislikeIcon} />
          <div className={styles.dislikeReason}>已拉黑</div>
          <div className={styles.dislikeDesc}>UP: {authorName}</div>
        </div>
      </div>
      <div className={styles.dislikeContentAction}>
        <div className={styles.dislikeContentActionInner}>
          <button onClick={onCancel}>
            <IconPark name='Return' size='16' style={{ marginRight: 4, marginTop: -2 }} />
            撤销
          </button>
        </div>
      </div>
    </div>
  )
})
