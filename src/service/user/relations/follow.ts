/**
 * user follow services
 */

import { modifyRelations } from './common'

export const follow = followActionFactory('follow')
export const unfollow = followActionFactory('unfollow')
export const UserfollowService = { follow, unfollow }

function followActionFactory(action: 'follow' | 'unfollow') {
  // 取消关注
  // 1 === this.attribute ? 4 : 2

  const act = action === 'follow' ? 1 : 2

  return async function followAction(upMid: string) {
    const success = await modifyRelations(upMid, act)
    return success
  }
}
