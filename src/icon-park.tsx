import { type Icon } from '@icon-park/react/es/runtime'
import { type ComponentProps } from 'react'

import {
  AddTwo,
  Close,
  Computer,
  Concern,
  Config,
  Copy,
  Delete,
  DislikeTwo,
  DistraughtFace,
  EfferentFour,
  FileCabinet,
  Help,
  Info,
  Iphone,
  Loading,
  LoadingThree,
  PeopleDelete,
  PeopleMinus,
  PlayTwo,
  Return,
  Star,
  Tips,
  Tumblr,
  Unlike,
} from '@icon-park/react'

export const ImportedIcons = {
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
} satisfies Record<string, Icon>

export type IconName = keyof typeof ImportedIcons

export function IconPark({
  name,
  theme,
  size,
  fill,
  ...props
}: { name: IconName } & ComponentProps<Icon>) {
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
