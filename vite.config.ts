import react from '@vitejs/plugin-react'
// import reactSwc from '@vitejs/plugin-react-swc'
import visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'
import { name as packageName, version } from './package.json'

const shouldMinify = !process.argv.includes('--no-minify')

// https://vitejs.dev/config/
export default defineConfig({
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

  build: {
    emptyOutDir: false,
    cssMinify: shouldMinify,
    minify: shouldMinify,
  },

  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    tsconfigPaths(),

    // visualize
    process.env.NODE_ENV === 'production' &&
      process.argv.includes('--analyze') &&
      visualizer({
        open: true,
      }),

    // https://github.com/lisonge/vite-plugin-monkey
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'bilibili-app-recommend',
        namespace: 'https://magicdawn.fun',
        version,
        description: '为B站首页添加像App一样的推荐',
        // 'description': 'Add app like recommend part to bilibili homepage',
        // 'description:zh-CN': '为B站首页添加像App一样的推荐',
        author: 'magicdawn',
        supportURL: 'https://github.com/magicdawn/bilibili-app-recommend/issues',
        homepageURL: 'https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend',
        downloadURL:
          'https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js',
        license: 'MIT',
        match: [
          '*://www.bilibili.com/',
          'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png',
          '*://www.bilibili.com/index.html',
          '*://www.bilibili.com/?*',
          'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
          '*://www.bilibili.com/index.html?*',
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
        },
      },
    }),
  ].filter(Boolean),
})
