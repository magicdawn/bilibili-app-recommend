import { BannerPlugin, Configuration, ProvidePlugin } from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { readFileSync } from 'fs'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const env = process.env.NODE_ENV

const config: Configuration = {
  entry: __dirname + '/src/main.tsx',

  mode: env as Configuration['mode'],
  devtool: false,

  output: {
    path: __dirname + '/dist/',
    filename: 'main.user.js',
  },

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
      banner: readFileSync(__dirname + '/src/banner.user.ts', 'utf-8'),
      raw: true,
    }),
    new ProvidePlugin({
      React: 'react', // auto import for React
    }),
  ],
}

export default config
