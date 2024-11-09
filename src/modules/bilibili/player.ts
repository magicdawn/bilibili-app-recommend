import { type BiliPlayer } from './player.d'

export function getBiliPlayer(): BiliPlayer | undefined {
  if (typeof unsafeWindow === 'undefined') return
  return (unsafeWindow as any).player
}
