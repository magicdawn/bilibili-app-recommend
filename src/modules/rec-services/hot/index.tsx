import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { EHotSubTab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import { styled } from '$libs'
import { settings } from '$modules/settings'
import type { AntdMenuItemType } from '$utility/type'
import { proxyWithGmStorage } from '$utility/valtio'
import { Button, Dropdown } from 'antd'
import type { ReactNode } from 'react'
import type { IService } from '../_base'
import { usePopupContainer } from '../_base'
import { PopularGeneralRecService } from './popular-general'
import { PopularWeeklyRecService } from './popular-weekly'
import { RankingRecService } from './ranking'

const ServiceMap = {
  [EHotSubTab.PopularGeneral]: PopularGeneralRecService,
  [EHotSubTab.PopularWeekly]: PopularWeeklyRecService,
  [EHotSubTab.Ranking]: RankingRecService,
} satisfies Record<EHotSubTab, new () => IService>

// 是否是: 换一换
export function isHotTabUsingShuffle(shuffleForPopularWeekly?: boolean) {
  const { subtab } = hotStore
  shuffleForPopularWeekly ??= settings.shuffleForPopularWeekly
  const change = subtab === EHotSubTab.PopularWeekly && shuffleForPopularWeekly
  return change
}

const imgOf = (src: string) => <img src={src} alt='' uno:size='18' />

const HotSubTabConfig = {
  [EHotSubTab.PopularGeneral]: {
    // icon: <IconPark name='Fire' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_popular.png'),
    label: '综合热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    swr: true,
    anonymousUsage: true,
  },
  [EHotSubTab.PopularWeekly]: {
    // icon: <IconPark name='TrendTwo' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_weekly.png'),
    label: '每周必看',
    desc: '每周五晚 18:00 更新',
    anonymousUsage: true,
  },
  [EHotSubTab.Ranking]: {
    // icon: <IconPark name='Ranking' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_rank.png'),
    label: '排行榜',
    desc: '排行榜根据稿件内容质量，近期的数据综合展示，动态更新',
    anonymousUsage: true,
    swr: true,
  },
}

export class HotRecService implements IService {
  subtab: EHotSubTab
  service: IService
  constructor() {
    this.subtab = hotStore.subtab
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
  const { subtab: activeSubtab } = useSnapshot(hotStore)
  const { icon, label } = HotSubTabConfig[activeSubtab]
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer<HTMLButtonElement>()

  const menus: AntdMenuItemType[] = useMemo(
    () =>
      [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking]
        .map((subtab, index) => {
          const config = HotSubTabConfig[subtab]
          const active = subtab === activeSubtab
          return [
            index > 0 && { type: 'divider' as const },
            {
              key: subtab,
              label: (
                <span
                  css={[
                    active &&
                      css`
                        color: ${colorPrimaryValue};
                      `,
                  ]}
                >
                  {config.label}
                </span>
              ),
              icon: config.icon,
              onClick() {
                if (subtab === hotStore.subtab) return
                hotStore.subtab = subtab
                // onRefresh?.(true) // 可以但没必要, 有 skeleton 有 Tab切换 的反馈
                onRefresh?.()
              },
            } satisfies AntdMenuItemType,
          ].filter(Boolean)
        })
        .flat(),
    [activeSubtab],
  )

  return (
    <>
      <Dropdown
        menu={{ items: menus }}
        getPopupContainer={getPopupContainer}
        rootClassName={styled.generateClassName`
          .ant-dropdown-menu-item-divider {
            margin: 2px 0 !important;
          }
        `}
      >
        <Button ref={ref} className='w-114px flex items-center justify-start'>
          {icon} <span className='ml-8px mt-1px'>{label}</span>
        </Button>
      </Dropdown>
      {children}
    </>
  )
}
