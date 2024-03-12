import { type Icon } from '@icon-park/react/es/runtime'

import {
  AddTwo,
  CheckSmall,
  Close,
  Computer,
  Concern,
  Config,
  Copy,
  Delete,
  DislikeTwo,
  DistraughtFace,
  Drag,
  EfferentFour,
  FileCabinet,
  Fire,
  Help,
  Info,
  Iphone,
  Loading,
  LoadingThree,
  PeopleDelete,
  PeopleMinus,
  PeopleSearch,
  PlayTwo,
  Return,
  Split,
  Star,
  Tips,
  TrendTwo,
  Tumblr,
  Unlike,
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
  Concern,
  Tumblr,
  FileCabinet,
  Star,
  EfferentFour,
  Copy,
  DislikeTwo,
  Unlike,
  PlayTwo,
  AddTwo,
  Delete,
  PeopleDelete,
  PeopleMinus,
  PeopleSearch,
  Split,
  Fire,
  TrendTwo,
  Drag,
  CheckSmall,
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
