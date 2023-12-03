import react from '@vitejs/plugin-react'
import reactSwc from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'
import fs from 'fs'
import postcssMediaMinmax from 'postcss-media-minmax'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import importer from 'vite-plugin-importer'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'
import { name as packageName, version as packageVersion } from './package.json'

const shouldMinify = !process.argv.includes('--no-minify')

const useHttps =
  process.env.MY_KEY_FILE &&
  process.env.MY_CERT_FILE &&
  (process.argv.includes('--https') || process.env.VITE_DEV_HTTPS)

let scriptName = packageName
let scriptVersion = packageVersion

let downloadURL =
  'https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js'
if (process.env.RELEASE) {
  downloadURL =
    'https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.mini.user.js'
} else if (process.env.RELEASE_NIGHTLY) {
  downloadURL =
    'https://github.com/magicdawn/bilibili-app-recommend/raw/release-nightly/bilibili-app-recommend.mini.user.js'

  // https://stackoverflow.com/questions/8595391/how-to-show-git-commit-using-number-of-commits-since-a-tag
  // const commitCount = execSync(`git rev-list v0.19.2.. --count`).toString().trim()
  // const commitHash = ''
  // version += `.${commitCount}_${commitHash}`

  scriptName += ' CI'
  const gitDescribe = process.env.GHD_DESCRIBE || execSync(`git describe`).toString().trim() // e.g v0.19.2-6-g0230769
  scriptVersion = gitDescribe.slice(1) // rm prefix v
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    'import.meta.vitest': 'undefined',
  },

  css: {
    postcss: {
      plugins: [
        // transform `@media (width >= 1000px)` => `@media (min-width: 1000px)`
        postcssMediaMinmax(),
      ],
    },
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },

  resolve: {
    alias: {
      // lodash: 'lodash-es',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
    },
  },

  // enable https, can load in safari
  // but still not available for development
  server: {
    https: useHttps
      ? {
          key: fs.readFileSync(process.env.MY_KEY_FILE!),
          cert: fs.readFileSync(process.env.MY_CERT_FILE!),
        }
      : undefined,
  },

  build: {
    emptyOutDir: true,
    cssMinify: shouldMinify,
    minify: shouldMinify,
    // target defaults `modules`, = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
    // target: ''
  },

  plugins: [
    tsconfigPaths(),

    // nodePolyfills({
    //   globals: {
    //     Buffer: false,
    //     global: false,
    //     process: false,
    //   },
    // }),

    /**
     * babel-plugin-import
     */
    command === 'build' &&
      importer({
        libraryName: 'antd',
        libraryDirectory: 'es',
      }),

    // import {get} from 'lodash' -> import get from 'lodash/get'
    command === 'build' &&
      importer({
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }),

    command === 'build' &&
      importer({
        libraryName: '@icon-park/react',
        libraryDirectory: 'es/icons',
        camel2DashComponentName: false, // default: true,
      }),

    // use @vitejs/plugin-react in build
    // for use emotion babel plugin
    // https://emotion.sh/docs/babel#features-which-are-enabled-with-the-babel-plugin
    command === 'serve'
      ? reactSwc({
          jsxImportSource: '@emotion/react',
        })
      : react({
          jsxImportSource: '@emotion/react',
          babel: {
            plugins: ['@emotion/babel-plugin'],
          },
        }),

    // https://github.com/lisonge/vite-plugin-monkey
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: scriptName,
        version: scriptVersion,
        namespace: 'https://magicdawn.fun',
        description: '为 B 站首页添加像 App 一样的推荐',
        icon: 'https://www.bilibili.com/favicon.ico',
        // 'description': 'Add app like recommend part to bilibili homepage',
        author: 'magicdawn',
        supportURL: 'https://github.com/magicdawn/bilibili-app-recommend/issues',
        homepageURL: 'https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend',
        downloadURL,
        license: 'MIT',
        match: [
          'https://www.bilibili.com/',
          'https://www.bilibili.com/?*',
          'https://www.bilibili.com/index.html',
          'https://www.bilibili.com/index.html?*',
        ],
        connect: [
          //
          'app.bilibili.com',
          'passport.bilibili.com',
          // 'www.mcbbs.net', // for get_access_key
        ],
        grant: [
          // axios gm adapter use
          'GM.xmlHttpRequest',
        ],
      },

      server: {
        prefix: (name) => `${name} Dev`, // 一样的, 避免切换
        open: true,
        mountGmApi: true,
      },

      build: {
        fileName: packageName + (shouldMinify ? '.mini' : '') + '.user.js',

        // unpkg is not stable
        // https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/197900

        externalGlobals: {
          // https://caniuse.com/resizeobserver
          // support starts from Chrome 76
          'resize-observer-polyfill': 'ResizeObserver',

          'axios': cdn.npmmirror('axios', 'dist/axios.min.js'),
          'axios-userscript-adapter': cdn.npmmirror(
            'axiosGmxhrAdapter',
            'dist/axiosGmxhrAdapter.min.js'
          ),
          'react': cdn.npmmirror('React', 'umd/react.production.min.js'),
          'react-dom': cdn.npmmirror('ReactDOM', 'umd/react-dom.production.min.js'),
          'ua-parser-js': cdn.npmmirror('UAParser', 'dist/ua-parser.min.js'),
          'framer-motion': cdn.npmmirror('Motion', 'dist/framer-motion.js'),

          // size:
          //     external 944kB + 36kB
          // not-external 946kB
          // antd use @emotion/* too
          // '@emotion/css': cdn.npmmirror('emotion', 'dist/emotion-css.umd.min.js'),
          // '@emotion/react': cdn.npmmirror('emotionReact', 'dist/emotion-react.umd.min.js'),

          // 'lodash': cdn.npmmirror('_', 'lodash.min.js'),
          // // ahooks use these
          // 'lodash/throttle': '_.throttle',
          // 'lodash/debounce': '_.debounce',
          // 'lodash/isEqual': '_.isEqual',
        },
      },
    }),

    // visualize
    process.env.NODE_ENV === 'production' &&
      process.argv.includes('--analyze') &&
      visualizer({
        open: true,
      }),
  ].filter(Boolean),
}))
