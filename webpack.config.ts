import { BannerPlugin, Configuration, ProvidePlugin } from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { readFileSync } from 'fs'
import chalk from 'chalk'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const env = process.env.NODE_ENV

let banner = readFileSync(__dirname + '/src/banner.user.ts', 'utf-8')
if (env === 'development') {
  banner = banner.replace(/production\.min/g, 'development')
}

const config: Configuration = {
  entry: __dirname + '/src/main.tsx',
  output: {
    path: __dirname + '/dist/',
    filename: 'main.user.js',
  },

  mode: env as Configuration['mode'],
  devtool: false,

  externals: {
    'jquery': '$',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOM',
  },

  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.js', '.cjs', '.mjs', '.json', '.wasm', '.ts', '.tsx'],
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
          // compiles Less to CSS
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                exportLocalsConvention: 'camelCaseOnly',
              },
            },
          },
          'less-loader',
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
      React: 'react', // auto import for React
    }),
  ],
}

const url = `file://${config.output!.path}${config.output!.filename}`
console.log('-'.repeat(50))
console.log(`script url: ${chalk.green(url)}`)
console.log('open this url in Chrome with ViolentMonkey installed')
console.log('-'.repeat(50))

export default config
