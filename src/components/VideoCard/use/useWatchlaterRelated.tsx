import { type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { WatchLaterIcon } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { watchLaterState } from '$modules/rec-services/watchlater'
import { AntdMessage } from '$utility'
import { usePrevious, useRequest } from 'ahooks'
import { delay } from 'es-toolkit'
import { size } from 'polished'
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
  watchLaterAdded,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onRemoveCurrent: VideoCardInnerProps['onRemoveCurrent']
  actionButtonVisible: boolean
  watchLaterAdded: boolean
}) {
  const { avid, bvid } = cardData
  const hasWatchLaterEntry = (() => {
    if (item.api === EApiType.App) {
      return item.goto === 'av'
    }
    if (item.api === EApiType.Ranking) {
      return cardData.goto === 'av'
    }
    if (item.api === EApiType.Live) {
      return false
    }
    return true
  })()

  const $req = useRequest(
    (usingAction: typeof watchLaterAdd | typeof watchLaterDel, bvid: string) => {
      return usingAction(bvid)
    },
    { manual: true },
  )

  // watchLater added
  const watchLaterAddedPrevious = usePrevious(watchLaterAdded)

  const onToggleWatchLater = useMemoizedFn(
    async (
      e?: MouseEvent,
      usingAction?: typeof watchLaterDel | typeof watchLaterAdd,
    ): Promise<{ success: boolean; targetState?: boolean }> => {
      e?.preventDefault()
      e?.stopPropagation()

      // already loading
      if ($req.loading) return { success: false }

      if (!avid || !bvid) {
        return { success: false }
      }

      // run the action
      usingAction ??= watchLaterAdded ? watchLaterDel : watchLaterAdd
      const success = await $req.runAsync(usingAction, avid)

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
            await delay(1000)
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
  // <svg width={addSize} height={addSize}>
  //   <use href={'#widget-watch-later'} />
  // </svg>

  const addSize = 20
  const addedSize = 18
  const icon = $req.loading ? (
    <IconSvgSpinnersBarsRotateFade {...size(16)} />
  ) : watchLaterAdded ? (
    <IconAnimatedChecked size={addedSize} useAnimation={watchLaterAddedPrevious === false} />
  ) : (
    <WatchLaterIcon {...size(addSize)} />
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
