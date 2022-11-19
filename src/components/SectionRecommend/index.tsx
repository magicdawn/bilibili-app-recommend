import { getHomeRecommend } from '$service'
import { config, useConfigSnapshot } from '$settings'
import { useRequest } from 'ahooks'
import cx from 'classnames'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CollapseBtnRef } from '../CollapseBtn'
import { VideoCard } from '../VideoCard'
import * as styles from './index.module.less'
import { RecHeader } from '../RecHeader'

export function SectionRecommend({ internalTesting = false }) {
  const { accessKey, pureRecommend } = useConfigSnapshot()
  const collapseBtnRef = useRef<CollapseBtnRef>(null)

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

  const [showMore, setShowMore] = useState(() => config.initialShowMore)
  const onSeeMore = useCallback(() => {
    setShowMore(true)
  }, [])
  const onModalFeedHide = useCallback(() => {
    setShowMore(false)
  }, [])

  const [modalConfigVisible, setModalConfigVisible] = useState(false)
  const showModalConfig = useCallback(() => {
    setModalConfigVisible(true)
  }, [])
  const hideModalConfig = useCallback(() => {
    setModalConfigVisible(false)
  }, [])

  return (
    <section
      className={cx('bili-grid', { 'no-margin': !internalTesting }, styles.grid)}
      data-area='推荐'
    >
      <div className={`video-card-list is-full ${styles.videoCardList}`}>
        <RecHeader onRefresh={refresh} />
        <div className='video-card-body more-class1 more-class2'>
          {loading || error
            ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
            : items!.map((item) => {
                return <VideoCard key={item.uniqId} item={item} />
              })}
        </div>
      </div>
    </section>
  )
}
