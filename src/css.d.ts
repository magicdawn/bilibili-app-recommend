// My css.d.ts file
import 'react'

declare module 'react' {
  interface CSSProperties {
    // Allow css variables
    [index: `--${string}`]: string | number
  }
}
