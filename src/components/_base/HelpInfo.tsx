import { uniq } from 'es-toolkit'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import IconParkOutlineTips from '~icons/icon-park-outline/tips'
import { AntdTooltip } from './antd-custom'

const DefaultIconComponent = IconParkOutlineTips

export function HelpInfo({
  children,
  tooltipProps,
  IconComponent,
  className,
  ...restSvgProps
}: {
  children?: ReactNode // tooltip content
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  IconComponent?: ComponentType<SVGProps<SVGSVGElement>>
} & SVGProps<SVGSVGElement>) {
  const classList = useMemo(() => {
    return uniq(
      (className || '')
        .split(/\s+/)
        .map((x) => x.trim())
        .filter(Boolean),
    )
  }, [className])
  const _className = clsx(
    'cursor-pointer',
    !classList.some((x) => x.startsWith('size-')) && 'size-16px',
    !classList.some((x) => x.startsWith('ml-')) && 'ml-4px',
    className,
  )

  IconComponent ??= DefaultIconComponent
  const icon = <IconComponent {...restSvgProps} className={_className} />

  return (
    !!children && (
      <AntdTooltip {...tooltipProps} title={children}>
        {icon}
      </AntdTooltip>
    )
  )
}
