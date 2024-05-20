import { type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { useWatchLaterState, watchLaterState } from '$modules/recommend/watchlater'
import { AntdMessage } from '$utility'
import { usePrevious } from 'ahooks'
import delay from 'delay'
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
  const hasWatchLaterEntry = (() => {
    if (item.api === EApiType.App) {
      return item.goto === 'av'
    }
    if (item.api === EApiType.Ranking) {
      return cardData.goto === 'av'
    }
    return true
  })()

  // watchLater added
  const watchLaterAdded = useWatchLaterState(bvid)
  const watchLaterAddedPrevious = usePrevious(watchLaterAdded)

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
        if (item.api === EApiType.Watchlater) {
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

  // <use href={watchLaterAdded ? '#widget-watch-save' : '#widget-watch-later'} />
  const addSize = 15
  const addedSize = 18
  const icon = watchLaterAdded ? (
    <IconAnimatedChecked size={addedSize} useAnimation={watchLaterAddedPrevious === false} />
  ) : (
    <svg width={addSize} height={addSize}>
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
