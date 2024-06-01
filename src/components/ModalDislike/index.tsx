import { APP_NAME_ROOT_CLASSNAME, OPERATION_FAIL_MSG } from '$common'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { DislikeIcon } from '$components/VideoCard/use/useDislikeRelated'
import type { AppRecItem, AppRecItemExtend } from '$define'
import { cx } from '$libs'
import { IconPark } from '$modules/icon/icon-park'
import { BaseModal, BaseModalStyle, ModalClose } from '$ui-components/BaseModal'
import { AntdMessage } from '$utility'
import { toastRequestFail } from '$utility/toast'
import { useUpdateLayoutEffect } from 'ahooks'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { dislike } from '../VideoCard/card.service'

interface IProps {
  show: boolean
  onHide: () => void
  item: AppRecItem | null
}

export type Reason = { id: number; name: string; toast: string }

const dislikedIds = proxyMap<string, Reason>()
function useDislikedIds() {
  return useSnapshot(dislikedIds)
}

export function useDislikedReason(id?: string | false) {
  const map = useDislikedIds()
  if (!id) return undefined
  return map.get(id)
}
// 不能清理, 因为有两处在同时使用, refresh 之后清理影响其他地方比较奇怪
function clearDislikedIds() {
  dislikedIds.clear()
}
export function delDislikeId(id: string) {
  dislikedIds.delete(id)
}

