export function getPopupContainerFactory(ref: RefObject<HTMLElement>) {
  return function getPopupContainer() {
    return ref.current?.closest<HTMLElement>('.area-header') || document.body
  }
}
