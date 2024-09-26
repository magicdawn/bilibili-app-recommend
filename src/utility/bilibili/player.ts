export type Player = {
  play: () => void
  pause: () => void
  isPaused: () => boolean
}

export function getBiliPlayer(): Player | undefined {
  if (typeof unsafeWindow === 'undefined') return
  return (unsafeWindow as any).player
}
