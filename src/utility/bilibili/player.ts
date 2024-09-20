export type Player = {
  play: () => void
  pause: () => void
  isPaused: () => boolean
}

export function getBiliPlayer(): Player | undefined {
  return (unsafeWindow as any).player
}
