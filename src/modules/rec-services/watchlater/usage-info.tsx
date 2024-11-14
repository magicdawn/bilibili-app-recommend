import { SwitchSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { useSettingsSnapshot } from '$modules/settings'
import { toast } from '$utility/toast'
import { Space, Tag } from 'antd'
import { delay } from 'es-toolkit'

export function WatchLaterUsageInfo({ total }: { total: number }) {
  // 2023.12: B站的稍后再看上限提升到1000了
  // 所有这里就不管数量喽
  type TagColor = ComponentProps<typeof Tag>['color']
  const color: TagColor = 'success'
  const title = `共 ${total} 个视频`

  const { shuffleForWatchLater, addSeparatorForWatchLater } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()

  // 切换 添加分割线 设置, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [shuffleForWatchLater, addSeparatorForWatchLater])

  return (
    <Space>
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

      <SwitchSettingItem
        configKey={'shuffleForWatchLater'}
        checkedChildren='随机顺序: 开'
        unCheckedChildren='随机顺序: 关'
        tooltip={<>随机顺序不包括近期添加的视频</>}
      />
    </Space>
  )
}
