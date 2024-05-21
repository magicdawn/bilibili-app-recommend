/**
 * 我不想看
 */

import { showModalDislike } from '$components/ModalDislike'
import { isApp, type RecItemType } from '$define'
import { AntdMessage, toast } from '$utility'
import type { MouseEvent } from 'react'
import PhThumbsDownDuotone from '~icons/ph/thumbs-down-duotone'
import { VideoCardActionButton } from '../child-components/VideoCardActions'

export const DislikeIcon = PhThumbsDownDuotone
export const dislikeIcon = <DislikeIcon width={16} height={16} />

export function useDislikeRelated({
  item,
  authed,
  actionButtonVisible,
}: {
  item: RecItemType
  authed: boolean
  actionButtonVisible: boolean
}) {
  // show icon even accessKey not found
  // https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/244405

  const hasDislikeEntry = isApp(item) && !!item.three_point?.dislike_reasons?.length

  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== 'app') {
        return AntdMessage.error('当前视频不支持提交「我不想看」')
      }
      return
    }

    if (!authed) {
      return toast('请先获取 access_key ~')
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
