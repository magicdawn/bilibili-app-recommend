import { AntdTooltip } from '$components/_base/antd-custom'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { IconForAsc, IconForDefaultOrder, IconForDesc, IconForShuffle } from '$modules/icon'
import { Button } from 'antd'
import { delay } from 'es-toolkit'
import type { MouseEvent } from 'react'
import { useSnapshot } from 'valtio'
import { favStore } from '../store'

export enum FavItemsOrder {
  Default = 'default',
  Shuffle = 'shuffle',
  PubTimeDesc = 'pub-time-desc',
  PubTimeAsc = 'pub-time-asc',
}

export const FavItemsOrderConfig: Record<FavItemsOrder, { label: string; icon: ReactNode }> = {
  [FavItemsOrder.Default]: {
    label: '默认顺序',
    icon: <IconForDefaultOrder {...size(16)} />,
  },
  [FavItemsOrder.Shuffle]: {
    label: '随机顺序',
    icon: <IconForShuffle {...size(16)} />,
  },
  [FavItemsOrder.PubTimeDesc]: {
    label: '发布时间降序',
    icon: <IconForDesc {...size(16)} />,
  },
  [FavItemsOrder.PubTimeAsc]: {
    label: '发布时间升序',
    icon: <IconForAsc {...size(16)} />,
  },
}

export const ORDER_LIST = [
  FavItemsOrder.Default,
  FavItemsOrder.PubTimeDesc, // 感觉这个比较有用~
  FavItemsOrder.PubTimeAsc,
  FavItemsOrder.Shuffle,
]

// 缺省
// 是否 fallback 到 FavItemsOrder.PubTimeDesc 呢 ??? 感觉这个更有用
export const FALLBACK_ORDER = FavItemsOrder.Default

const tooltip = (
  <>
    在 {ORDER_LIST.map((x) => FavItemsOrderConfig[x].label).join(' -> ')} 之间切换 <br />
    点击切换, 按住 Shift 键点击切换到上一个
  </>
)

export function FavItemsOrderSwitcher() {
  const onRefresh = useOnRefreshContext()
  const { selectedKey, savedOrderMap } = useSnapshot(favStore)

  const current = useMemo(() => {
    const allowed = Object.values(FavItemsOrder)
    const current = savedOrderMap.get(selectedKey) || FALLBACK_ORDER
    if (allowed.includes(current)) return current
    return FALLBACK_ORDER
  }, [savedOrderMap, selectedKey])
  const { icon, label } = FavItemsOrderConfig[current]

  const onToggle = useMemoizedFn(async (e: MouseEvent) => {
    const currentIndex = ORDER_LIST.findIndex((x) => x === current)
    if (currentIndex === -1) return
    const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + ORDER_LIST.length) % ORDER_LIST.length
    const next = ORDER_LIST[nextIndex]
    favStore.savedOrderMap.set(selectedKey, next)
    await delay(100)
    onRefresh?.()
  })

  return (
    <AntdTooltip title={tooltip}>
      <Button onClick={onToggle}>
        <span className='inline-flex items-center justify-center line-height-[1] gap-4'>
          {icon} {label}
        </span>
      </Button>
    </AntdTooltip>
  )
}
