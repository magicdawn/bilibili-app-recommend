# bundler

rollup v.s webpack
rollup branch `feat-rollup-bak`

## rollup is hard to use

rollup 需要非常多的 plugin, 而 webpack 可以靠配置做到能任何事情...

比如 typescript
比如官方的 rollup-plugin-typescript 非常差, 需要对比 `rollup-plugin-typescript2` / `rollup-plugin-esbuild` / `rollup-plugin-ts` 等等
质量参差不齐, 烦死了...

比如 less modules
可以使用 egoist/rollup-plugin-postcss, 但貌似没找到 nameConvention 配置, 其他的插件质量较差

比如 node builtin polyfills
官方文档 dead link, ionic-team 维护的 last-commit 三年前, 且使用无效.

## 速度

webpack 可以使用 `esbuild-loader` / `swc-loader` 代替 babel 来提速
minfy 也可以使用 esbuild
