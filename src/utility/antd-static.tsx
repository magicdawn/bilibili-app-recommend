/**
 * https://ant.design/components/app-cn
 */

import { $headerHeight } from '$header'
import { App, message as _message, notification as _notification } from 'antd'
import type {
  ConfigOptions as MessageConfigOptions,
  MessageInstance,
} from 'antd/es/message/interface'
import type { NotificationInstance } from 'antd/es/notification/interface'

const messageConfig: MessageConfigOptions = {
  // duration: default 3, 单位秒
  maxCount: 5,
  top: $headerHeight.get() - 4,
}
_message.config(messageConfig)

export function UseApp() {
  const h = $headerHeight.use()
  return (
    <App component={false} message={{ ...messageConfig, top: h - 4 }}>
      <UseAppInner />
    </App>
  )
}

// 如果使用 message, notification 经常会自动从 antd import
export let AntdStatic: ReturnType<typeof App.useApp>
export let AntdMessage: MessageInstance = _message
export let AntdNotification: NotificationInstance = _notification

function UseAppInner() {
  AntdStatic = App.useApp()
  AntdMessage = AntdStatic.message
  AntdNotification = AntdStatic.notification
  return null
}
