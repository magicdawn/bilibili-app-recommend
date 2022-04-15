import fs from 'fs'
import { defineConfig } from 'rollup'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import lessModules from 'rollup-plugin-less-modules'

// typescript
import esbuild from 'rollup-plugin-esbuild' // https://github.com/egoist/rollup-plugin-esbuild
import ts from 'rollup-plugin-ts' // https://github.com/wessberg/rollup-plugin-ts#install

let banner = fs.readFileSync(__dirname + '/src/banner.user.ts', 'utf8')

export default defineConfig({
  input: __dirname + '/src/main.tsx',

  plugins: [
    commonjs(),
    nodeResolve({
      browser: true,
      preferBuiltins: false, // no built in in browser
    }),

    json(),
    lessModules(),

    // ts
    // esbuild({}),
    ts({
      tsconfig: 'tsconfig.json',
    }),

    replace({
      'preventAssignment': true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),

    nodePolyfills(),
    // globals(),
    // builtins(),
  ],

  external: ['axios', 'jquery', 'react', 'react-dom', 'react-dom/client'],

  output: {
    format: 'iife',
    file: __dirname + '/dist/main.user.js',
    banner,

    globals: {
      'axios': 'axios',
      'crypto': 'crypto',
      'jquery': '$',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'react-dom/client': 'ReactDOM',
    },
  },
})
