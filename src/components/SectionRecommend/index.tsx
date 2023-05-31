import { internalTesting, limitTwoLines, videoGrid } from '$components/video-grid.module.less'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { cx } from '$libs'
import { getIsInternalTesting } from '$platform'
import { getRecommendForHome } from '$service'
import { DynamicFeedService } from '$service-dynamic-feed'
import { PcRecService } from '$service-pc'
import { useRequest } from 'ahooks'
import { useMemo } from 'react'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'

export function SectionRecommend() {
  const skeletonPlaceholders = useMemo(() => {
    return new Array(20).fill(0).map(() => {
      return crypto.randomUUID()
    })
  }, [])

  const isInternalTesting = getIsInternalTesting()

  const dynamicFeedService = useMemo(() => new DynamicFeedService(), [])
  const pcRecService = useMemo(() => new PcRecService(), [])
  const {
    data: items,
    loading,
    error,
    refresh,
  } = useRequest(() => getRecommendForHome(pcRecService, dynamicFeedService))
  if (error) {
    console.error(error.stack || error)
  }

  return (
    <section data-area='推荐'>
      <RecHeader onRefresh={refresh} />
      <div
        className={cx(videoGrid, limitTwoLines, { [internalTesting]: isInternalTesting })}
        style={{ marginBottom: isInternalTesting ? 30 : 0 }}
      >
        {loading || error
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
          : items!.map((item: PcRecItemExtend | AppRecItemExtend) => {
              return <VideoCard key={item.uniqId} item={item} />
            })}
      </div>
    </section>
  )
}
