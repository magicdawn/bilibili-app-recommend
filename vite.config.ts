import react from '@vitejs/plugin-react'
import reactSwc from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'
import { interopImportCJSDefault } from 'node-cjs-interop'
import postcssMediaMinmax from 'postcss-media-minmax'
import { visualizer } from 'rollup-plugin-visualizer'
import typedScssModulesOriginal from 'typed-scss-modules'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import { defineConfig, type ConfigEnv, type PluginOption } from 'vite'
import importer from 'vite-plugin-importer'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'
import { name as packageName, version as packageVersion } from './package.json'

const typedScssModules = interopImportCJSDefault(typedScssModulesOriginal)
const isDev = process.env.NODE_ENV == 'development'
if (isDev) {
  // only needed in dev mode
  typedScssModules(__dirname + '/src', {
    watch: true,
  })
}

// version
let scriptVersion = packageVersion
if (process.env.RELEASE) {
  // release Actions
} else {
  // local & nightly Actions
  // use `git describe`
  // https://stackoverflow.com/questions/8595391/how-to-show-git-commit-using-number-of-commits-since-a-tag
  const gitDescribe = process.env.GHD_DESCRIBE || execSync(`git describe`).toString().trim() // e.g v0.19.2-6-g0230769
  scriptVersion = gitDescribe.slice(1) // rm prefix v

  // v0.0.1-:commit_num-:commit_hash 居然比 v0.0.1 小
  // 变成 v0.0.1.:commit_num-:commit_hash
  scriptVersion = scriptVersion.replace(/^(\d+\.\d+\.\d+)-/, (match, p1) => `${p1}.`)
}

// minify
let minify = true
// via argv
if (process.argv.includes('--minify')) minify = true
if (process.argv.includes('--no-minify')) minify = false

// GreasyFork: default no minify
if (process.env.RELEASE) minify = false

// env.MINIFY
if (process.env.MINIFY === 'false') minify = false
if (process.env.MINIFY === 'true') minify = true

const miniSuffix = minify ? '.mini' : ''
const fileName = `${packageName}${miniSuffix}.user.js`
const metaFileName = process.env.CI ? `${packageName}${miniSuffix}.meta.js` : undefined

let downloadURL: string | undefined
let updateURL: string | undefined

