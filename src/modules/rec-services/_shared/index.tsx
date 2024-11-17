import { ButtonSettingItem } from '$components/ModalSettings/setting-item'
import type { BooleanSettingsKey } from '$modules/settings'
import type { ComponentProps } from 'react'
import CuidaShuffleOutline from '~icons/cuida/shuffle-outline'

export function ShuffleSettingsItemFor({
  configKey,
  ...rest
}: { configKey: BooleanSettingsKey } & Omit<
  ComponentProps<typeof ButtonSettingItem>,
  'configKey' | 'checkedChildren' | 'unCheckedChildren'
>) {
  return (
    <ButtonSettingItem
      {...rest}
      configKey={configKey}
      checkedChildren={
        <>
          <CuidaShuffleOutline {...size(18)} className='mr-2px' />
          随机顺序
        </>
      }
      unCheckedChildren={
        <>
          <IconMdiShuffleDisabled {...size(18)} className='mr-2px position-relative top-[-1px]' />
          默认顺序
        </>
      }
    />
  )
}
