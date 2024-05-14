import { IconPark, type IconName } from '$icon-park'
import { toast } from '$utility/toast'
import { type Icon } from '@icon-park/react/es/runtime'

export enum ETabType {
  RecommendApp = 'recommend-app',
  RecommendPc = 'recommend-pc',
  KeepFollowOnly = 'keep-follow-only',
  DynamicFeed = 'dynamic-feed',
  Watchlater = 'watchlater',
  Fav = 'fav',
  PopularGeneral = 'popular-general',
  PopularWeekly = 'popular-weekly',
  Ranking = 'ranking',
}

export type TabConfigItem = {
  icon: IconName
  iconProps?: ComponentProps<Icon>
  label: string
  desc: string
  swr?: boolean // stale while revalidate
  anonymousUsage?: boolean // 游客可访问?
}

export const TabConfig: Record<ETabType, TabConfigItem> = {
  [ETabType.RecommendApp]: {
    icon: 'Iphone',
    label: '推荐',
    desc: '使用 Bilibili App 端推荐 API',
    anonymousUsage: true,
  },
  [ETabType.RecommendPc]: {
    icon: 'Computer',
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
    anonymousUsage: true,
  },
  [ETabType.KeepFollowOnly]: {
    icon: 'Concern',
    label: '已关注',
    desc: '推荐中只保留「已关注」,会很慢',
  },
  [ETabType.DynamicFeed]: {
    icon: 'Tumblr',
    iconProps: { size: 16 },
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
    anonymousUsage: true,
  },
  [ETabType.Watchlater]: {
    icon: 'FileCabinet',
    iconProps: { size: 15 },
    label: '稍后再看',
    desc: '你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序',
    swr: true,
  },
  [ETabType.Fav]: {
    icon: 'Star',
    iconProps: { size: 15 },
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置中关闭乱序',
  },
  [ETabType.PopularGeneral]: {
    icon: 'Fire',
    iconProps: { size: 16 },
    label: '综合热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    swr: true,
    anonymousUsage: true,
  },
  [ETabType.PopularWeekly]: {
    icon: 'TrendTwo',
    iconProps: { size: 15 },
    label: '每周必看',
    desc: '每周五晚 18:00 更新',
    anonymousUsage: true,
  },
  [ETabType.Ranking]: {
    icon: 'TrendTwo',
    iconProps: { size: 15 },
    label: '排行榜',
    desc: '排行榜根据稿件内容质量，近期的数据综合展示，动态更新',
    anonymousUsage: true,
    swr: true,
  },
}

export function TabIcon({
  tabKey,
  ...restProps
}: {
  tabKey: ETabType
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

export const TabKeys = Object.values(ETabType)

export function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}
