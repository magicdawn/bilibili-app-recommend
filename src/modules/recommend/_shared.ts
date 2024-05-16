export function getPopupContainerFactory(ref: RefObject<HTMLElement>) {
  return function getPopupContainer() {
    return ref.current?.closest<HTMLElement>('.area-header') || document.body
  }
}

export function usePopupContainer<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const getPopupContainer = useMemo(() => getPopupContainerFactory(ref), [])
  return { ref, getPopupContainer }
}
