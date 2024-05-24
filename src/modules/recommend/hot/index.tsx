import { antdCustomCss } from '$common/emotion-css'
import { proxyWithGmStorage } from '$common/hooks/proxyWithLocalStorage'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { EHotSubTab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import { IconPark } from '$icon-park'
import { settings } from '$modules/settings'
import type { AntdMenuItemType } from '$utility/type'
import { Button, Dropdown } from 'antd'
import type { ReactNode } from 'react'
import type { IService } from '../base'
import { PopularGeneralService } from './popular-general'
import { PopularWeeklyService } from './popular-weekly'
import { RankingService } from './ranking/ranking-service'

const ServiceMap = {
  [EHotSubTab.PopularGeneral]: PopularGeneralService,
  [EHotSubTab.PopularWeekly]: PopularWeeklyService,
  [EHotSubTab.Ranking]: RankingService,
} satisfies Record<EHotSubTab, new () => IService>

// 是否是: 换一换
export function isHotTabUsingShuffle(shuffleForPopularWeekly?: boolean) {
  const { subtab } = hotStore
  shuffleForPopularWeekly ??= settings.shuffleForPopularWeekly
  const change = subtab === EHotSubTab.PopularWeekly && shuffleForPopularWeekly
  return change
}

const HotSubTabConfig = {
  [EHotSubTab.PopularGeneral]: {
    icon: <IconPark name='Fire' size={16} />,
    label: '综合热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    swr: true,
    anonymousUsage: true,
  },
  [EHotSubTab.PopularWeekly]: {
    icon: <IconPark name='TrendTwo' size={15} />,
    label: '每周必看',
    desc: '每周五晚 18:00 更新',
    anonymousUsage: true,
  },
  [EHotSubTab.Ranking]: {
    icon: <IconPark name='Ranking' size={15} />,
    label: '排行榜',
    desc: '排行榜根据稿件内容质量，近期的数据综合展示，动态更新',
    anonymousUsage: true,
    swr: true,
  },
}

export class HotRecService implements IService {
  service: IService
  constructor() {
    this.service = new ServiceMap[hotStore.subtab]()
  }

  get hasMore() {
    return this.service.hasMore
  }

  loadMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined> {
    return this.service.loadMore(abortSignal)
  }

  get usageInfo() {
    return <HotUsageInfo>{this.service.usageInfo}</HotUsageInfo>
  }
}

export const hotStore = await proxyWithGmStorage({ subtab: EHotSubTab.PopularGeneral }, 'hot-store')

// if not valid, use default
if (!Object.values(EHotSubTab).includes(hotStore.subtab)) {
  hotStore.subtab = EHotSubTab.PopularGeneral
}

function HotUsageInfo({ children }: { children?: ReactNode }) {
  const { subtab } = useSnapshot(hotStore)
  const { icon, label } = HotSubTabConfig[subtab]
  const onRefresh = useOnRefreshContext()

  const menus: AntdMenuItemType[] = useMemo(
    () =>
      [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking].map((subtab) => {
        const config = HotSubTabConfig[subtab]
        return {
          key: subtab,
          label: config.label,
          icon: config.icon,
          onClick() {
            hotStore.subtab = subtab
            onRefresh?.()
          },
        }
      }),
    [],
  )

  return (
    <>
      <Dropdown menu={{ items: menus }}>
        <Button css={antdCustomCss.button} className='w-110px'>
          {icon} <span className='ml-8px'>{label}</span>
        </Button>
      </Dropdown>
      {children}
    </>
  )
}
