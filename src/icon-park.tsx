import { useIsDarkMode } from '$platform'
import { type Icon } from '@icon-park/react/lib/runtime'
import { ComponentProps } from 'react'

// icons
import Close from '@icon-park/react/lib/icons/Close'
import Config from '@icon-park/react/lib/icons/Config'
import DistraughtFace from '@icon-park/react/lib/icons/DistraughtFace'
import Info from '@icon-park/react/lib/icons/Info'
import Loading from '@icon-park/react/lib/icons/Loading'
import LoadingThree from '@icon-park/react/lib/icons/LoadingThree'
import Return from '@icon-park/react/lib/icons/Return'

const ImportedIcons = {
  Close,
  Config,
  DistraughtFace,
  Return,
  Loading,
  LoadingThree,
  Info,
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
