import { cx } from '$libs'
import { useToggle } from 'ahooks'
import type { Actions } from 'ahooks/lib/useToggle'
import type { ReactNode } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import styles from './index.module.less'

interface IProps {
  children: ReactNode
}

export type CollapseBtnRef = Actions<boolean>

export const CollapseBtn = forwardRef<CollapseBtnRef, IProps>(function CollapseBtn(
  { children }: IProps,
  ref
) {
  const [buttonsExpanded, buttonsExpandedActions] = useToggle(false)

  useImperativeHandle(ref, () => buttonsExpandedActions, [buttonsExpandedActions])

  const btn = (
    <button className={cx('primary-btn', styles.expandBtn)} onClick={buttonsExpandedActions.toggle}>
      <svg className={cx({ [styles.expanded]: buttonsExpanded })}>
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
