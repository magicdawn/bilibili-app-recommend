import { ButtonSettingItem } from '$components/ModalSettings/setting-item'
import type { BooleanSettingsPath } from '$modules/settings'
import type { ComponentProps, CSSProperties } from 'react'
import CuidaShuffleOutline from '~icons/cuida/shuffle-outline'

export function ShuffleSettingsItemFor({
  configPath,
  ...rest
}: { configPath: BooleanSettingsPath } & Omit<
  ComponentProps<typeof ButtonSettingItem>,
  'configPath' | 'checkedChildren' | 'unCheckedChildren'
>) {
  return (
    <ButtonSettingItem
      {...rest}
      configPath={configPath}
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

export const dropdownMenuStyle: CSSProperties = {
  overscrollBehavior: 'contain',
  maxHeight: '60vh',
  overflowY: 'scroll',
  scrollbarWidth: 'thin',
  paddingRight: '12px',
}
