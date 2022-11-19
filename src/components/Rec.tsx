import { PureRecommend } from '$components/PureRecommend'
import { SectionRecommend } from '$components/SectionRecommend'
import { config } from '$settings'
import { useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { RecHeader } from './RecHeader'

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
