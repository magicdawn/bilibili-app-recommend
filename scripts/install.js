const {join} = require('path')

const dev = join(__dirname, '..', 'src/banner.user.js')
const build = join(__dirname, '..', 'dist/main.user.js')

console.log(`dev:   ${dev}`)
console.log(`build: ${build}`)

console.log('')
console.log('-----------------')
console.log('')

console.log(`dev:   file://${dev}`)
console.log(`build: file://${build}`)
