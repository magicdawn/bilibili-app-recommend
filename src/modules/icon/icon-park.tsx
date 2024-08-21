import { type Icon } from '@icon-park/react/es/runtime'

import {
  AddTwo,
  Copy,
  DistraughtFace,
  Drag,
  FileCabinet,
  Help,
  Loading,
  PeopleDelete,
  PeopleMinus,
  PeopleSearch,
  Return,
  Star,
  Tips,
} from '@icon-park/react'

const ImportedIcons = {
  DistraughtFace,
  Help,
  Loading,
  Return,
  Tips,
  FileCabinet,
  Star,
  Copy,
  AddTwo,
  PeopleDelete,
  PeopleMinus,
  PeopleSearch,
  Drag,
} satisfies Record<string, Icon>

export type IconName = keyof typeof ImportedIcons

export function IconPark({
  name,
  theme,
  size,
  fill,
  ml,
  mr,
  mt,
  mb,
  ...props
}: { name: IconName; ml?: number; mr?: number; mt?: number; mb?: number } & ComponentProps<Icon>) {
  theme ||= 'outline'
  size ||= 24
  fill ||= 'currentColor'

  const Comp = ImportedIcons[name]
  return (
    <Comp
      {...{ theme, size, fill, ...props }}
      style={{
        fontSize: 0,
        ...(ml ? { marginLeft: ml + 'px' } : {}),
        ...(mr ? { marginRight: mr + 'px' } : {}),
        ...(mt ? { marginTop: mt + 'px' } : {}),
        ...(mb ? { marginBottom: mb + 'px' } : {}),
        ...props.style,
      }}
    />
  )
}
