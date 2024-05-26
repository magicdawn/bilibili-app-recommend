import type { IconName } from '$modules/icon/icon-park'
import { IconPark } from '$modules/icon/icon-park'
import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import { settings } from '$modules/settings'
import { toast } from '$utility'
import type { Icon } from '@icon-park/react/es/runtime'
import { ETab } from './tab-enum'

export type TabConfigItem = {
  icon: IconName
  iconProps?: ComponentProps<Icon>
  label: string
  desc: string
  swr?: boolean // stale while revalidate
  anonymousUsage?: boolean // 游客可访问?
}

export const TabConfig: Record<ETab, TabConfigItem> = {
  [ETab.RecommendApp]: {
    icon: 'Iphone',
    label: '推荐',
    desc: '使用 Bilibili App 端推荐 API',
    anonymousUsage: true,
  },
  [ETab.RecommendPc]: {
    icon: 'Computer',
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
    anonymousUsage: true,
  },
  [ETab.KeepFollowOnly]: {
    icon: 'Concern',
    label: '已关注',
    desc: '推荐中只保留「已关注」,会很慢',
  },
  [ETab.DynamicFeed]: {
    icon: 'Tumblr',
    iconProps: { size: 16 },
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
    anonymousUsage: true,
  },
  [ETab.Watchlater]: {
    icon: 'FileCabinet',
    iconProps: { size: 15 },
    label: '稍后再看',
    desc: '你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序',
    swr: true,
  },
  [ETab.Fav]: {
    icon: 'Star',
    iconProps: { size: 15 },
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置中关闭乱序',
    get swr() {
      return !settings.shuffleForFav
    },
  },
  [ETab.Hot]: {
    icon: 'Fire',
    iconProps: { size: 16 },
    label: '热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    anonymousUsage: true,
    get swr() {
      return !isHotTabUsingShuffle()
    },
  },
}

export function TabIcon({
  tabKey,
  ...restProps
}: {
  tabKey: ETab
} & Omit<ComponentProps<typeof IconPark>, 'name'>) {
  const { icon, iconProps } = TabConfig[tabKey]
  return (
    <IconPark
      {...{
        size: 18,
        ...iconProps,
        ...restProps,
      }}
      name={icon}
    />
  )
}

export function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}
