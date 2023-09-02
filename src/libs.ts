// use named expoorts
// so that vscode can find those imports

// vscode syntax highlight 只支持特定 tag
// https://github.com/magicdawn/magicdawn/issues/152#issuecomment-1703950025
export { css as styled } from '@emotion/css'
export { css } from '@emotion/react' // css`` to object style

export { default as axios } from 'axios'
export { default as cx } from 'classnames'
