// import type { AttributifyNames } from '@unocss/preset-attributify'

import type { Ref } from 'react'

// type Prefix = 'uno:' // change it to your prefix

// declare module 'react' {
//   interface HTMLAttributes<T> extends Partial<Record<AttributifyNames<Prefix>, string | number>> {}
// }

export {}

type AllowRefHTMLElement<T> = T extends HTMLElement ? Ref<HTMLElement> : never

declare module 'react' {
  type __LegacyRef<T> = string | AllowRefHTMLElement<T> | Ref<T>
  interface RefAttributes<T> extends Attributes {
    ref?: __LegacyRef<T> | undefined
  }
}
