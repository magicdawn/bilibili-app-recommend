import { describe, expect, it } from 'vitest'
import { isFavFolderDefault, isFavFolderPrivate } from './fav-util'

// console.log((21).toString(2))
// console.log((22).toString(2))
// console.log((23).toString(2))

describe.concurrent('fav-util', () => {
  it('isFavFolderDefault()', () => {
    expect(isFavFolderDefault(21)).toBe(true)
    expect(isFavFolderDefault(22)).toBe(false)
    expect(isFavFolderDefault(23)).toBe(false)
  })

  it('isFavFolderPrivate()', () => {
    expect(isFavFolderPrivate(21)).toBe(true)
    expect(isFavFolderPrivate(22)).toBe(false)
    expect(isFavFolderPrivate(23)).toBe(true)
  })
})
