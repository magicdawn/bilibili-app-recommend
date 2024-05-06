/**
 * 我不想看
 */

import { showModalDislike } from '$components/ModalDislike'
import { isApp, type RecItemType } from '$define'
import { AntdMessage } from '$utility'
import type { MouseEvent } from 'react'
import PhThumbsDownDuotone from '~icons/ph/thumbs-down-duotone'
import { VideoCardActionButton } from '../child-components/VideoCardActions'

export const DislikeIcon = PhThumbsDownDuotone
export const dislikeIcon = <PhThumbsDownDuotone width={16} height={16} />

export function useDislikeRelated({
  item,
  authed,
  actionButtonVisible,
}: {
  item: RecItemType
  authed: boolean
  actionButtonVisible: boolean
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

  const dislikeButtonEl = hasDislikeEntry && (
    <VideoCardActionButton
      visible={actionButtonVisible}
      inlinePosition='left'
      icon={dislikeIcon}
      tooltip='我不想看'
      onClick={onTriggerDislike}
    />
  )

  return { dislikeButtonEl, hasDislikeEntry, onTriggerDislike }
}
