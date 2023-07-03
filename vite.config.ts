import react from '@vitejs/plugin-react'
// import reactSwc from '@vitejs/plugin-react-swc'
import fs from 'fs'
import visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import importer from 'vite-plugin-importer'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'
import { name as packageName, version } from './package.json'

const shouldMinify = !process.argv.includes('--no-minify')
const useHttps =
  process.env.MY_KEY_FILE &&
  process.env.MY_CERT_FILE &&
  (process.argv.includes('--https') || process.env.VITE_DEV_HTTPS)

let downloadURL =
  'https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js'
if (process.env.RELEASE) {
  downloadURL =
    'https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.mini.user.js'
} else if (process.env.RELEASE_NIGHTLY) {
  downloadURL =
    'https://github.com/magicdawn/bilibili-app-recommend/raw/release-nightly/bilibili-app-recommend.mini.user.js'
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => ({
  define: {
    'import.meta.vitest': 'undefined',
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },

  resolve: {
    alias: {
      lodash: 'lodash-es',
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
  },

  plugins: [
    tsconfigPaths(),

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

    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),

    // https://github.com/lisonge/vite-plugin-monkey
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'bilibili-app-recommend',
        namespace: 'https://magicdawn.fun',
        version,
        description: '更好的 B 站首页推荐体验',
        icon: 'https://www.bilibili.com/favicon.ico',
        // 'description': 'Add app like recommend part to bilibili homepage',
        author: 'magicdawn',
        supportURL: 'https://github.com/magicdawn/bilibili-app-recommend/issues',
        homepageURL: 'https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend',
        downloadURL,
        license: 'MIT',
        match: [
          'https://www.bilibili.com/',
          'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png',
          'https://www.bilibili.com/index.html',
          'https://www.bilibili.com/?*',
          'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
          'https://www.bilibili.com/index.html?*',
        ],
        connect: [
          //
          'app.bilibili.com',
          'passport.bilibili.com',
          'link.acg.tv',
          'www.mcbbs.net',
        ],
        grant: [
          // axios gm adapter use
          'GM.xmlHttpRequest',
        ],
      },

      server: {
        prefix: false, // 一样的, 避免切换
        open: true,
        mountGmApi: true,
      },

      build: {
        fileName: packageName + (shouldMinify ? '.mini' : '') + '.user.js',
        externalGlobals: {
          'axios': cdn.unpkg('axios', 'dist/axios.min.js'),
          'axios-userscript-adapter': cdn.unpkg(
            'axiosGmxhrAdapter',
            'dist/axiosGmxhrAdapter.min.js'
          ),
          'react': cdn.unpkg('React', 'umd/react.production.min.js'),
          'react-dom': cdn.unpkg('ReactDOM', 'umd/react-dom.production.min.js'),
          'ua-parser-js': cdn.unpkg('UAParser', 'dist/ua-parser.min.js'),
          // '@emotion/css': cdn.unpkg('emotion', 'dist/emotion-css.umd.min.js'),
          // '@emotion/react': cdn.unpkg('emotionReact', 'dist/emotion-react.umd.min.js'),
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
