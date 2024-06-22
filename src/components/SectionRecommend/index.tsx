import { APP_CLS_CARD, baseDebug } from '$common'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { useCardBorderCss } from '$components/VideoCard/card-border-css'
import { limitTwoLines, videoGrid, videoGridBiliFeed4 } from '$components/video-grid.module.scss'
import { EApiType } from '$define/index.shared'
import { refreshForHome } from '$modules/rec-services'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'

const debug = baseDebug.extend('components:SectionRecommend')

export function SectionRecommend() {
  const skeletonPlaceholders = useMemo(
    () => new Array(20).fill(0).map(() => crypto.randomUUID()),
    [],
  )

  const tab = useCurrentUsingTab()
  const {
    refreshing,
    items,
    refresh,
    error: refreshError,
    useSkeleton,
  } = useRefresh({
    tab,
    debug,
    fetcher: refreshForHome,
    recreateService: false,
  })
  useMount(refresh)

  const showSkeleton = !items.length || refreshError || (refreshing && useSkeleton)

  const cardBorderCss = useCardBorderCss()

  return (
    <section data-area='推荐'>
      <RecHeader refreshing={refreshing} onRefresh={refresh} />
      <div
        className={clsx(videoGrid, limitTwoLines, videoGridBiliFeed4)}
        style={{ marginBottom: 30 }}
      >
        {showSkeleton
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} />)
          : items.map((item) => {
              return item.api === EApiType.Separator ? null : (
                <VideoCard
                  key={item.uniqId}
                  item={item}
                  className={clsx(APP_CLS_CARD)}
                  css={cardBorderCss}
                />
              )
            })}
      </div>
    </section>
  )
}
