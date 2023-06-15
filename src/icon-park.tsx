import { useIsDarkMode } from '$platform'
import { type Icon } from '@icon-park/react/es/runtime'
import { type ComponentProps } from 'react'

import {
  Close,
  Config,
  DistraughtFace,
  Help,
  Info,
  Loading,
  LoadingThree,
  Return,
  Tips,
} from '@icon-park/react'

const ImportedIcons = {
  Close,
  Config,
  DistraughtFace,
  Help,
  Info,
  Loading,
  LoadingThree,
  Return,
  Tips,
} satisfies Record<string, Icon>

export function IconPark({
  name,
  theme,
  size,
  fill,
  ...props
}: { name: keyof typeof ImportedIcons } & ComponentProps<Icon>) {
  theme ||= 'outline'
  size ||= 24

  const isDarkMode = useIsDarkMode()
  fill ||= isDarkMode ? '#fff' : '#333'

  const Comp = ImportedIcons[name]
  return <Comp {...{ theme, size, fill, ...props }} />
}
