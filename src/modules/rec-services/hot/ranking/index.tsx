import { REQUEST_FAIL_MSG } from '$common'
import { flexVerticalCenterStyle } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/_base/HelpInfo'
import { colorPrimaryValue } from '$components/css-vars'
import type { RankingItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { usePopupContainer } from '$modules/rec-services/_base'
import { isWebApiSuccess, request } from '$request'
import { toast } from '$utility'
import { proxyWithGmStorage } from '$utility/valtio'
import { Button, Popover } from 'antd'
import { useSnapshot } from 'valtio'
import { QueueStrategy, type IService } from '../../_base'
import {
  RANKING_CATEGORIES,
  RANKING_CATEGORIES_GROUPDED,
  RANKING_CATEGORIES_MAP,
  getRequestUrl,
  type Category,
  type CategorySlug,
} from './category'
import type { RankingItem } from './types'

export class RankingRecService implements IService {
  loaded = false
  slug: CategorySlug
  qs = new QueueStrategy<RankingItemExtend>(20)

  constructor(slug?: CategorySlug) {
    this.slug = slug || rankingStore.slug
  }

  get hasMore() {
    if (!this.loaded) return true
    return !!this.qs.bufferQueue.length
  }

  async loadMore(abortSignal: AbortSignal): Promise<RankingItemExtend[] | undefined> {
    if (!this.hasMore) return

    if (!this.loaded) {
      const c = RANKING_CATEGORIES_MAP[this.slug]
      const url = getRequestUrl(c)
      const res = await request.get(url, { signal: abortSignal })
      const json = res.data
      this.loaded = true

      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG)
        return
      }

      const list: RankingItem[] = json?.data?.list || json?.result?.list || []
      const items: RankingItemExtend[] = list.map((item, index) => {
        return {
          ...item,
          api: EApiType.Ranking,
          uniqId: crypto.randomUUID(),
          rankingNo: index + 1,
          slug: this.slug,
          categoryType: c.type,
        }
      })

      this.qs.bufferQueue = items
    }

    return this.qs.slicePagesFromQueue()
  }

  get usageInfo() {
    return <RankingUsageInfo />
  }
}

export const rankingStore = await proxyWithGmStorage<{ slug: CategorySlug }>(
  { slug: 'all' },
  'ranking-store',
)

// valid check
if (!RANKING_CATEGORIES.map((x) => x.slug).includes(rankingStore.slug)) {
  rankingStore.slug = 'all'
}

function RankingUsageInfo() {
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
          margin-top: 15px;
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
        overlayInnerStyle={{ border: `1px solid ${colorPrimaryValue}` }}
        content={
          <>
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.normal, 'normal', '视频')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.cinema, 'cinema', '影视')}
            {renderCategoryList(RANKING_CATEGORIES_GROUPDED.bangumi, 'bangumi', '番剧')}
          </>
        }
      >
        <Button>{category.name}</Button>
      </Popover>
    </div>
  )
}
