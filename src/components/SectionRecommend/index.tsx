import { baseDebug } from '$common'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentSourceTab } from '$components/RecHeader/tab'
import { internalTesting, limitTwoLines, videoGrid } from '$components/video-grid.module.less'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { cx } from '$libs'
import { getIsInternalTesting } from '$platform'
import { getRecommendForHome } from '$service'
import { useMount } from 'ahooks'
import { useMemo } from 'react'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'

const debug = baseDebug.extend('components:SectionRecommend')

export function SectionRecommend() {
  const skeletonPlaceholders = useMemo(() => {
    return new Array(20).fill(0).map(() => {
      return crypto.randomUUID()
    })
  }, [])

  const isInternalTesting = getIsInternalTesting()

  const tab = useCurrentSourceTab()
  const { refreshing, items, refresh, error } = useRefresh({
    tab,
    debug,
    fetcher: getRecommendForHome,
    recreateService: false,
  })
  useMount(refresh)

  return (
    <section data-area='推荐'>
      <RecHeader refreshing={refreshing} onRefresh={refresh} />
      <div
        className={cx(videoGrid, limitTwoLines, { [internalTesting]: isInternalTesting })}
        style={{ marginBottom: isInternalTesting ? 30 : 0 }}
      >
        {refreshing || error
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
          : items!.map((item: PcRecItemExtend | AppRecItemExtend) => {
              return <VideoCard key={item.uniqId} item={item} />
            })}
      </div>
    </section>
  )
}
