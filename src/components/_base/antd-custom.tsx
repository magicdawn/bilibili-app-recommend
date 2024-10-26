import { Tooltip } from 'antd'
import type { ComponentProps } from 'react'

export function AntdTooltip(props: ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      {...props}
      overlayStyle={{
        width: 'max-content',
        maxWidth: '50vw',
        ...props.overlayStyle,
      }}
    >
      {props.children}
    </Tooltip>
  )
}
