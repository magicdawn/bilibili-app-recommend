import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import { settings } from '$modules/settings'
import { toast } from '$utility'
import { ETab } from './tab-enum'

import { C } from '$common/emotion-css'
import type { TheCssType } from '$utility/type'
import { cloneElement, type ReactElement } from 'react'
import IconParkOutlineComputer from '~icons/icon-park-outline/computer'
import IconParkOutlineConcern from '~icons/icon-park-outline/concern'
import IconParkOutlineFileCabinet from '~icons/icon-park-outline/file-cabinet'
import IconParkOutlineFire from '~icons/icon-park-outline/fire'
import IconParkOutlineIphone from '~icons/icon-park-outline/iphone'
import IconParkOutlineStar from '~icons/icon-park-outline/star'
import IconParkOutlineTumblr from '~icons/icon-park-outline/tumblr'

export type TabConfigItem = {
  icon: ReactElement
  label: string
  desc: string
  swr?: boolean // stale while revalidate
  anonymousUsage?: boolean // 游客可访问?
}

export const TabConfig: Record<ETab, TabConfigItem> = {
  [ETab.RecommendApp]: {
    icon: <IconParkOutlineIphone css={C.size(18)} />,
    label: '推荐',
    desc: '使用 Bilibili App 端推荐 API',
    anonymousUsage: true,
  },
  [ETab.RecommendPc]: {
    icon: <IconParkOutlineComputer css={C.size(18)} />,
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
    anonymousUsage: true,
  },
  [ETab.KeepFollowOnly]: {
    icon: <IconParkOutlineConcern css={C.size(18)} />,
    label: '已关注',
    desc: '推荐中只保留「已关注」,会很慢',
  },
  [ETab.DynamicFeed]: {
    icon: <IconParkOutlineTumblr css={C.size(16)} />,
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
    anonymousUsage: true,
  },
  [ETab.Watchlater]: {
    icon: <IconParkOutlineFileCabinet css={C.size(15)} />,
    label: '稍后再看',
    desc: '你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序',
    swr: true,
  },
  [ETab.Fav]: {
    icon: <IconParkOutlineStar css={C.size(15)} />,
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置中关闭乱序',
    get swr() {
      return !settings.shuffleForFav
    },
  },
  [ETab.Hot]: {
    icon: <IconParkOutlineFire css={C.size(16)} />,
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
  moreCss,
  size,
  ml,
  mr,
  mt,
  mb,
}: {
  tabKey: ETab
  moreCss?: TheCssType
  size?: number
  ml?: number
  mr?: number
  mt?: number
  mb?: number
}) {
  const { icon } = TabConfig[tabKey]
  const newCssProp = [
    icon.props.css as TheCssType,
    moreCss,
    size && C.size(size),
    ml && C.ml(ml),
    mr && C.mr(mr),
    mt && C.mt(mt),
    mb && C.mb(mb),
  ]
    .flat()
    .filter(Boolean)
  const cloned = cloneElement(icon, { css: newCssProp })
  return cloned
}

export function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}
