import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { FavItemExtend } from '$define'
import { styled } from '$libs'
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
import { defineAntMenus } from '$utility/antd'
import { Button, Dropdown } from 'antd'
import { delay, orderBy, shuffle } from 'es-toolkit'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { favStore, type FavSelectedKeyPrefix } from '../store'

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

const clsIconTextWrapper = 'inline-flex items-center justify-center line-height-[0]'

function withDescIcon(label: string) {
  return (
    <span className={clsx(clsIconTextWrapper, 'gap-1px')}>
      {label}
      <IconForDesc {...size(16)} />
    </span>
  )
}
function withAscIcon(label: string) {
  return (
    <span className={clsx(clsIconTextWrapper, 'gap-1px')}>
      {label}
      <IconForAsc {...size(16)} />
    </span>
  )
}

// 需要统一尺寸
const clsIconSize = 'size-16px'

export const FavItemsOrderConfig: Record<FavItemsOrder, { icon: ReactNode; label: ReactNode }> = {
  [FavItemsOrder.Default]: {
    icon: <IconForDefaultOrder className={clsIconSize} />,
    label: '默认顺序',
  },
  [FavItemsOrder.Shuffle]: {
    icon: <IconForShuffle className={clsIconSize} />,
    label: '随机顺序',
  },
  [FavItemsOrder.PubTimeDesc]: {
    icon: <IconForTimestamp className={clsIconSize} />,
    label: withDescIcon('最新投稿'),
  },
  [FavItemsOrder.PubTimeAsc]: {
    icon: <IconForTimestamp className={clsIconSize} />,
    label: withAscIcon('最早投稿'),
  },
  [FavItemsOrder.PlayCountDesc]: {
    icon: <IconForPlayer className={clsIconSize} />,
    label: withDescIcon('最多播放'),
  },
  [FavItemsOrder.CollectCountDesc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withDescIcon('最多收藏'),
  },
  [FavItemsOrder.FavTimeDesc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withDescIcon('最近收藏'),
  },
  [FavItemsOrder.FavTimeAsc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withAscIcon('最早收藏'),
  },
}

const MenuItemsConfig: Record<FavSelectedKeyPrefix, (FavItemsOrder | 'divider')[]> = {
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
  const prefix = selectedKey.split(':')[0] as FavSelectedKeyPrefix
  return MenuItemsConfig[prefix] || Object.values(FavItemsOrder)
}

function useDropdownMenus({
  selectedKey,
  onRefresh,
}: {
  selectedKey: string
  onRefresh?: () => void
}) {
  return useMemo(() => {
    const orders = getMenuItemsFor(selectedKey)
    return defineAntMenus(
      orders.map((x) => {
        // divider
        if (x === 'divider') return { type: 'divider' }
        const { icon, label } = FavItemsOrderConfig[x]
        return {
          key: x,
          icon,
          label,
          async onClick() {
            favStore.savedOrderMap.set(selectedKey, x)
            await delay(100)
            onRefresh?.()
          },
        }
      }),
    )
  }, [selectedKey, onRefresh])
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

const clsMenuRoot = styled.createClass`
  .ant-dropdown &.ant-dropdown-menu .ant-dropdown-menu-item {
    font-size: 13px; // same as Button
    justify-content: flex-start;
    .ant-dropdown-menu-title-content {
      flex-shrink: 0;
    }
  }
`

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

  const dropdownMenuItems = useDropdownMenus({ selectedKey, onRefresh })
  const dropdownStyle: CSSProperties = {
    // width: 'max-content',
    overscrollBehavior: 'contain',
    border: `1px solid ${usePopoverBorderColor()}`,
  }

  const [open, setOpen] = useState(false)

  return (
    <Dropdown
      // open
      open={open}
      onOpenChange={setOpen}
      getPopupContainer={getPopupContainer}
      menu={{
        items: dropdownMenuItems,
        style: dropdownStyle,
        className: clsMenuRoot,
        selectedKeys: [current],
      }}
      placement='bottomRight'
    >
      <Button
        ref={ref}
        onClick={onToggle}
        css={[open && buttonOpenCss]}
        icon={icon}
        className='gap-8px px-16px'
      >
        {label}
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