function ModalDislike({ show, onHide, item }: IProps) {
  const [isRequesting, setIsRequesting] = useState(false)

  const onDislike = useMemoizedFn(async (reason: Reason) => {
    if (!item) return

    let success = false
    let err: Error | undefined
    try {
      setIsRequesting(true)
      success = await dislike(item, reason.id)
    } catch (e) {
      err = e as Error
    } finally {
      setIsRequesting(false)
    }

    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    success ? AntdMessage.success('已标记不想看') : AntdMessage.error(OPERATION_FAIL_MSG)
    if (success) {
      dislikedIds.set(item.param, { ...reason })
      onHide()
    }
  })

  const reasons = useMemo(() => {
    // 此类内容过多 reason_id = 12
    // 推荐过 reason_id = 13
    return item?.three_point?.dislike_reasons || []
  }, [item])

  const modalBodyRef = useRef<HTMLDivElement>(null)

  const keyPressEnabled = () => !!show && !!item

  const KEYS = ['1', '2', '3', '4', '5', '6']
  useKeyPress(KEYS, (e) => {
    if (!keyPressEnabled()) return
    if (!KEYS.includes(e.key)) return

    const index = Number(e.key) - 1
    setActiveIndex(index)

    const btn = modalBodyRef.current?.querySelectorAll<HTMLButtonElement>('.reason')[index]
    btn?.click()
  })

  const [activeIndex, setActiveIndex] = useState(reasons.length - 1)
  useUpdateLayoutEffect(() => {
    setActiveIndex(reasons.length - 1)
  }, [reasons])

  const increaseIndex = (by: number) => {
    return () => {
      if (!keyPressEnabled()) return
      const newIndex = activeIndex + by
      if (newIndex < 0 || newIndex > reasons.length - 1) return
      setActiveIndex(newIndex)
    }
  }

  useKeyPress('leftarrow', increaseIndex(-1), { exactMatch: true })
  useKeyPress('rightarrow', increaseIndex(1), { exactMatch: true })
  useKeyPress('uparrow', increaseIndex(-2), { exactMatch: true })
  useKeyPress('downarrow', increaseIndex(2), { exactMatch: true })

  useKeyPress(
    'enter',
    (e) => {
      if (!keyPressEnabled()) return
      if (activeIndex < 0 || activeIndex > reasons.length - 1) return
      e.preventDefault()
      e.stopImmediatePropagation()

      const btn = modalBodyRef.current?.querySelector<HTMLButtonElement>('.reason.active')
      btn?.click()
    },
    { exactMatch: true },
  )

  const activeReasonName = useMemo(() => {
    return reasons[activeIndex]?.name || ''
  }, [reasons, activeIndex])

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={500}
    >
      <div css={BaseModalStyle.modalHeader}>
        <div css={BaseModalStyle.modalTitle}>
          <DislikeIcon width={25} height={25} />
          <span
            css={css`
              margin-inline: 5px;
            `}
          >
            我不想看
          </span>
          <span
            css={css`
              font-size: 60%;
              margin-top: 7px;
            `}
          >
            (选择后将减少相似内容推荐)
          </span>
        </div>
        <div className='space' style={{ flex: 1 }}></div>
        <ModalClose onClick={onHide} />
      </div>

      <div css={BaseModalStyle.modalBody} ref={modalBodyRef}>
        <div
          className='reason-list'
          css={css`
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
          `}
        >
          {reasons.map((reason, index) => {
            const active = index === activeIndex

            return (
              <button
                className={cx('reason', { active })}
                css={[_css.reason, active && _css.reasonActive]}
                key={reason.id}
                data-id={reason.id}
                onClick={() => {
                  setActiveIndex(index)
                  onDislike(reason)
                }}
                disabled={isRequesting}
              >
                <span
                  className='reason-no'
                  css={css`
                    position: absolute;
                    left: 6px;

                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    top: ${(32 - 20) / 2}px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background-color: ${colorPrimaryValue};
                    color: #fff;
                  `}
                >
                  {index + 1}
                </span>
                {reason.name}
              </button>
            )
          })}
        </div>

        <div
          className='tips-container'
          css={css`
            margin-top: 20px;
          `}
        >
          <div className='tips' css={_css.tips}>
            <IconPark name='Info' size={15} style={{ marginRight: 5 }} />
            使用删除键打开弹窗, 数字键选择, Esc 关闭
          </div>
          {activeReasonName && (
            <div className='tips' css={_css.tips}>
              <IconPark name='Info' size={15} style={{ marginRight: 5 }} />
              已选择「{activeReasonName}」, 回车键提交
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

const _css = {
  reason: css`
    color: inherit;
    width: 48%;
    text-align: center;
    line-height: 20px;
    position: relative;

    border-radius: 4px;
    border: 2px solid #eee;

    /* https://github.com/emotion-js/emotion/issues/2836 */
    * :where(body.dark) & {
      border-color: #333;
    }

    padding-top: 5px;
    padding-bottom: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
  `,

  reasonActive: css`
    /* to increase specificity */
    &.active {
      border-color: ${colorPrimaryValue};
    }
  `,

  tips: css`
    display: flex;
    align-items: center;
  `,
}

const currentProps: IProps = {
  show: false,
  onHide,
  item: null,
}

// for outside consumer
const modalDislikeVisibleState = proxy({
  value: currentProps.show,
})

export const useModalDislikeVisible = function () {
  return useSnapshot(modalDislikeVisibleState).value
}

function onHide() {
  // esc 关闭, 等一个 tick, esc 先处理完
  setTimeout(() => {
    updateProps({ show: false, item: null })
  })
}

function updateProps(newProps: Partial<IProps>) {
  Object.assign(currentProps, newProps)
  modalDislikeVisibleState.value = currentProps.show
  getRoot().render(<ModalDislike {...currentProps} onHide={onHide} />)
}

let _root: Root
function getRoot() {
  _root ||= (() => {
    const container = document.createElement('div')
    container.classList.add('show-dislike-container', APP_NAME_ROOT_CLASSNAME)
    document.body.appendChild(container)
    return createRoot(container)
  })()
  return _root
}

export function showModalDislike(item: AppRecItemExtend) {
  // 已经是 dislike 状态
  if (item?.param && dislikedIds.has(item.param)) return
  updateProps({ show: true, item })
}

// setTimeout(() => {
//   // @ts-ignore
//   showModalDislike(null)
// }, 1000)
