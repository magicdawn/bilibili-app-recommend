import { RecGrid, RecGridRef } from '$components/RecGrid'
import { OnRefresh, RecHeader, RecHeaderRef, useHeaderState } from '$components/RecHeader'
import { css } from '$libs'
import { useSettingsSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { ReactNode, useRef, useState } from 'react'

const narrowStyle = {
  grid: css`
    /* card=360 col-gap=16  */
    width: ${360 * 2 + 20}px;
    margin: 0 auto;
  `,
}

export function PureRecommend() {
  // 窄屏模式
  const { useNarrowMode } = useSettingsSnapshot()

  // 是否已经打开 "查看更多" 即 ModalFeed
  const { modalFeedVisible, modalConfigVisible } = useHeaderState()

  const recHeader = useRef<RecHeaderRef>(null)
  const recGrid = useRef<RecGridRef>(null)

  const onRefresh: OnRefresh = useMemoizedFn((...args) => {
    return recGrid.current?.refresh(...args)
  })
  const onScrollToTop = useMemoizedFn(() => {
    return recHeader.current?.scroll()
  })

  const [refreshing, setRefreshing] = useState(false)

  const [extraInfo, setExtraInfo] = useState<ReactNode>(null)

  return (
    <section data-area='推荐'>
      <RecHeader
        ref={recHeader}
        refreshing={refreshing}
        onRefresh={onRefresh}
        leftSlot={extraInfo}
      />
      <RecGrid
        ref={recGrid}
        css={[useNarrowMode && narrowStyle.grid]}
        shortcutEnabled={!(modalFeedVisible || modalConfigVisible)}
        infiteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
        setRefreshing={setRefreshing}
        setExtraInfo={setExtraInfo}
      />
    </section>
  )
}
