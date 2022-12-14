import { internalTesting, limitTwoLines, videoGrid } from '$components/video-grid.module.less'
import { cx } from '$libs'
import { getIsInternalTesting } from '$platform'
import { getRecommendForHome } from '$service'
import { getPcRecommendForHome } from '$service-pc'
import { useMemoizedFn, useRequest } from 'ahooks'
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
  const pageRef = useMemo(() => ({ page: 1 }), [])

  // getRecommendForHome
  const { data: items, loading, error, refresh } = useRequest(() => getPcRecommendForHome(pageRef))
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
          : items!.map((item) => {
              return <VideoCard key={item.uniqId} item={item} />
            })}
      </div>
    </section>
  )

  // className={cx('bili-grid', { 'no-margin': !internalTesting }, styles.grid)}
}
