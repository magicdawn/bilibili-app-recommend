import { type RecItemType } from '$define'
import { useWatchLaterState, watchLaterState } from '$modules/recommend/watchlater'
import { AntdMessage } from '$utility'
import { usePrevious } from 'ahooks'
import delay from 'delay'
import { motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import type { VideoCardInnerProps } from '..'
import { watchLaterAdd, watchLaterDel } from '../card.service'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import type { IVideoCardData } from '../process/normalize'

/**
 * 稍候再看
 */
export function useWatchlaterRelated({
  item,
  cardData,
  onRemoveCurrent,
  actionButtonVisible,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onRemoveCurrent: VideoCardInnerProps['onRemoveCurrent']
  actionButtonVisible: boolean
}) {
  const { avid, bvid } = cardData
  const hasWatchLaterEntry = item.api !== 'app' || (item.api === 'app' && item.goto === 'av')

  // watchLater added
  const watchLaterAdded = useWatchLaterState(bvid)
  const watchLaterAddedPrevious = usePrevious(watchLaterAdd)

  const _requesting = useRef(false)
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

      if (_requesting.current) return { success: false }
      _requesting.current = true

      let success = false
      try {
        success = await usingAction(avid)
      } finally {
        _requesting.current = false
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

  // <use href={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} />

  const size = 20
  const icon = watchLaterAdded ? (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width={size} height={size}>
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
  ) : (
    <svg width={size} height={size}>
      <use href={'#widget-watch-later'} />
    </svg>
  )
  const watchlaterButtonEl = hasWatchLaterEntry && (
    <VideoCardActionButton
      visible={actionButtonVisible}
      inlinePosition='right'
      icon={icon}
      tooltip={watchLaterAdded ? '移除稍后再看' : '稍后再看'}
      onClick={onToggleWatchLater}
    />
  )

  return { watchlaterButtonEl, onToggleWatchLater, watchLaterAdded, hasWatchLaterEntry }
}
