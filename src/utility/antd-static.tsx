/**
 * https://ant.design/components/app-cn
 */

import { App, message as _message, notification as _notification } from 'antd'
import type {
  ConfigOptions as MessageConfigOptions,
  MessageInstance,
} from 'antd/es/message/interface'
import type { NotificationInstance } from 'antd/es/notification/interface'

let message: MessageInstance = _message
let notification: NotificationInstance = _notification

const messageConfig: MessageConfigOptions = {
  // FIXME: clean up this
  // duration: 1_000, // default 3, 单位秒
  maxCount: 5,
  top: 70,
}
_message.config(messageConfig)

export function UseApp() {
  return (
    <App component={false} message={messageConfig}>
      <UseAppInner />
    </App>
  )
}

function UseAppInner() {
  const staticFunction = App.useApp()
  message = staticFunction.message
  notification = staticFunction.notification
  return null
}

export { message, notification }
