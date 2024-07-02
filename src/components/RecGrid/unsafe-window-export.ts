/**
 * export/bind (functions & variables) to unsafeWindow
 */

import { APP_KEY_PREFIX } from '$common'
import { normalizeCardData } from '$components/VideoCard/process/normalize'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { tryit } from 'radash'

export const gridItemsKey = `${APP_KEY_PREFIX}_gridItems`

const win = unsafeWindow as any
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
  const bvids = getGridCardData()
    .map((cardData) => [
      `# [${cardData.authorName}] ${cardData.pubdateDisplay} ${cardData.title}`,
      cardData.bvid,
    ])
    .flat()
  GM.setClipboard(bvids.join('\n'))
}

// bind(export) function to unsafeWindow
const BIND_TO_UNSAFE_WINDOW_FNS = { getGridCardData, copyBvidsSingleLine, copyBvidsInfo }
setTimeout(() => {
  Object.entries(BIND_TO_UNSAFE_WINDOW_FNS).forEach(([fnName, fn]) => {
    setWinValue(`${APP_KEY_PREFIX}_${fnName}`, fn)
  })
})
