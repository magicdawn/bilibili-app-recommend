import { isSafari } from '$ua'

export function openNewTab(url: string, active = true) {
  if (isSafari) {
    // https://github.com/quoid/userscripts?tab=readme-ov-file#api
    GM.openInTab(url, !active)
  } else {
    GM.openInTab(url, {
      active,
      insert: true,
      setParent: true,
    })
  }
}
