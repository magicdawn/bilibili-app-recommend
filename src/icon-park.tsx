import { type Icon } from '@icon-park/react/es/runtime'
import { type ComponentProps } from 'react'

import {
  Close,
  Computer,
  Config,
  DistraughtFace,
  Help,
  Info,
  Iphone,
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
  Computer,
  Iphone,
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
  fill ||= 'currentColor'

  const Comp = ImportedIcons[name]
  return (
    <Comp
      {...{ theme, size, fill, ...props }}
      style={{
        fontSize: 0,
        ...props.style,
      }}
    />
  )
}
