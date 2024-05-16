import { flexCenterStyle, flexVerticalCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { RankingItemExtended } from '$define'
import { RANKING_CATEGORIES_MAP } from '$modules/recommend/ranking/category'
import PhCrownFill from '~icons/ph/crown-fill'
import { VideoCardActionStyle, useTooltip } from './child-components/VideoCardActions'

export function ChargeTag() {
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
        ></path>
      </svg>
      充电专属
    </div>
  )
}

export function RankingNumMark({ item }: { item: RankingItemExtended }) {
  const tooltip = `「${RANKING_CATEGORIES_MAP[item.slug].name}」排行第 ${item.rankingNo} 名`
  const { triggerRef, tooltipEl } = useTooltip({ inlinePosition: 'left', tooltip })
  const hasMedal = item.rankingNo <= 3

  return (
    <div
      ref={triggerRef}
      css={[
        VideoCardActionStyle.top('left'),
        flexCenterStyle,
        css`
          color: #fff;
          border-radius: 50%;
          margin-left: 4px;
          white-space: nowrap;
          width: 28px;
          height: 28px;
          /* cursor: help; */
          /* https://color.adobe.com/zh/metals-color-theme-18770781/ */
          background-color: ${item.rankingNo === 1
            ? '#FFD700'
            : item.rankingNo === 2
              ? '#C0C0C0'
              : item.rankingNo === 3
                ? '#B36700'
                : colorPrimaryValue};
        `,
      ]}
    >
      {hasMedal ? <PhCrownFill /> : item.rankingNo}
      {tooltipEl}
    </div>
  )
}
