import { BannerPlugin, Configuration, ProvidePlugin } from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { readFileSync } from 'fs'
import chalk from 'chalk'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import pkg from './package.json'
import ejs from 'ejs'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const env = process.env.NODE_ENV

/**
 * process banner
 */

// 2022-05-18 down in china
const NPM_CDN_HOST_JSDELIVR = 'https://cdn.jsdelivr.net/npm/'
const NPM_CDN_HOST_ELEME = 'https://npm.elemecdn.com/'
const NPM_CDN_HOST = NPM_CDN_HOST_ELEME

const locals = {
  version: pkg.version,
  meta: {
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
    ],

    require: [
      'axios@0.22.0/dist/axios.min.js',
      'axios-userscript-adapter@0.1.11/dist/axiosGmxhrAdapter.min.js',
      'jquery@3.4.1/dist/jquery.min.js',
      'react@18/umd/react.production.min.js',
      'react-dom@18/umd/react-dom.production.min.js',
    ].map((url) => NPM_CDN_HOST + url),
  },
}

if (env === 'development') {
  // use dev react
  locals.meta.require = locals.meta.require.map((item) => {
    return item.replace(/production\.min/g, 'development')
  })
}

let banner = readFileSync(__dirname + '/banner.ejs', 'utf-8')
banner = ejs.render(banner, locals)

// console.log(banner)
// process.exit(0)

const tsconfig = __dirname + '/tsconfig.json'

const config: Configuration = {
  entry: __dirname + '/src/main.tsx',
  output: {
    clean: true,
    path: __dirname + '/dist/',
    filename: 'main.user.js',
  },

  mode: env as Configuration['mode'],
  devtool: false,

  externals: {
    'jquery': '$',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'axios': 'axios',
    'axios-userscript-adapter': 'axiosGmxhrAdapter',
  },

  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: tsconfig })],
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      lodash: 'lodash-es',
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                namedExport: true,
                exportLocalsConvention: 'camelCaseOnly',
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                namedExport: true,
                exportLocalsConvention: 'camelCaseOnly',
                localIdentName: '[local]_[hash:hex:5]',
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new BannerPlugin({
      banner,
      raw: true,
    }),
    new ProvidePlugin({
      // auto import for React if using `React.createElement`
      React: 'react',
    }),
  ].filter(Boolean),

  // see https://github.com/webpack/webpack-cli/issues/312#issuecomment-409027910
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            beautify: false,
            preamble: banner,
          },
        },
      }),
    ],
  },
}

const url = `file://${config.output!.path}${config.output!.filename}`
console.log('-'.repeat(50))
console.log(`script url: ${chalk.green(url)}`)
console.log('open this url in Chrome with ViolentMonkey installed')
console.log('-'.repeat(50))

export default config
