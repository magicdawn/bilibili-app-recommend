export function observe(
  node: Node,
  callback: (mutations: MutationRecord[], observer: MutationObserver) => boolean,
  options?: any
): () => void {
  let disconnect: () => void
  const observer = new MutationObserver((mutations, ob) => {
    const result = callback(mutations, ob)
    if (result) disconnect()
  })
  observer.observe(
    node,
    Object.assign(
      {
        childList: true,
        subtree: true,
      },
      options
    )
  )
  disconnect = () => observer.disconnect()
  return disconnect
}
