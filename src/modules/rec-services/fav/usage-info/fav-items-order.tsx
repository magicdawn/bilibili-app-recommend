import { usePopoverBorderColor } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/css-vars'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { FavItemExtend } from '$define'
import {
  IconForAsc,
  IconForDefaultOrder,
  IconForDesc,
  IconForFav,
  IconForPlayer,
  IconForShuffle,
  IconForTimestamp,
} from '$modules/icon'
import { usePopupContainer } from '$modules/rec-services/_base'
import { dropdownMenuStyle } from '$modules/rec-services/_shared'
import { defineAntMenus } from '$utility/antd'
import { Button, Dropdown } from 'antd'
import { delay, orderBy, shuffle } from 'es-toolkit'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { favStore } from '../store'

export enum FavItemsOrder {
  Default = 'default',
  Shuffle = 'shuffle',
  PubTimeDesc = 'pub-time-desc',
  PubTimeAsc = 'pub-time-asc',
  PlayCountDesc = 'play-count-desc', // asc has no real use case
  CollectCountDesc = 'collect-count-desc',

  // fav-folder only
  FavTimeDesc = 'fav-time-desc',
  FavTimeAsc = 'fav-time-asc',
}

const classes = {
  icontextWrapper: 'inline-flex items-center justify-center line-height-[0]',
}

function withDescIcon(label: string) {
  return (
    <span className={clsx(classes.icontextWrapper, 'gap-1px')}>
      {label}
      <IconForDesc {...size(16)} />
    </span>
  )
}
function withAscIcon(label: string) {
  return (
    <span className={clsx(classes.icontextWrapper, 'gap-1px')}>
      {label}
      <IconForAsc {...size(16)} />
    </span>
  )
}

export const FavItemsOrderConfig: Record<FavItemsOrder, { icon: ReactNode; label: ReactNode }> = {
  [FavItemsOrder.Default]: {
    icon: <IconForDefaultOrder {...size(16)} />,
    label: '默认顺序',
  },
  [FavItemsOrder.Shuffle]: {
    icon: <IconForShuffle {...size(16)} />,
    label: '随机顺序',
  },
  [FavItemsOrder.PubTimeDesc]: {
    icon: <IconForTimestamp {...size(16)} />,
    label: withDescIcon('最新投稿'),
  },
  [FavItemsOrder.PubTimeAsc]: {
    icon: <IconForTimestamp {...size(16)} />,
    label: withAscIcon('最早投稿'),
  },
  [FavItemsOrder.PlayCountDesc]: {
    icon: <IconForPlayer {...size(16)} />,
    label: withDescIcon('最多播放'),
  },
  [FavItemsOrder.CollectCountDesc]: {
    icon: <IconForFav {...size(15)} className='mt--1px' />,
    label: withDescIcon('最多收藏'),
  },
  [FavItemsOrder.FavTimeDesc]: {
    icon: <IconForFav {...size(16)} className='mt--1px' />,
    label: withDescIcon('最近收藏'),
  },
  [FavItemsOrder.FavTimeAsc]: {
    icon: <IconForFav {...size(16)} className='mt--1px' />,
    label: withAscIcon('最早收藏'),
  },
}

export type SelectedKeyPrefix = 'fav-folder' | 'fav-collection' | 'all'

const MenuItemsConfig: Record<SelectedKeyPrefix, (FavItemsOrder | 'divider')[]> = {
  'all': [FavItemsOrder.Default, FavItemsOrder.Shuffle],
  'fav-folder': [
    FavItemsOrder.FavTimeDesc,
    FavItemsOrder.PubTimeDesc,
    FavItemsOrder.PlayCountDesc,
    FavItemsOrder.CollectCountDesc,
    'divider',
    FavItemsOrder.FavTimeAsc,
    FavItemsOrder.PubTimeAsc,
    'divider',
    FavItemsOrder.Shuffle,
  ] as const,
  'fav-collection': [
    FavItemsOrder.Default,
    FavItemsOrder.PubTimeDesc,
    FavItemsOrder.PlayCountDesc,
    FavItemsOrder.CollectCountDesc,
    'divider',
    FavItemsOrder.PubTimeAsc,
    'divider',
    FavItemsOrder.Shuffle,
  ] as const,
}

function getMenuItemsFor(selectedKey: string) {
  const prefix = selectedKey.split(':')[0] as SelectedKeyPrefix
  return MenuItemsConfig[prefix] || Object.values(FavItemsOrder)
}

