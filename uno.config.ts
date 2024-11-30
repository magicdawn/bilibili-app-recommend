import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetUno, transformerDirectives } from 'unocss'
// import { defineConfig, presetAttributify, presetUno } from 'unocss'
// import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'

export default defineConfig({
  presets: [
    presetUno,
    presetRemToPx({
      baseFontSize: 4, // mr-4 = 1rem;
    }),
  ],
  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  rules: [
    // `size-15` or `size-15px`
    [/^size-([.\d]+)(?:px)?$/, ([_, num]) => ({ width: `${num}px`, height: `${num}px` })],
  ],

  transformers: [transformerDirectives()],

  // presetAttributify({
  //     prefixedOnly: true,
  //     prefix: 'uno:',
  //   }),
  // transformers: [transformerAttributifyJsx()], // this does not work
})
