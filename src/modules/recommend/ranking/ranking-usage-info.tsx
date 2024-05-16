import { antdCss, flexVerticalCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/piece'
import { Button, Popover } from 'antd'
import { usePopupContainer } from '../_shared'
import {
  RANKING_CATEGORIES_GROUPDED,
  RANKING_CATEGORIES_MAP,
  type Category,
  type CategorySlug,
} from './category'

export const rankingStore = proxy<{ slug: CategorySlug }>({
  slug: 'all',
})

export function RankingUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()

  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const onOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const { slug } = useSnapshot(rankingStore)
  const category = useMemo(() => RANKING_CATEGORIES_MAP[slug], [slug])

  const onRefresh = useOnRefreshContext()

  const renderCategoryList = (
    list: Category[],
    key: keyof typeof RANKING_CATEGORIES_GROUPDED,
    label: string,
  ) => {
    return (
      <div
        css={css`
          max-width: 500px;
          margin-top: 12px;
          padding-top: 5px;
          &:first-child {
            margin-top: 0;
            padding-top: 0;
          }
        `}
      >
        <p
          css={[
            flexVerticalCenterStyle,
            css`
              margin-bottom: 8px;
              color: #fff;
              background-color: ${colorPrimaryValue};
              padding: 5px 0;
              padding-left: 6px;
              border-radius: 5px;
            `,
          ]}
        >
          {label}
          {key !== 'normal' && <HelpInfo>不能提供预览</HelpInfo>}
        </p>
        <div
          className='grid'
          css={css`
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px 12px;
            padding-inline: 2px;
          `}
        >
          {list.map((c) => {
            const active = c.slug === slug
            return (
              <Button
                key={c.slug}
                css={[
                  antdCss.btn,
                  active &&
                    css`
                      border-color: ${colorPrimaryValue};
                      color: ${colorPrimaryValue};
                    `,
                ]}
                onClick={(e) => {
                  hide()
                  rankingStore.slug = c.slug as CategorySlug
                  onRefresh?.()
                }}
              >
                <span>{c.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <Popover
        arrow={false}
        open={open}
        onOpenChange={onOpenChange}
        placement='bottomLeft'
        getPopupContainer={getPopupContainer}
        // overlayInnerStyle={{ border: `1px solid ${colorPrimaryValue}` }}
        content={
          <>
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.normal, 'normal', '视频')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.cinema, 'cinema', '影视')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.bangumi, 'bangumi', '番剧')}
          </>
        }
      >
        <Button css={antdCss.btn}>{category.name}</Button>
      </Popover>
    </div>
  )
}
