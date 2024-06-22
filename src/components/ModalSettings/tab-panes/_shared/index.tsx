import { Space } from 'antd'
import type { ReactNode } from 'react'

/**
.settings-group {
  margin-bottom: 10px;

  .settings-group-title {
    font-size: 2em;
    display: flex;
    align-items: center;
  }

  .settings-group-sub-title {
    font-size: 1.3em;
    display: flex;
    align-items: center;
    margin-top: 15px;
  }

  .settings-group-content {
    color: default;
    button:first-child {
      margin-left: 0;
    }
  }
}
 */

const S = {
  settingsGroup: css`
    margin-bottom: 10px;
  `,

  settingsGroupTitle: css`
    font-size: 2em;
    display: flex;
    align-items: center;
  `,

  settingsGroupSubTitle: css`
    font-size: 1.3em;
    display: flex;
    align-items: center;
    margin-top: 15px;
  `,

  settingsGroupContent: css`
    color: default;
    button:first-child {
      margin-left: 0;
    }
  `,
}
export const sharedS = S

export function SettingsGroup({
  children,
  title,
}: {
  children?: React.ReactNode
  title: ReactNode
}) {
  return (
    <div css={S.settingsGroup} data-as='settings-group'>
      <div css={S.settingsGroupTitle} data-as='settings-group-title'>
        {title}
      </div>
      <div css={S.settingsGroupContent} data-as='settings-group-content'>
        <Space size={5} direction='vertical' className='flex'>
          {/* the content */}
          {children}
        </Space>
      </div>
    </div>
  )
}
