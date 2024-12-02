/**
 * 我不想看
 */

import { showModalDislike } from '$components/ModalDislike'
import { isApp, type RecItemType } from '$define'
import { IconForDislike } from '$modules/icon'
import { antMessage } from '$utility/antd'
import toast from '$utility/toast'
import { size } from 'polished'
import type { MouseEvent } from 'react'
import { VideoCardActionButton } from '../child-components/VideoCardActions'

export const dislikeIcon = <IconForDislike {...size(16)} />

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
  // https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate/discussions/244405

  const hasDislikeEntry = isApp(item) && !!item.three_point?.dislike_reasons?.length

  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== 'app') {
        return antMessage.error('当前视频不支持提交「我不想看」')
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
