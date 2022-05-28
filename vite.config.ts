import react from '@vitejs/plugin-react'
import { defineConfig, Plugin, ResolvedConfig } from 'vite'
import monkey, { MonkeyUserScript } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'
import { version } from './package.json'

// jsdelivr: 2022-05-18 down in china
// eleme: not allowed in greasyfork.org
const NPM_CDN_HOST_JSDELIVR = 'https://cdn.jsdelivr.net/npm/'
const NPM_CDN_HOST_ELEME = 'https://npm.elemecdn.com/'
const NPM_CDN_HOST_UNPKG = 'https://unpkg.com/'
const NPM_CDN_HOST = NPM_CDN_HOST_UNPKG

// https://github.com/vitejs/vite/blob/v2.9.9/packages/plugin-react/src/index.ts#L324-L334
// https://github.com/vitejs/vite/blob/v2.9.9/packages/plugin-react/src/fast-refresh.ts#L29-L35
function viteReactPreamble(): Plugin {
  const virtualModuleId = 'virtual:vite-react-preamble'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-react-preamble', // required, will show up in warnings and errors
    configResolved(config) {
      resolvedConfig = config
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        if (resolvedConfig.mode === 'development') {
          const preambleCode = react.preambleCode.replace(`__BASE__`, resolvedConfig.base || '/')
          return `
            ${preambleCode}
            ;console.log('[vite-react-preamble]: preamble loaded')
          `
        } else {
          return ''
        }
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },

  build: {
    minify: 'esbuild',
  },

  plugins: [
    react(),
    viteReactPreamble(),
    tsconfigPaths(),

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
        homepageURL: 'https://github.com/magicdawn/bilibili-app-recommend',
        downloadURL:
          'https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js',
        license: 'MIT',
        match: ['*://www.bilibili.com/*'],
        include: ['https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*'],
        connect: [
          //
          'app.bilibili.com',
          'passport.bilibili.com',
          'link.acg.tv',
          'www.mcbbs.net',
        ],
        grant: [
          'GM.xmlHttpRequest',
          'GM_xmlhttpRequest',
          'GM_getValue',
          'GM_setValue',
          'GM_deleteValue',
          'unsafeWindow',
        ] as MonkeyUserScript['grant'],
      },

      server: {
        open: false,
      },

      build: {
        externalGlobals: {
          'jquery': ['$', (version) => `${NPM_CDN_HOST}jquery@${version}/dist/jquery.min.js`],
          'axios': ['axios', (version) => `${NPM_CDN_HOST}axios@${version}/dist/axios.min.js`],
          'axios-userscript-adapter': [
            'axiosGmxhrAdapter',
            (version) =>
              `${NPM_CDN_HOST}axios-userscript-adapter@${version}/dist/axiosGmxhrAdapter.min.js`,
          ],
          'react': [
            'React',
            (version) => `${NPM_CDN_HOST}react@${version}/umd/react.production.min.js`,
          ],
          'react-dom': [
            'ReactDOM',
            (version) => `${NPM_CDN_HOST}react-dom@${version}/umd/react-dom.production.min.js`,
          ],
        },
      },
    }),
  ],
})