if (process.env.RELEASE) {
  const baseUrl = 'https://github.com/magicdawn/bilibili-app-recommend/raw/release/'
  downloadURL = `${baseUrl}${fileName}`
  updateURL = `${baseUrl}${metaFileName}`
} else if (process.env.RELEASE_NIGHTLY) {
  const baseUrl = 'https://github.com/magicdawn/bilibili-app-recommend/raw/release-nightly/'
  downloadURL = `${baseUrl}${fileName}`
  updateURL = `${baseUrl}${metaFileName}`
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    __SCRIPT_VERSION__: JSON.stringify(scriptVersion),
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

    preprocessorOptions: {
      scss: {
        // api: modern-compiler will cause no exit after build, waiting fix
        api: 'modern',
        // https://sass-lang.com/documentation/breaking-changes/mixed-decls/
        silenceDeprecations: ['mixed-decls'],
      },
    },
  },

  resolve: {
    alias: {
      // lodash: 'lodash-es',
      // util: 'rollup-plugin-node-polyfills/polyfills/util',
    },
  },

  build: {
    emptyOutDir: process.env.RELEASE ? false : true,
    cssMinify: minify,
    minify: minify,
    // target defaults `modules`, = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
    // target: ''
  },

  plugins: [
    tsconfigPaths(),

    AutoImport({
      dts: 'src/auto-imports.d.ts',
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      imports: [
        'react',
        // 'ahooks',
        {
          from: 'react',
          imports: ['Fragment'],
        },
        {
          from: 'react',
          imports: ['ComponentProps', 'CSSProperties', 'ReactNode', 'RefObject'],
          type: true,
        },
        {
          from: 'ahooks',
          imports: ['useMemoizedFn', 'useKeyPress', 'useMount', 'useUpdateEffect'],
        },
        {
          from: 'react-dom/client',
          imports: ['createRoot'],
        },
        {
          from: 'react-dom/client',
          imports: ['Root'],
          type: true,
        },
        {
          from: 'valtio',
          imports: ['useSnapshot', 'proxy'],
        },
        {
          from: '@emotion/react',
          imports: ['css'],
        },
        {
          from: 'clsx',
          imports: ['clsx'],
        },
      ],
    }),

    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),

    ...getBabelImportPlugins(command),

    getReactPlugin(command),
    UnoCSS(),
    monkey({
      entry: './src/index.ts',
      userscript: {
        'name': packageName,
        'version': scriptVersion,
        'namespace': 'https://magicdawn.fun',
        'description': 'B站首页推荐',
        'icon': 'https://www.bilibili.com/favicon.ico',
        // 'description': 'Add app like recommend part to bilibili homepage',
        'author': 'magicdawn',
        'supportURL': 'https://github.com/magicdawn/bilibili-app-recommend/issues',
        'homepageURL': 'https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend',
        downloadURL,
        updateURL,
        'license': 'MIT',
        'match': [
          'https://www.bilibili.com/',
          'https://www.bilibili.com/?*',
          'https://www.bilibili.com/index.html',
          'https://www.bilibili.com/index.html?*',
          'https://www.bilibili.com/video/*',
          'https://www.bilibili.com/list/watchlater?*',
          'https://www.bilibili.com/bangumi/play/*',
        ],
        'connect': ['app.bilibili.com'],
        'grant': [
          'GM.xmlHttpRequest', // axios gm adapter use
        ],
        'run-at': 'document-end', // default: violentmonkey: document-end; tampermonkey: document-idle
      },

      server: {
        prefix: false, // 一样的, 避免切换
        open: true,
        mountGmApi: true,
      },

      build: {
        fileName,
        metaFileName,

        // unpkg is not stable
        // https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/197900

        externalGlobals: {
          // https://caniuse.com/resizeobserver
          // support starts from Chrome 76
          // can't resolve
          // 'resize-observer-polyfill': 'ResizeObserver',

          'axios': cdn.npmmirror('axios', 'dist/axios.min.js'),
          // 'axios-userscript-adapter': cdn.npmmirror(
          //   'axiosGmxhrAdapter',
          //   'dist/axiosGmxhrAdapter.min.js',
          // ),
          'react': cdn.npmmirror('React', 'umd/react.production.min.js'),
          'react-dom': cdn.npmmirror('ReactDOM', 'umd/react-dom.production.min.js'),
          'ua-parser-js': cdn.npmmirror('UAParser', 'dist/ua-parser.min.js'),
          'framer-motion': cdn.npmmirror('Motion', 'dist/framer-motion.js'),
          'localforage': cdn.npmmirror('localforage', 'dist/localforage.min.js'),

          // size:
          //  external 944kB + 36kB
          //  not-external 946kB
          // antd use @emotion/* too
          // '@emotion/css': cdn.npmmirror('emotion', 'dist/emotion-css.umd.min.js'),
          // '@emotion/react': cdn.npmmirror('emotionReact', 'dist/emotion-react.umd.min.js'),

          ...(minify
            ? {}
            : // external more when no-minify
              //  - lodash
              //  - antd
              {
                'lodash': cdn.npmmirror('_', 'lodash.min.js'),
                // ahooks use these
                'lodash/throttle': '_.throttle',
                'lodash/debounce': '_.debounce',
                'lodash/isEqual': '_.isEqual',

                // antd deps = [react, react-dom, dayjs]
                'dayjs': cdn.npmmirror('dayjs', 'dayjs.min.js'),
                'dayjs/plugin/duration': cdn.npmmirror(
                  'dayjs_plugin_duration',
                  'plugin/duration.js',
                ),

                // https://github.com/ant-design/ant-design/issues/45262
                '@ant-design/cssinjs': cdn.npmmirror('antdCssinjs', 'dist/umd/cssinjs.min.js'),

                'antd': cdn.npmmirror('antd', 'dist/antd-with-locales.min.js'),
                'antd/locale/zh_CN': 'antd.locales.zh_CN',
              }),
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

/**
 * babel-plugin-import related
 */

function getBabelImportPlugins(command: ConfigEnv['command']): PluginOption[] {
  return [
    command === 'build' &&
      minify &&
      importer({
        libraryName: 'antd',
        libraryDirectory: 'es',
      }),

    // import {get} from 'lodash' -> import get from 'lodash/get'
    command === 'build' &&
      minify &&
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
  ].filter(Boolean)
}

function getReactPlugin(command: ConfigEnv['command']) {
  const swc = reactSwc({
    jsxImportSource: '@emotion/react',
  })

  const babel = react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin'],
    },
  })

  return babel

  // use @vitejs/plugin-react in build
  // for use emotion babel plugin
  // https://emotion.sh/docs/babel#features-which-are-enabled-with-the-babel-plugin
  return command === 'serve' ? swc : babel
}
