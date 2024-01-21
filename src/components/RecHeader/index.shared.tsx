import { settings } from '$settings'
import { proxy, useSnapshot } from 'valtio'

export const headerState = proxy({
  modalFeedVisible: settings.showModalFeedOnLoad,
  modalConfigVisible: false,
})

export const useHeaderState = function () {
  return useSnapshot(headerState)
}
export const showModalFeed = () => {
  headerState.modalFeedVisible = true
}
export const hideModalFeed = () => {
  headerState.modalFeedVisible = false
}
export const showModalConfig = () => {
  headerState.modalConfigVisible = true
}
export const hideModalConfig = () => {
  headerState.modalConfigVisible = false
}
