import { ButtonSettingItem } from '$components/ModalSettings/setting-item'
import type { BooleanSettingsKey } from '$modules/settings'
import CuidaShuffleOutline from '~icons/cuida/shuffle-outline'

export function ShuffleSettingsItemFor({ configKey }: { configKey: BooleanSettingsKey }) {
  return (
    <ButtonSettingItem
      configKey={configKey}
      checkedChildren={
        <>
          <CuidaShuffleOutline className='mr-2px' />
          随机顺序
        </>
      }
      unCheckedChildren={
        <>
          <IconMdiShuffleDisabled className='mr-2px' />
          默认顺序
        </>
      }
    />
  )
}
