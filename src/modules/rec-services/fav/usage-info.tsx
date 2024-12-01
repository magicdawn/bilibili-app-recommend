import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { Popover, Space, Tag, Transfer } from 'antd'
import type { TransferDirection } from 'antd/es/transfer'
import { delay } from 'es-toolkit'
import type { Key } from 'react'
import { usePopupContainer } from '../_base'
import { ShuffleSettingsItemFor } from '../_shared'
import type { FavFolderService } from './index'

export function FavUsageInfo({
  allFavFolderServices,
}: {
  allFavFolderServices: FavFolderService[]
}) {
  const { fav } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()
  const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = useState(false)

  // 分割线设置切换, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [fav.useShuffle, fav.addSeparator])

  const handleChange = useMemoizedFn(
    (newTargetKeys: Key[], direction: TransferDirection, moveKeys: Key[]) => {
      setExcludeFavFolderIdsChanged(true)
      settings.fav.excludedFolderIds = newTargetKeys.map((k) => k.toString())
    },
  )

  // may contains legacy ids, so not `allFavFolderServices.length - excludeFavFolderIds.length`
  const foldersCount = useMemo(
    () =>
      allFavFolderServices.filter((x) => !fav.excludedFolderIds.includes(x.entry.id.toString()))
        .length,
    [allFavFolderServices, fav.excludedFolderIds],
  )

  const videosCount = useMemo(() => {
    return allFavFolderServices
      .filter((s) => !fav.excludedFolderIds.includes(s.entry.id.toString()))
      .reduce((count, s) => count + s.entry.media_count, 0)
  }, [allFavFolderServices, fav.excludedFolderIds])

  const onPopupOpenChange = useMemoizedFn((open: boolean) => {
    // when open
    if (open) {
      setExcludeFavFolderIdsChanged(false)
    }

    // when close
    else {
      if (excludeFavFolderIdsChanged) {
        onRefresh?.()
      }
    }
  })

  const { ref, getPopupContainer } = usePopupContainer()

  // const menus: AntMenuItem[] = useMemo(() => {
  //   //
  // }, [])

  return (
    <Space ref={ref}>
      <Popover
        getTooltipContainer={getPopupContainer}
        trigger={'click'}
        placement='bottom'
        onOpenChange={onPopupOpenChange}
        getPopupContainer={(el) => el.parentElement || document.body}
        content={
          <>
            <Transfer
              dataSource={allFavFolderServices}
              rowKey={(row) => row.entry.id.toString()}
              titles={['收藏夹', '忽略']}
              targetKeys={fav.excludedFolderIds}
              onChange={handleChange}
              render={(item) => item.entry.title}
              oneWay
              style={{ marginBottom: 10 }}
            />
          </>
        }
      >
        <Tag
          color='success'
          css={css`
            cursor: pointer;
            font-size: 12px;
          `}
        >
          收藏夹({foldersCount}) 收藏({videosCount})
        </Tag>
      </Popover>

      {/* <SwitchSettingItem
        configPath={'shuffleForFav'}
        checkedChildren='随机顺序: 开'
        unCheckedChildren='随机顺序: 关'
      /> */}
      <ShuffleSettingsItemFor configPath={'fav.useShuffle'} />
    </Space>
  )
}
