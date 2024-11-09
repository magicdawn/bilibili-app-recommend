import {
  settings,
  updateSettings,
  useSettingsSnapshot,
  type ListSettingsKey,
} from '$modules/settings'
import { AntdMessage } from '$utility'
import { Empty, Input } from 'antd'
import { uniq } from 'es-toolkit'
import type { ComponentPropsWithoutRef } from 'react'
import IconParkOutlineCloseSmall from '~icons/icon-park-outline/close-small'
import { colorPrimaryValue } from './theme.shared'

const { Search } = Input

export function EditableListSettingItem({
  configKey,
  searchProps,
  disabled,
}: {
  configKey: ListSettingsKey
  searchProps?: ComponentProps<typeof Search>
  disabled?: boolean
}) {
  let list = useSettingsSnapshot()[configKey] as string[]
  list = useMemo(() => uniq(list).toReversed(), [list])

  return (
    <>
      <Search
        css={css`
          margin-top: 5px;
          margin-bottom: 5px;
        `}
        enterButton='添加'
        allowClear
        disabled={disabled}
        {...searchProps}
        onSearch={(val, e) => {
          if (!val) return

          const set = new Set<string>([...settings[configKey]])
          if (!set.has(val)) {
            set.add(val)
          } else {
            AntdMessage.warning(`${val} 已存在`)
          }

          updateSettings({ [configKey]: Array.from(set) })

          // clear
          // 非受控组件, 有内部状态, 不能简单设置 input.value
          if (e?.target) {
            const el = e.target as HTMLElement
            const clearBtn = el
              .closest('.ant-input-wrapper')
              ?.querySelector<HTMLElement>('.ant-input-clear-icon')
            clearBtn?.click()
          }
        }}
      />

      <div
        css={[
          css`
            min-height: 82px;
            border-radius: 6px;
            border: 1px solid #eee;
            margin-top: 3px;
            body.dark & {
              border-color: #333;
            }
          `,
          disabled &&
            css`
              color: var(--ant-color-text-disabled);
              background-color: var(--ant-color-bg-container-disabled);
              border-color: var(--ant-color-border);
              box-shadow: none;
              opacity: 1;
              pointer-events: none;
              cursor: not-allowed;
            `,
        ]}
      >
        {list.length ? (
          <div
            css={css`
              display: flex;
              flex-wrap: wrap;
              padding: 5px;
              gap: 5px 10px;
              align-items: flex-start;
              max-height: 200px;
              overflow-y: scroll;
              padding-right: 10px;
            `}
          >
            {list.map((t) => {
              return (
                <TagItemDisplay
                  key={t}
                  tag={t}
                  enableDragging={false}
                  onDelete={(tag) => {
                    const s = new Set([...settings[configKey]])
                    s.delete(tag)
                    updateSettings({ [configKey]: Array.from(s) })
                  }}
                />
              )
            })}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='空空如也'
            css={css`
              &.ant-empty-normal {
                margin-block: 5px;
              }
            `}
          />
        )}
      </div>
    </>
  )
}

const TagItemDisplay = forwardRef<
  HTMLDivElement,
  {
    tag: string
    enableDragging?: boolean
    dragging?: boolean
    onDelete?: (tag: string) => void
  } & Omit<ComponentPropsWithoutRef<'div'>, 'children'>
>(({ tag, enableDragging = true, dragging, className, onDelete, ...restProps }, ref) => {
  return (
    <div
      {...restProps}
      ref={ref}
      className={clsx(className, { dragging })}
      css={[
        css`
          border-radius: 5px;
          padding: 2px 6px;
          position: relative;
          border: 1px solid #ddd;
          body.dark & {
            border-color: #333;
          }

          display: inline-flex;
          align-items: center;

          &:hover,
          &.dragging {
            border-color: ${colorPrimaryValue};
            color: ${colorPrimaryValue};
            .anticon {
              visibility: visible;
            }
          }

          &.dragging {
            z-index: 10;
          }
        `,
        enableDragging &&
          css`
            cursor: move;
          `,
      ]}
    >
      {tag}
      <IconParkOutlineCloseSmall
        onClick={() => {
          onDelete?.(tag)
        }}
        {...size(16)}
        css={css`
          margin-left: 2px;
          cursor: pointer;
          font-size: 12px;
        `}
      />
    </div>
  )
})
