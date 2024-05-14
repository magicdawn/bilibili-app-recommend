import { flexCenterStyle } from '$common/emotion-css'
import { Button, Popover } from 'antd'
import { getPopupContainerFactory } from '../_shared'
import { RANKING_CATEGORIES } from './category'

export function RankingUsageInfo() {
  const ref = useRef<HTMLDivElement>(null)
  const getPopupContainer = useMemo(() => getPopupContainerFactory(ref), [])

  const [open, setOpen] = useState(false)

  const hide = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <div ref={ref}>
      <Popover
        arrow={false}
        open={open}
        onOpenChange={handleOpenChange}
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
                return (
                  <Button
                    css={[flexCenterStyle, css``]}
                    onClick={(e) => {
                      hide()
                      // TODO: link to category
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
        <Button>全站</Button>
      </Popover>
    </div>
  )
}
