import { RecGrid, RecGridRef } from '$components/RecGrid'
import { RecHeader } from '$components/RecHeader'
import { css } from '$libs'
import { useConfigSnapshot } from '$settings'
import { useMemoizedFn } from 'ahooks'
import { useRef } from 'react'

const narrowStyle = {
  grid: css`
    /* card=299 col-gap=20  */
    width: ${299 * 2 + 20}px;
    margin: 0 auto;
  `,
}

export function PureRecommend() {
  const recGrid = useRef<RecGridRef>(null)

  // 窄屏模式
  const { useNarrowMode } = useConfigSnapshot()

  const onRefresh = useMemoizedFn(() => {
    return recGrid.current?.refresh()
  })

  const onScrollToTop = useMemoizedFn(() => {
    document.body.scrollTop = 0
  })

  return (
    <section data-area='推荐'>
      <RecHeader onRefresh={onRefresh} />
      <RecGrid
        ref={recGrid}
        css={[useNarrowMode && narrowStyle.grid]}
        shortcutEnabled={false}
        infiteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
      />
    </section>
  )
}
