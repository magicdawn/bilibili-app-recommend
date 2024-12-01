import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { defineAntMenus, type AntMenuItem } from '$utility/antd'
import { Button, Dropdown, Popover, Space, Tag, Transfer } from 'antd'
import type { TransferDirection } from 'antd/es/transfer'
import { delay } from 'es-toolkit'
import type { Key } from 'react'
import { useSnapshot } from 'valtio'
import { usePopupContainer } from '../_base'
import { dropdownMenuStyle, ShuffleSettingsItemFor } from '../_shared'
import { isFavFolderDefault, isFavFolderPrivate } from './fav-util'
import type { FavFolderBasicService } from './index'
import { favStore } from './store'

export const IconForAll = IconLucideList
export const IconForPrivateFolder = IconLucideFolderLock
export const IconForPublicFolder = IconLucideFolder

export function FavUsageInfo({
  viewingAll,
  allFavFolderServices = [],
}: {
  viewingAll?: boolean
  allFavFolderServices?: FavFolderBasicService[]
}) {
  const { fav } = useSettingsSnapshot()
  const { favFolders, selectedFavFolder, selectedLabel } = useSnapshot(favStore)
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer()

  useMount(() => {
    favStore.updateList()
  })

  // 分割线设置切换, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [fav.useShuffle, fav.addSeparator])

  // #region scope selection dropdown
  const scopeSelectionDropdownMenus: AntMenuItem[] = useMemo(() => {
    return defineAntMenus([
      {
        key: 'all',
        icon: <IconForAll />,
        label: '全部',
        async onClick() {
          favStore.selectedFavFolderId = undefined
          setScopeDropdownOpen(false)
          await delay(100)
          onRefresh?.()
        },
      },
      ...favFolders.map((f) => {
        const isDefault = isFavFolderDefault(f.attr)
        const isPrivate = isFavFolderPrivate(f.attr)
        const icon = isPrivate ? <IconForPrivateFolder /> : <IconForPublicFolder />
        const label = `${f.title} (${f.media_count})`
        return {
          key: `fav-folder:${f.id}`,
          icon,
          label,
          async onClick() {
            favStore.selectedFavFolderId = f.id
            setScopeDropdownOpen(false)
            await delay(100)
            onRefresh?.()
          },
        }
      }),
    ])
  }, [favFolders])
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)
  const dropdownButtonIcon = selectedFavFolder ? (
    isFavFolderPrivate(selectedFavFolder.attr) ? (
      <IconForPrivateFolder />
    ) : (
      <IconForPublicFolder />
    )
  ) : (
    <IconForAll />
  )
  const dropdownButtonLabel = selectedFavFolder
    ? `${selectedLabel} (${selectedFavFolder.media_count})`
    : '全部'
  const scopeSelectionDropdown = (
    <Dropdown
      open={scopeDropdownOpen}
      onOpenChange={setScopeDropdownOpen}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      menu={{
        items: scopeSelectionDropdownMenus,
        style: { ...dropdownMenuStyle, border: `1px solid ${usePopoverBorderColor()}` },
      }}
    >
      <Button
        className='gap-4px'
        css={[scopeDropdownOpen && buttonOpenCss]}
        icon={dropdownButtonIcon}
      >
        {dropdownButtonLabel}
      </Button>
    </Dropdown>
  )
  // #endregion

  return (
    <Space ref={ref} size={10}>
      {/* scope selction */}
      {scopeSelectionDropdown}

      {/* shuffle? */}
      <ShuffleSettingsItemFor configPath={'fav.useShuffle'} />

      {/* config exclude for viewingAll */}
      {viewingAll && (
        <ViewingAllExcludeFolderConfig
          allFavFolderServices={allFavFolderServices}
          getPopupContainer={getPopupContainer}
          onRefresh={onRefresh}
        />
      )}
    </Space>
  )
}

function ViewingAllExcludeFolderConfig({
  allFavFolderServices,
  onRefresh,
  getPopupContainer,
}: {
  allFavFolderServices: FavFolderBasicService[]
  onRefresh?: () => void
  getPopupContainer: () => HTMLElement
}) {
  const { fav } = useSettingsSnapshot()

  const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = useState(false)

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

  return (
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
  )
}
