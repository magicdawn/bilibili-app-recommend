import { css } from '@emotion/react'
import { useHover } from 'ahooks'
import type { ComponentProps, ReactNode } from 'react'

const baseZ = 3

export type InlinePosition = 'left' | 'right'

const S = {
  top: (inlinePosition: InlinePosition) => css`
    position: absolute;
    top: 8px;
    ${inlinePosition}: 8px;
    transform: translateZ(0);
    z-index: ${baseZ + 2};

    display: flex;
    flex-direction: ${inlinePosition === 'left' ? 'row' : 'row-reverse'};
    column-gap: 5px;
  `,

  button: (visible: boolean) => css`
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    background-color: rgba(33, 33, 33, 0.7);

    display: ${visible ? 'inline-flex' : 'none'};
    align-items: center;
    justify-content: center;

    /* svg-icon */
    svg {
      pointer-events: none;
      user-select: none;
      color: #fff;
    }
  `,

  tooltip: (inlinePosition: InlinePosition) => css`
    position: absolute;
    bottom: -6px;
    ${inlinePosition}: -5px;

    pointer-events: none;
    user-select: none;
    transform: translateY(100%);
    font-size: 12px;
    color: #fff;
    border-radius: 4px;
    line-height: 18px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.8);
    white-space: nowrap;
  `,
}
export const VideoCardActionStyle = S

export function VideoCardActionButton({
  inlinePosition,
  icon,
  tooltip,
  visible,
  ...divProps
}: {
  inlinePosition: InlinePosition
  icon: ReactNode
  tooltip: string
  visible?: boolean
} & ComponentProps<'div'>) {
  const wrapper = useRef(null)
  const hovering = useHover(wrapper)
  visible ??= true
  return (
    <div ref={wrapper} css={[S.button(visible)]} {...divProps}>
      {icon}
      <span style={{ display: hovering ? 'block' : 'none' }} css={S.tooltip(inlinePosition)}>
        {tooltip}
      </span>
    </div>
  )
}