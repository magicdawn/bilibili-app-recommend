#!/usr/bin/env ts-node

import path from 'path'
import { name } from '../package.json'
import chalk from 'chalk'
import open from 'open'

const projectRoot = path.resolve(__dirname, '..')
const url = `file://${projectRoot}/dist/${name}.user.js`

console.log('-'.repeat(50))
console.log(`script url:`)
console.log(`build: ${chalk.green(url)}`)
console.log('open this url in Chrome with ViolentMonkey installed')
console.log('-'.repeat(50))

// console.log(`serve: ${chalk.yellow('http://127.0.0.1:3000/__vite-plugin-monkey.install.user.js')}`)

if (process.argv.includes('--open')) {
  open(url, { app: { name: open.apps.chrome } })
}
