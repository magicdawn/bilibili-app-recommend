/**
 * export/bind (functions & variables) to unsafeWindow
 */

import { APP_KEY_PREFIX } from '$common'
import { normalizeCardData, type IVideoCardData } from '$components/VideoCard/process/normalize'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import dayjs from 'dayjs'
import { tryit } from 'radash'

export const gridItemsKey = `${APP_KEY_PREFIX}_gridItems`

const win = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis) as any
const setWinValue = (key: string, val: any) => void tryit(() => (win[key] = val))()

export function setGlobalGridItems(items: RecItemTypeOrSeparator[]) {
  items = items.filter((x) => x.api !== EApiType.Separator)
  setWinValue(gridItemsKey, items)
}

function getGridCardData() {
  const gridItems = (win?.[gridItemsKey] || []) as RecItemType[]
  return gridItems.map((item) => normalizeCardData(item))
}
function copyBvidsSingleLine() {
  const bvids = getGridCardData().map((cardData) => cardData.bvid)
  GM.setClipboard(bvids.join(' '))
}

function copyBvidsInfo() {
  const lines = getGridCardData().map(getBvidInfo)
  GM.setClipboard(lines.join('\n'))
}

export function getBvidInfo(cardData: IVideoCardData) {
  let { bvid, authorName, pubts, title } = cardData
  const date = dayjs.unix(pubts ?? 0).format('YYYY-MM-DD')
  title = title.replace(/\n+/g, ' ')
  return `${bvid} ;; [${authorName}] ${date} ${title}`
}

// bind(export) function to unsafeWindow
const BIND_TO_UNSAFE_WINDOW_FNS = { getGridCardData, copyBvidsSingleLine, copyBvidsInfo }
setTimeout(() => {
  Object.entries(BIND_TO_UNSAFE_WINDOW_FNS).forEach(([fnName, fn]) => {
    setWinValue(`${APP_KEY_PREFIX}_${fnName}`, fn)
  })
})
