import { limitTwoLines, videoGrid } from '$components/video-grid.module.less'
import { getHomeRecommend } from '$service'
import { useRequest } from 'ahooks'
import cx from 'classnames'
import { useMemo } from 'react'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'

export function SectionRecommend({ internalTesting = false } = {}) {
  const skeletonPlaceholders = useMemo(() => {
    return new Array(20).fill(0).map(() => {
      return crypto.randomUUID()
    })
  }, [])

  const { data: items, loading, error, refresh } = useRequest(getHomeRecommend)

  // log error
  if (error) {
    console.error(error.stack || error)
  }

  return (
    <section data-area='推荐'>
      <RecHeader onRefresh={refresh} />
      <div className={cx(videoGrid, limitTwoLines)}>
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
