import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetAttributify, presetUno } from 'unocss'

// import presetRemToPx from '@unocss/preset-rem-to-px'
// import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
// import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  rules: [
    // `size-15` or `size-15px`
    [/^size-([.\d]+)(?:px)?$/, ([_, num]) => ({ width: `${num}px`, height: `${num}px` })],
  ],
  presets: [
    presetUno,
    presetRemToPx,
    presetAttributify({
      prefixedOnly: true,
      prefix: 'uno:',
    }),
  ],
  // transformers: [transformerAttributifyJsx()], // this does not work
})
