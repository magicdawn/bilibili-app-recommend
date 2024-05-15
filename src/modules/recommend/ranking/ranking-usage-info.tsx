import { flexCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { Button, Popover } from 'antd'
import { getPopupContainerFactory } from '../_shared'
import { RANKING_CATEGORIES, RANKING_CATEGORIES_MAP, type CategorySlug } from './category'

export const rankingStore = proxy<{ slug: CategorySlug }>({
  slug: 'all',
})

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
            <div
              css={css`
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 8px 15px;
                max-width: 500px;
              `}
            >
              {RANKING_CATEGORIES.map((c) => {
                const active = c.slug === slug

                return (
                  <Button
                    key={c.slug}
                    css={[
                      flexCenterStyle,
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
                    {c.name}
                  </Button>
                )
              })}
            </div>
          </>
        }
      >
        <Button>{category.name}</Button>
      </Popover>
    </div>
  )
}