function useDropdownMenus({
  selectedKey,
  onRefresh,
  current,
}: {
  selectedKey: string
  onRefresh?: () => void
  current: FavItemsOrder
}) {
  return useMemo(() => {
    const orders = getMenuItemsFor(selectedKey)
    return defineAntMenus(
      orders.map((x) => {
        // divider
        if (x === 'divider') return { type: 'divider' }
        const { icon, label } = FavItemsOrderConfig[x]
        const active = x === current
        return {
          key: x,
          icon,
          label: active ? (
            <span
              css={css`
                color: ${colorPrimaryValue};
              `}
            >
              {label}
            </span>
          ) : (
            label
          ),
          async onClick() {
            favStore.savedOrderMap.set(selectedKey, x)
            await delay(100)
            onRefresh?.()
          },
        }
      }),
    )
  }, [selectedKey, onRefresh, current])
}

function _getFallbackOrder(selectedKey: string) {
  if (selectedKey.startsWith('fav-folder:')) return FavItemsOrder.FavTimeDesc
  return FavItemsOrder.Default
}

/**
 * current: load then validate
 */
export function getSavedOrder(selectedKey: string, savedOrderMap: Map<string, FavItemsOrder>) {
  const allowed = getMenuItemsFor(selectedKey).filter((x) => x !== 'divider')
  const current = savedOrderMap.get(selectedKey) || _getFallbackOrder(selectedKey)
  if (allowed.includes(current)) return current
  return _getFallbackOrder(selectedKey)
}
export function useSavedOrder(selectedKey: string, savedOrderMap: Map<string, FavItemsOrder>) {
  return useMemo(() => getSavedOrder(selectedKey, savedOrderMap), [savedOrderMap, selectedKey])
}

export function FavItemsOrderSwitcher() {
  const onRefresh = useOnRefreshContext()
  const { selectedKey, savedOrderMap } = useSnapshot(favStore)
  const { ref, getPopupContainer } = usePopupContainer<HTMLButtonElement>()

  const current = useSavedOrder(selectedKey, savedOrderMap)
  const { icon, label } = FavItemsOrderConfig[current]

  const onToggle = useMemoizedFn(async (e: MouseEvent) => {
    const allowed = getMenuItemsFor(selectedKey).filter((x) => x !== 'divider')
    const index = allowed.indexOf(current)
    if (index === -1) return
    const nextIndex = (index + (e.shiftKey ? -1 : 1) + allowed.length) % allowed.length
    const next = allowed[nextIndex]
    favStore.savedOrderMap.set(selectedKey, next)
    await delay(100)
    onRefresh?.()
  })

  const dropdownMenuItems = useDropdownMenus({ selectedKey, onRefresh, current })
  const dropdownStyle: CSSProperties = {
    ...dropdownMenuStyle,
    width: 'max-content',
    border: `1px solid ${usePopoverBorderColor()}`,
    paddingRight: 0,
  }

  return (
    <Dropdown
      // open
      getPopupContainer={getPopupContainer}
      menu={{ items: dropdownMenuItems, style: dropdownStyle }}
      placement='bottomRight'
    >
      <Button ref={ref} onClick={onToggle}>
        <span className={clsx(classes.icontextWrapper, 'gap-4px')}>
          {icon} {label}
        </span>
      </Button>
    </Dropdown>
  )
}

export function handleItemsOrder(items: FavItemExtend[], itemsOrder: FavItemsOrder) {
  if (itemsOrder === FavItemsOrder.Default) {
    return items
  }
  if (itemsOrder === FavItemsOrder.Shuffle) {
    return shuffle(items)
  }

  // pub time
  if (itemsOrder === FavItemsOrder.PubTimeDesc || itemsOrder === FavItemsOrder.PubTimeAsc) {
    const order = itemsOrder === FavItemsOrder.PubTimeDesc ? 'desc' : 'asc'
    return orderBy(items, [(x) => x.pubtime], [order])
  }

  // fav time: fav-folder only!
  if (
    (itemsOrder === FavItemsOrder.FavTimeDesc || itemsOrder === FavItemsOrder.FavTimeAsc) &&
    items.every((x) => x.from === 'fav-folder')
  ) {
    const order = itemsOrder === FavItemsOrder.FavTimeDesc ? 'desc' : 'asc'
    return orderBy(items, [(x) => x.fav_time], [order])
  }

  // count
  if (itemsOrder === FavItemsOrder.PlayCountDesc) {
    return orderBy(items, [(x) => x.cnt_info.play], ['desc'])
  }
  if (itemsOrder === FavItemsOrder.CollectCountDesc) {
    return orderBy(items, [(x) => x.cnt_info.collect], ['desc'])
  }

  return items
}
