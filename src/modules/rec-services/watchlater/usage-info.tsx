import { explainForFlag } from '$components/ModalSettings/index.shared'
import {
  ButtonSettingItem,
  CheckboxSettingItem,
  SwitchSettingItem,
} from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { IconForAsc, IconForDesc } from '$modules/icon'
import { useSettingsSnapshot } from '$modules/settings'
import toast from '$utility/toast'
import { Space, Tag } from 'antd'
import { delay } from 'es-toolkit'
import { ShuffleSettingsItemFor } from '../_shared'

type TagColor = ComponentProps<typeof Tag>['color']

export function WatchLaterUsageInfo({ total }: { total: number }) {
  // 2023.12: B站的稍后再看上限提升到1000了
  // 所有这里就不管数量喽
  const color: TagColor = 'success'
  const title = `共 ${total} 个视频`

  const { watchlaterUseShuffle, watchlaterAddSeparator, watchlaterNormalOrderSortByAddAtAsc } =
    useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()

  // 切换 添加分割线 设置, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [watchlaterUseShuffle, watchlaterAddSeparator, watchlaterNormalOrderSortByAddAtAsc])

  const switchDisplay = (
    <SwitchSettingItem
      configPath={'watchlaterUseShuffle'}
      checkedChildren='随机顺序: 开'
      unCheckedChildren='随机顺序: 关'
      tooltip={<>随机顺序不包括近期添加的视频</>}
    />
  )
  const checkboxDisplay = (
    <CheckboxSettingItem
      configPath={'watchlaterUseShuffle'}
      label='随机顺序'
      tooltip={
        <>
          {explainForFlag('随机顺序', '默认添加顺序')}
          NOTE: 随机顺序不包括近期添加的视频
        </>
      }
    />
  )
  const btnDisplay = (
    <ShuffleSettingsItemFor
      configPath='watchlaterUseShuffle'
      tooltip={
        <>
          随机顺序不包括近期添加的稍后再看 <br />
          近期: 最近48小时内
        </>
      }
    />
  )

  return (
    <Space size={12}>
      <Tag
        color={color}
        style={{
          marginRight: 0,
          marginTop: 1,
          cursor: 'pointer',
        }}
        title={title}
        onClick={() => {
          toast(`稍后再看: ${title}`)
        }}
      >
        {total}
      </Tag>

      {/* {switchDisplay} */}
      {/* {checkboxDisplay} */}
      {btnDisplay}

      {!watchlaterUseShuffle && (
        <ButtonSettingItem
          configPath='watchlaterNormalOrderSortByAddAtAsc'
          tooltip={
            <>
              最近添加: 按添加时间倒序 <br />
              最早添加: 按添加时间增序 <br />
            </>
          }
          checkedChildren={
            <>
              <IconForAsc {...size(18)} />
              最早添加
            </>
          }
          unCheckedChildren={
            <>
              <IconForDesc {...size(18)} />
              最近添加
            </>
          }
        />
      )}
    </Space>
  )
}
