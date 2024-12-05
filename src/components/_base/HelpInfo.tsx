import type { ComponentType, ReactNode, SVGProps } from 'react'
import IconParkOutlineTips from '~icons/icon-park-outline/tips'
import { AntdTooltip } from './antd-custom'

const DefaultIconComponent = IconParkOutlineTips

export function HelpInfo({
  children,
  tooltipProps,
  IconComponent,
  ...restSvgProps
}: {
  children?: ReactNode // tooltip content
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  IconComponent?: ComponentType<SVGProps<SVGSVGElement>>
} & SVGProps<SVGSVGElement>) {
  IconComponent ??= DefaultIconComponent

  const icon = (
    <IconComponent
      {...restSvgProps}
      className={clsx('size-16px cursor-pointer ml-4px', restSvgProps.className)}
    />
  )

  return (
    !!children && (
      <AntdTooltip {...tooltipProps} title={children}>
        {icon}
      </AntdTooltip>
    )
  )
}
