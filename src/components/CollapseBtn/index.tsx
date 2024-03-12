import { useToggle } from 'ahooks'
import type { Actions } from 'ahooks/lib/useToggle'

interface IProps {
  children: ReactNode
  initialOpen?: boolean
}

export type CollapseBtnRef = Actions<boolean>

export const CollapseBtn = forwardRef<CollapseBtnRef, IProps>(function CollapseBtn(
  { children, initialOpen = false }: IProps,
  ref,
) {
  const [buttonsExpanded, buttonsExpandedActions] = useToggle(initialOpen)

  useImperativeHandle(ref, () => buttonsExpandedActions, [buttonsExpandedActions])

  const btn = (
    <button
      onClick={buttonsExpandedActions.toggle}
      className='primary-btn'
      css={css`
        padding: 0;
        width: 31px;
        height: 31px;
        border-radius: 50%;

        body.dark & {
          color: #eee !important;
          border-color: transparent !important;
          background-color: #333 !important;
          &:hover {
            background-color: #555 !important;
          }
        }
      `}
    >
      <svg
        css={[
          css`
            width: 13px;
            height: 13px;
            transform: rotateZ(180deg);
          `,
          buttonsExpanded &&
            css`
              transform: rotateZ(0deg);
            `,
        ]}
      >
        <use href='#widget-arrow'></use>
      </svg>
    </button>
  )

  return (
    <>
      {btn}
      {buttonsExpanded && children}
    </>
  )
})
