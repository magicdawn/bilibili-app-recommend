import { baseDebug } from '$common'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentSourceTab } from '$components/RecHeader/tab'
import {
  limitTwoLines,
  videoGrid,
  videoGridInternalTesting,
  videoGridNewHomepage,
} from '$components/video-grid.module.less'
import { AppRecItemExtend, PcRecItemExtend } from '$define'
import { cx } from '$libs'
import { getIsInternalTesting } from '$platform'
import { refreshForHome } from '$service'
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
  const {
    refreshing,
    items,
    refresh,
    error: refreshError,
    swr,
  } = useRefresh({
    tab,
    debug,
    fetcher: refreshForHome,
    recreateService: false,
  })
  useMount(refresh)

  const showSkeleton = refreshError || (refreshing && !swr)

  return (
    <section data-area='推荐'>
      <RecHeader refreshing={refreshing} onRefresh={refresh} />
      <div
        className={cx(
          videoGrid,
          limitTwoLines,
          isInternalTesting ? videoGridInternalTesting : videoGridNewHomepage
        )}
        style={{ marginBottom: isInternalTesting ? 30 : 0 }}
      >
        {showSkeleton
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
          : items!.map((item: PcRecItemExtend | AppRecItemExtend) => {
              return <VideoCard key={item.uniqId} item={item} />
            })}
      </div>
    </section>
  )
}
