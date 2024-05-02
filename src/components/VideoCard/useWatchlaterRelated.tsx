import { type RecItemType } from '$define'
import { useWatchLaterState, watchLaterState } from '$modules/recommend/watchlater'
import { AntdMessage } from '$utility'
import { useHover, usePrevious } from 'ahooks'
import delay from 'delay'
import { motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import type { VideoCardInnerProps } from '.'
import { watchLaterAdd, watchLaterDel } from './card.service'
import styles from './index.module.scss'
import type { IVideoCardData } from './process/normalize'

/**
 * 稍候再看
 */
export function useWatchlaterRelated({
  item,
  cardData,
  onRemoveCurrent,
  isHoveringAfterDelay,
  active,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onRemoveCurrent: VideoCardInnerProps['onRemoveCurrent']
  isHoveringAfterDelay: boolean
  active: boolean
}) {
  const { avid, bvid } = cardData

  const hasWatchLaterEntry = item.api !== 'app' || (item.api === 'app' && item.goto === 'av')

  // 稍后再看 hover state
  const watchLaterRef = useRef(null)
  const isWatchLaterHovering = useHover(watchLaterRef)

  // watchLater added
  const watchLaterAdded = useWatchLaterState(bvid)
  const watchLaterAddedPrevious = usePrevious(watchLaterAdd)

  const requestingWatchLaterApi = useRef(false)
  const onToggleWatchLater = useMemoizedFn(
    async (
      e?: MouseEvent,
      usingAction?: typeof watchLaterDel | typeof watchLaterAdd,
    ): Promise<{ success: boolean; targetState?: boolean }> => {
      e?.preventDefault()
      e?.stopPropagation()

      usingAction ??= watchLaterAdded ? watchLaterDel : watchLaterAdd
      if (usingAction !== watchLaterAdd && usingAction !== watchLaterDel) {
        throw new Error('unexpected usingAction provided')
      }

      if (requestingWatchLaterApi.current) return { success: false }
      requestingWatchLaterApi.current = true

      let success = false
      try {
        success = await usingAction(avid)
      } finally {
        requestingWatchLaterApi.current = false
      }

      const targetState = usingAction === watchLaterAdd ? true : false
      if (success) {
        if (targetState) {
          watchLaterState.bvidSet.add(bvid)
        } else {
          watchLaterState.bvidSet.delete(bvid)
        }

        // 稍后再看
        if (item.api === 'watchlater') {
          // when remove-watchlater for watchlater tab, remove this card
          if (!targetState) {
            await delay(100)
            onRemoveCurrent?.(item, cardData)
          }
        }

        // 其他 Tab
        else {
          AntdMessage.success(`已${targetState ? '添加' : '移除'}稍后再看`)
        }
      }

      return { success, targetState }
    },
  )

  /**
   * svg checked mark
   *
   * 自己画的
   * viewBox = '0 0 200 200'
   * checkMarkD = 'M25,100 l48,48 a 8.5,8.5 0 0 0 10,0 l90,-90'
   *
   * 其他来源
   * 24 24 from iconify
   * https://icones.js.org/collection/line-md?icon=line-md:confirm
   */

  const watchlaterIconEl = (
    <>
      {hasWatchLaterEntry && (
        <div
          className={`${styles.watchLater}`}
          style={{
            display: isHoveringAfterDelay || active ? 'flex' : 'none',
          }}
          ref={watchLaterRef}
          onClick={onToggleWatchLater}
        >
          {watchLaterAdded ? (
            <>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className={styles.watchLaterIcon}
                viewBox='0 0 24 24'
              >
                <motion.path
                  fill='transparent'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 11L11 17L21 7'
                  {...(!watchLaterAddedPrevious
                    ? {
                        initial: { pathLength: 0 },
                        animate: { pathLength: 1 },
                        transition: { duration: 0.2, ease: 'easeInOut' },
                      }
                    : undefined)}
                />
              </svg>
            </>
          ) : (
            <svg className={styles.watchLaterIcon}>
              <use href={'#widget-watch-later'} />
            </svg>
          )}
          {/* <use href={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} /> */}
          <span
            className={styles.watchLaterTip}
            style={{ display: isWatchLaterHovering ? 'block' : 'none' }}
          >
            {watchLaterAdded ? '移除稍后再看' : '稍后再看'}
          </span>
        </div>
      )}
    </>
  )

  return { watchlaterIconEl, onToggleWatchLater, watchLaterAdded, hasWatchLaterEntry }
}
