import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetAttributify, presetUno } from 'unocss'

// import presetRemToPx from '@unocss/preset-rem-to-px'
// import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
// import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno,
    presetRemToPx,
    presetAttributify({
      prefixedOnly: true,
      // prefix: 'uno',
    }),
  ],
  // transformers: [transformerAttributifyJsx()], this does not work
})
