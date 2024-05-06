export {}

declare global {
  declare const __SCRIPT_VERSION__: string

  interface Window {
    documentPictureInPicture:
      | {
          requestWindow(options: {
            width: number
            height: number
            disallowReturnToOpener: boolean
          }): Promise<Window>
        }
      | undefined
  }
}
