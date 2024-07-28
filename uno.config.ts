import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetUno } from 'unocss'

// import presetRemToPx from '@unocss/preset-rem-to-px'
// import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
// import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno,
    presetRemToPx({
      // baseFontSize: 4, // mr-4 = 1rem;
    }),
  ],
  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  rules: [
    // `size-15` or `size-15px`
    [/^size-([.\d]+)(?:px)?$/, ([_, num]) => ({ width: `${num}px`, height: `${num}px` })],
  ],

  // presetAttributify({
  //     prefixedOnly: true,
  //     prefix: 'uno:',
  //   }),
  // transformers: [transformerAttributifyJsx()], // this does not work
})
