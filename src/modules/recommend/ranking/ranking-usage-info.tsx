import { flexCenterStyle } from '$common/emotion-css'
import { borderColorValue, colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { Button, Popover } from 'antd'
import { getPopupContainerFactory } from '../_shared'
import {
  RANKING_CATEGORIES_GROUPDED,
  RANKING_CATEGORIES_MAP,
  type Category,
  type CategorySlug,
} from './category'

export const rankingStore = proxy<{ slug: CategorySlug }>({
  slug: 'all',
})

const S = {
  btn: css`
    ${flexCenterStyle}
    >span {
      display: inline-block;
      margin-top: 1px;
    }
  `,
}

export function RankingUsageInfo() {
  const ref = useRef<HTMLDivElement>(null)
  const getPopupContainer = useMemo(() => getPopupContainerFactory(ref), [])

  const [open, setOpen] = useState(false)
  const hide = useCallback(() => setOpen(false), [])
  const onOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const { slug } = useSnapshot(rankingStore)
  const category = useMemo(() => RANKING_CATEGORIES_MAP[slug], [slug])

  const onRefresh = useOnRefreshContext()

  const renderCategoryList = (list: Category[], label: string) => {
    return (
      <div
        css={css`
          max-width: 500px;

          margin-top: 8px;
          border-top: 1px solid ${borderColorValue};
          padding-top: 8px;

          &:first-child {
            margin-top: 0;
            border-top: none;
            padding-top: 0;
          }
        `}
      >
        <p
          css={css`
            margin-bottom: 5px;
            margin-left: 2px;
          `}
        >
          {label}
        </p>
        <div
          className='grid'
          css={css`
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px 15px;
          `}
        >
          {list.map((c) => {
            const active = c.slug === slug
            return (
              <Button
                key={c.slug}
                css={[
                  S.btn,
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
        content={
          <>
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.normal, '视频')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.cinema, '影视')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.bangumi, '番剧')}
          </>
        }
      >
        <Button css={S.btn}>{category.name}</Button>
      </Popover>
    </div>
  )
}
