/**
 * https://ant.design/components/app-cn
 */

import { getHeaderHeight, useHeaderHeight } from '$header'
import { App, message as _message, notification as _notification } from 'antd'
import type {
  ConfigOptions as MessageConfigOptions,
  MessageInstance,
} from 'antd/es/message/interface'
import type { NotificationInstance } from 'antd/es/notification/interface'

// 如果使用 message, notification 经常会自动从 antd import
let AntdMessage: MessageInstance = _message
let AntdNotification: NotificationInstance = _notification

const messageConfig: MessageConfigOptions = {
  // FIXME: clean up this
  // duration: 1_000, // default 3, 单位秒
  maxCount: 5,
  top: getHeaderHeight() + 5,
}
_message.config(messageConfig)

export function UseApp() {
  const h = useHeaderHeight()
  return (
    <App component={false} message={{ ...messageConfig, top: h + 5 }}>
      <UseAppInner />
    </App>
  )
}

function UseAppInner() {
  const staticFunction = App.useApp()
  AntdMessage = staticFunction.message
  AntdNotification = staticFunction.notification
  return null
}

export { AntdMessage, AntdNotification }
