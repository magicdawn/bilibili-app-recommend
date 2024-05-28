import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetAttributify, presetUno } from 'unocss'

// import presetRemToPx from '@unocss/preset-rem-to-px'
// import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
// import { defineConfig, presetAttributify, presetUno } from 'unocss'

// https://github.com/unocss/unocss/issues/1620
const _presetUno = presetUno()
delete _presetUno.shortcuts
_presetUno.rules = _presetUno.rules?.filter((rule) => !rule[0].toString().includes('container'))
// console.log(_presetUno)

export default defineConfig({
  rules: [
    // `size-15` or `size-15px`
    [/^size-([.\d]+)(?:px)?$/, ([_, num]) => ({ width: `${num}px`, height: `${num}px` })],
  ],
  presets: [
    _presetUno,
    presetRemToPx,
    presetAttributify({
      prefixedOnly: true,
      prefix: 'uno:',
    }),
  ],
  // transformers: [transformerAttributifyJsx()], // this does not work
})
