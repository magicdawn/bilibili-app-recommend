import { flexCenterStyle, flexVerticalCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { RankingItemExtend, RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import type { NormalRankingItem } from '$modules/rec-services/hot/ranking/api.normal-category'
import {
  RANKING_CATEGORIES_MAP,
  isNormalRankingItem,
} from '$modules/rec-services/hot/ranking/category'
import { Dropdown } from 'antd'
import IconParkOutlineMore from '~icons/icon-park-outline/more'
import PhCrownFill from '~icons/ph/crown-fill'
import { VideoCardActionStyle, useTooltip } from './child-components/VideoCardActions'

export const CHARGE_ONLY_TEXT = '充电专属'

export function getHasChargeOnlyTag(item: RecItemType, recommendReason?: string) {
  if (item.api !== EApiType.Dynamic) return false
  recommendReason ||= item.modules?.module_dynamic?.major?.archive?.badge?.text as string
  return recommendReason === CHARGE_ONLY_TEXT
}

export function ChargeOnlyTag() {
  return (
    <div
      css={[
        VideoCardActionStyle.top('left'),
        flexVerticalCenterStyle,
        css`
          padding: 1px 6px 1px 4px;
          font-size: 10px;
          color: #fff;
          text-align: center;
          line-height: 17px;
          border-radius: 2px;
          margin-left: 4px;
          white-space: nowrap;
          background-color: #f69;
          background-color: ${colorPrimaryValue};
        `,
      ]}
    >
      <svg
        width='16'
        height='17'
        viewBox='0 0 16 17'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M5.00014 14.9839C4.94522 15.1219 5.12392 15.2322 5.22268 15.1212L11.5561 8.00214C11.7084 7.83093 11.5869 7.56014 11.3578 7.56014H9.13662L11.6019 3.57178C11.7112 3.39489 11.584 3.16666 11.376 3.16666H7.4475C7.22576 3.16666 7.02737 3.30444 6.94992 3.51221L4.68362 9.59189C4.61894 9.76539 4.74725 9.95014 4.93241 9.95014H7.00268L5.00014 14.9839Z'
          fill='white'
        />
      </svg>
      {CHARGE_ONLY_TEXT}
    </div>
  )
}

/* https://color.adobe.com/zh/metals-color-theme-18770781/ */
function getColor(no: number) {
  return no === 1
    ? // gold
      '#FFD700'
    : no === 2
      ? '#C0C0C0'
      : no === 3
        ? '#B36700'
        : colorPrimaryValue
}

export function RankingNumMark({ item }: { item: RankingItemExtend }) {
  const category = RANKING_CATEGORIES_MAP[item.slug]

  const hasMedal = item.rankingNo <= 3
  const medalSymbols = ['🥇', '🥈', '🥉'] // emoji builtin, 可以换, 但是丑
  const medalIcon = <PhCrownFill />

  let hasOthers = false
  let others: NormalRankingItem[] = []
  if (isNormalRankingItem(item) && item.others?.length) {
    hasOthers = true
    others = item.others
  }

  const tooltip = `「${category.name}」排行第 ${item.rankingNo} 名`
  const { triggerRef, tooltipEl } = useTooltip({
    inlinePosition: 'left',
    tooltip,
    tooltipOffset: 2,
  })

  const roundButtonCss = [
    flexCenterStyle,
    css`
      position: relative;
      color: #fff;
      border-radius: 50%;
      white-space: nowrap;
      width: 28px;
      height: 28px;
      background-color: ${getColor(item.rankingNo)};
    `,
  ]

  return (
    <div css={VideoCardActionStyle.topContainer('left')}>
      <div ref={triggerRef} css={roundButtonCss}>
        {hasMedal ? medalIcon : <span style={{ marginLeft: -1 }}>{item.rankingNo}</span>}
        {tooltipEl}
      </div>

      {hasOthers && (
        <Dropdown
          placement='bottomLeft'
          menu={{
            items: [
              {
                type: 'group',
                label: '「其他上榜视频」',
                children: others.map((x) => {
                  return {
                    key: x.bvid,
                    label: x.title,
                    onClick() {
                      GM.openInTab(new URL(`/video/${x.bvid}`, location.href).href, {
                        active: true,
                        insert: true,
                        setParent: true,
                      })
                    },
                  }
                }),
              },
            ],
          }}
        >
          <div css={roundButtonCss}>
            <IconParkOutlineMore />
          </div>
        </Dropdown>
      )}
    </div>
  )
}
