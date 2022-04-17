import { BannerPlugin, Configuration, ProvidePlugin } from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { readFileSync } from 'fs'
import chalk from 'chalk'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const env = process.env.NODE_ENV

let banner = readFileSync(__dirname + '/banner.user.js', 'utf-8')
if (env === 'development') {
  banner = banner.replace(/production\.min/g, 'development')
}

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
  },

  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: tsconfig })],
    extensions: ['.ts', '.tsx', '.js', '.json'],
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
  ],

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
