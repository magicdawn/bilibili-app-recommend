#!/usr/bin/env tsx
// #!/usr/bin/env bun
// #!/usr/bin/env ts-node

import chalk from 'chalk'
import open, { apps as openApps } from 'open'
import path from 'path'
import { name } from '../package.json'

const projectRoot = path.resolve(import.meta.dirname, '..')
const url = `file://${projectRoot}/dist/${name}.mini.user.js`

console.log('-'.repeat(50))
console.log(`script url:`)
console.log(`build: ${chalk.green(url)}`)
console.log('open this url in Chrome with ViolentMonkey installed')
console.log('-'.repeat(50))

// console.log(`serve: ${chalk.yellow('http://127.0.0.1:3000/__vite-plugin-monkey.install.user.js')}`)

if (process.argv.includes('--open')) {
  open(url, { app: { name: openApps.chrome } })
}
