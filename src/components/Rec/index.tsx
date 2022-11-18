import { PureRecommend } from '$components/PureRecommend'
import { RecHeader, SectionRecommend } from '$components/SectionRecommend'
import { config } from '$settings'
import { useCallback } from 'react'
import { useSnapshot } from 'valtio'

export function Rec() {
  const { pureRecommend } = useSnapshot(config)

  const onRefresh = useCallback(() => {
    //
  }, [])

  return pureRecommend ? (
    <PureRecommend header={<RecHeader onRefresh={onRefresh} />} />
  ) : (
    <SectionRecommend />
  )
}
