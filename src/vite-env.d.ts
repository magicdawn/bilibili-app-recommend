export {}

declare global {
  declare const __SCRIPT_VERSION__: string

  interface Window {
    documentPictureInPicture:
      | {
          requestWindow(options: {
            width?: number
            height?: number
            disallowReturnToOpener?: boolean
          }): Promise<Window>
        }
      | undefined
  }

  interface VMScriptGMTabOptions {
    /** tampermonkey only, https://www.tampermonkey.net/documentation.php?locale=en#api:GM_openInTab */
    setParent?: boolean
  }
}
