// vite.config.ts
import react from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.0.7/node_modules/@vitejs/plugin-react/dist/index.mjs";
import reactSwc from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/@vitejs+plugin-react-swc@3.5.0_vite@5.0.7/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { execSync } from "child_process";
import fs from "fs";
import postcssMediaMinmax from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/postcss-media-minmax@5.0.0_postcss@8.4.32/node_modules/postcss-media-minmax/index.js";
import { visualizer } from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/rollup-plugin-visualizer@5.10.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig } from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/vite@5.0.7_@types+node@20.10.4_sass@1.69.5/node_modules/vite/dist/node/index.js";
import importer from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/vite-plugin-importer@0.2.5/node_modules/vite-plugin-importer/src/index.js";
import monkey, { cdn } from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/vite-plugin-monkey@3.5.0_vite@5.0.7/node_modules/vite-plugin-monkey/dist/node/index.mjs";
import tsconfigPaths from "file:///Users/magicdawn/projects/bilibili-app-recommend/node_modules/.pnpm/vite-tsconfig-paths@4.2.2_typescript@5.3.3_vite@5.0.7/node_modules/vite-tsconfig-paths/dist/index.mjs";

// package.json
var name = "bilibili-app-recommend";
var version = "0.19.5";

// vite.config.ts
var shouldMinify = !process.argv.includes("--no-minify");
var useHttps = process.env.MY_KEY_FILE && process.env.MY_CERT_FILE && (process.argv.includes("--https") || process.env.VITE_DEV_HTTPS);
var scriptName = name;
var downloadURL = "https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js";
if (process.env.RELEASE) {
  downloadURL = "https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.mini.user.js";
} else if (process.env.RELEASE_NIGHTLY) {
  downloadURL = "https://github.com/magicdawn/bilibili-app-recommend/raw/release-nightly/bilibili-app-recommend.mini.user.js";
}
var scriptVersion = version;
if (process.env.RELEASE) {
} else {
  const gitDescribe = process.env.GHD_DESCRIBE || execSync(`git describe`).toString().trim();
  scriptVersion = gitDescribe.slice(1);
}
var vite_config_default = defineConfig(({ command }) => ({
  define: {
    "import.meta.vitest": "undefined"
  },
  css: {
    postcss: {
      plugins: [
        // transform `@media (width >= 1000px)` => `@media (min-width: 1000px)`
        postcssMediaMinmax()
      ]
    },
    modules: {
      localsConvention: "camelCaseOnly"
    }
  },
  resolve: {
    alias: {
      // lodash: 'lodash-es',
      util: "rollup-plugin-node-polyfills/polyfills/util"
    }
  },
  // enable https, can load in safari
  // but still not available for development
  server: {
    https: useHttps ? {
      key: fs.readFileSync(process.env.MY_KEY_FILE),
      cert: fs.readFileSync(process.env.MY_CERT_FILE)
    } : void 0
  },
  build: {
    emptyOutDir: true,
    cssMinify: shouldMinify,
    minify: shouldMinify
    // target defaults `modules`, = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
    // target: ''
  },
  plugins: [
    tsconfigPaths(),
    // nodePolyfills({
    //   globals: {
    //     Buffer: false,
    //     global: false,
    //     process: false,
    //   },
    // }),
    /**
     * babel-plugin-import
     */
    command === "build" && importer({
      libraryName: "antd",
      libraryDirectory: "es"
    }),
    // import {get} from 'lodash' -> import get from 'lodash/get'
    command === "build" && importer({
      libraryName: "lodash",
      libraryDirectory: "",
      camel2DashComponentName: false
    }),
    command === "build" && importer({
      libraryName: "@icon-park/react",
      libraryDirectory: "es/icons",
      camel2DashComponentName: false
      // default: true,
    }),
    // use @vitejs/plugin-react in build
    // for use emotion babel plugin
    // https://emotion.sh/docs/babel#features-which-are-enabled-with-the-babel-plugin
    command === "serve" ? reactSwc({
      jsxImportSource: "@emotion/react"
    }) : react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    // https://github.com/lisonge/vite-plugin-monkey
    monkey({
      entry: "src/main.tsx",
      userscript: {
        name: scriptName,
        version: scriptVersion,
        namespace: "https://magicdawn.fun",
        description: "\u4E3A B \u7AD9\u9996\u9875\u6DFB\u52A0\u50CF App \u4E00\u6837\u7684\u63A8\u8350",
        icon: "https://www.bilibili.com/favicon.ico",
        // 'description': 'Add app like recommend part to bilibili homepage',
        author: "magicdawn",
        supportURL: "https://github.com/magicdawn/bilibili-app-recommend/issues",
        homepageURL: "https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend",
        downloadURL,
        license: "MIT",
        match: [
          "https://www.bilibili.com/",
          "https://www.bilibili.com/?*",
          "https://www.bilibili.com/index.html",
          "https://www.bilibili.com/index.html?*"
        ],
        connect: [
          //
          "app.bilibili.com",
          "passport.bilibili.com"
          // 'www.mcbbs.net', // for get_access_key
        ],
        grant: [
          // axios gm adapter use
          "GM.xmlHttpRequest"
        ]
      },
      server: {
        // prefix: (name) => `${name} Dev`,
        prefix: false,
        // 一样的, 避免切换
        open: true,
        mountGmApi: true
      },
      build: {
        fileName: name + (shouldMinify ? ".mini" : "") + ".user.js",
        // unpkg is not stable
        // https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/197900
        externalGlobals: {
          // https://caniuse.com/resizeobserver
          // support starts from Chrome 76
          "resize-observer-polyfill": "ResizeObserver",
          "axios": cdn.npmmirror("axios", "dist/axios.min.js"),
          "axios-userscript-adapter": cdn.npmmirror(
            "axiosGmxhrAdapter",
            "dist/axiosGmxhrAdapter.min.js"
          ),
          "react": cdn.npmmirror("React", "umd/react.production.min.js"),
          "react-dom": cdn.npmmirror("ReactDOM", "umd/react-dom.production.min.js"),
          "ua-parser-js": cdn.npmmirror("UAParser", "dist/ua-parser.min.js"),
          "framer-motion": cdn.npmmirror("Motion", "dist/framer-motion.js")
          // size:
          //     external 944kB + 36kB
          // not-external 946kB
          // antd use @emotion/* too
          // '@emotion/css': cdn.npmmirror('emotion', 'dist/emotion-css.umd.min.js'),
          // '@emotion/react': cdn.npmmirror('emotionReact', 'dist/emotion-react.umd.min.js'),
          // 'lodash': cdn.npmmirror('_', 'lodash.min.js'),
          // // ahooks use these
          // 'lodash/throttle': '_.throttle',
          // 'lodash/debounce': '_.debounce',
          // 'lodash/isEqual': '_.isEqual',
        }
      }
    }),
    // visualize
    process.env.NODE_ENV === "production" && process.argv.includes("--analyze") && visualizer({
      open: true
    })
  ].filter(Boolean)
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hZ2ljZGF3bi9wcm9qZWN0cy9iaWxpYmlsaS1hcHAtcmVjb21tZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFnaWNkYXduL3Byb2plY3RzL2JpbGliaWxpLWFwcC1yZWNvbW1lbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hZ2ljZGF3bi9wcm9qZWN0cy9iaWxpYmlsaS1hcHAtcmVjb21tZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHJlYWN0U3djIGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwb3N0Y3NzTWVkaWFNaW5tYXggZnJvbSAncG9zdGNzcy1tZWRpYS1taW5tYXgnXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBpbXBvcnRlciBmcm9tICd2aXRlLXBsdWdpbi1pbXBvcnRlcidcbmltcG9ydCBtb25rZXksIHsgY2RuIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9ua2V5J1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcbmltcG9ydCB7IG5hbWUgYXMgcGFja2FnZU5hbWUsIHZlcnNpb24gYXMgcGFja2FnZVZlcnNpb24gfSBmcm9tICcuL3BhY2thZ2UuanNvbidcblxuY29uc3Qgc2hvdWxkTWluaWZ5ID0gIXByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1uby1taW5pZnknKVxuXG5jb25zdCB1c2VIdHRwcyA9XG4gIHByb2Nlc3MuZW52Lk1ZX0tFWV9GSUxFICYmXG4gIHByb2Nlc3MuZW52Lk1ZX0NFUlRfRklMRSAmJlxuICAocHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCctLWh0dHBzJykgfHwgcHJvY2Vzcy5lbnYuVklURV9ERVZfSFRUUFMpXG5cbmNvbnN0IHNjcmlwdE5hbWUgPSBwYWNrYWdlTmFtZVxuXG5sZXQgZG93bmxvYWRVUkwgPVxuICAnaHR0cHM6Ly9ncmVhc3lmb3JrLm9yZy9zY3JpcHRzLzQ0MzUzMC1iaWxpYmlsaS1hcHAtcmVjb21tZW5kL2NvZGUvYmlsaWJpbGktYXBwLXJlY29tbWVuZC51c2VyLmpzJ1xuaWYgKHByb2Nlc3MuZW52LlJFTEVBU0UpIHtcbiAgZG93bmxvYWRVUkwgPVxuICAgICdodHRwczovL2dpdGh1Yi5jb20vbWFnaWNkYXduL2JpbGliaWxpLWFwcC1yZWNvbW1lbmQvcmF3L3JlbGVhc2UvYmlsaWJpbGktYXBwLXJlY29tbWVuZC5taW5pLnVzZXIuanMnXG59IGVsc2UgaWYgKHByb2Nlc3MuZW52LlJFTEVBU0VfTklHSFRMWSkge1xuICBkb3dubG9hZFVSTCA9XG4gICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9tYWdpY2Rhd24vYmlsaWJpbGktYXBwLXJlY29tbWVuZC9yYXcvcmVsZWFzZS1uaWdodGx5L2JpbGliaWxpLWFwcC1yZWNvbW1lbmQubWluaS51c2VyLmpzJ1xufVxuXG5sZXQgc2NyaXB0VmVyc2lvbiA9IHBhY2thZ2VWZXJzaW9uXG5pZiAocHJvY2Vzcy5lbnYuUkVMRUFTRSkge1xuICAvLyByZWxlYXNlIEFjdGlvbnNcbn0gZWxzZSB7XG4gIC8vIGxvY2FsICYgbmlnaHRseSBBY3Rpb25zXG4gIC8vIHVzZSBgZ2l0IGRlc2NyaWJlYFxuICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NTk1MzkxL2hvdy10by1zaG93LWdpdC1jb21taXQtdXNpbmctbnVtYmVyLW9mLWNvbW1pdHMtc2luY2UtYS10YWdcbiAgY29uc3QgZ2l0RGVzY3JpYmUgPSBwcm9jZXNzLmVudi5HSERfREVTQ1JJQkUgfHwgZXhlY1N5bmMoYGdpdCBkZXNjcmliZWApLnRvU3RyaW5nKCkudHJpbSgpIC8vIGUuZyB2MC4xOS4yLTYtZzAyMzA3NjlcbiAgc2NyaXB0VmVyc2lvbiA9IGdpdERlc2NyaWJlLnNsaWNlKDEpIC8vIHJtIHByZWZpeCB2XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCB9KSA9PiAoe1xuICBkZWZpbmU6IHtcbiAgICAnaW1wb3J0Lm1ldGEudml0ZXN0JzogJ3VuZGVmaW5lZCcsXG4gIH0sXG5cbiAgY3NzOiB7XG4gICAgcG9zdGNzczoge1xuICAgICAgcGx1Z2luczogW1xuICAgICAgICAvLyB0cmFuc2Zvcm0gYEBtZWRpYSAod2lkdGggPj0gMTAwMHB4KWAgPT4gYEBtZWRpYSAobWluLXdpZHRoOiAxMDAwcHgpYFxuICAgICAgICBwb3N0Y3NzTWVkaWFNaW5tYXgoKSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBtb2R1bGVzOiB7XG4gICAgICBsb2NhbHNDb252ZW50aW9uOiAnY2FtZWxDYXNlT25seScsXG4gICAgfSxcbiAgfSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIGxvZGFzaDogJ2xvZGFzaC1lcycsXG4gICAgICB1dGlsOiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvdXRpbCcsXG4gICAgfSxcbiAgfSxcblxuICAvLyBlbmFibGUgaHR0cHMsIGNhbiBsb2FkIGluIHNhZmFyaVxuICAvLyBidXQgc3RpbGwgbm90IGF2YWlsYWJsZSBmb3IgZGV2ZWxvcG1lbnRcbiAgc2VydmVyOiB7XG4gICAgaHR0cHM6IHVzZUh0dHBzXG4gICAgICA/IHtcbiAgICAgICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYyhwcm9jZXNzLmVudi5NWV9LRVlfRklMRSEpLFxuICAgICAgICAgIGNlcnQ6IGZzLnJlYWRGaWxlU3luYyhwcm9jZXNzLmVudi5NWV9DRVJUX0ZJTEUhKSxcbiAgICAgICAgfVxuICAgICAgOiB1bmRlZmluZWQsXG4gIH0sXG5cbiAgYnVpbGQ6IHtcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICBjc3NNaW5pZnk6IHNob3VsZE1pbmlmeSxcbiAgICBtaW5pZnk6IHNob3VsZE1pbmlmeSxcbiAgICAvLyB0YXJnZXQgZGVmYXVsdHMgYG1vZHVsZXNgLCA9IFsnZXMyMDIwJywgJ2VkZ2U4OCcsICdmaXJlZm94NzgnLCAnY2hyb21lODcnLCAnc2FmYXJpMTQnXVxuICAgIC8vIHRhcmdldDogJydcbiAgfSxcblxuICBwbHVnaW5zOiBbXG4gICAgdHNjb25maWdQYXRocygpLFxuXG4gICAgLy8gbm9kZVBvbHlmaWxscyh7XG4gICAgLy8gICBnbG9iYWxzOiB7XG4gICAgLy8gICAgIEJ1ZmZlcjogZmFsc2UsXG4gICAgLy8gICAgIGdsb2JhbDogZmFsc2UsXG4gICAgLy8gICAgIHByb2Nlc3M6IGZhbHNlLFxuICAgIC8vICAgfSxcbiAgICAvLyB9KSxcblxuICAgIC8qKlxuICAgICAqIGJhYmVsLXBsdWdpbi1pbXBvcnRcbiAgICAgKi9cbiAgICBjb21tYW5kID09PSAnYnVpbGQnICYmXG4gICAgICBpbXBvcnRlcih7XG4gICAgICAgIGxpYnJhcnlOYW1lOiAnYW50ZCcsXG4gICAgICAgIGxpYnJhcnlEaXJlY3Rvcnk6ICdlcycsXG4gICAgICB9KSxcblxuICAgIC8vIGltcG9ydCB7Z2V0fSBmcm9tICdsb2Rhc2gnIC0+IGltcG9ydCBnZXQgZnJvbSAnbG9kYXNoL2dldCdcbiAgICBjb21tYW5kID09PSAnYnVpbGQnICYmXG4gICAgICBpbXBvcnRlcih7XG4gICAgICAgIGxpYnJhcnlOYW1lOiAnbG9kYXNoJyxcbiAgICAgICAgbGlicmFyeURpcmVjdG9yeTogJycsXG4gICAgICAgIGNhbWVsMkRhc2hDb21wb25lbnROYW1lOiBmYWxzZSxcbiAgICAgIH0pLFxuXG4gICAgY29tbWFuZCA9PT0gJ2J1aWxkJyAmJlxuICAgICAgaW1wb3J0ZXIoe1xuICAgICAgICBsaWJyYXJ5TmFtZTogJ0BpY29uLXBhcmsvcmVhY3QnLFxuICAgICAgICBsaWJyYXJ5RGlyZWN0b3J5OiAnZXMvaWNvbnMnLFxuICAgICAgICBjYW1lbDJEYXNoQ29tcG9uZW50TmFtZTogZmFsc2UsIC8vIGRlZmF1bHQ6IHRydWUsXG4gICAgICB9KSxcblxuICAgIC8vIHVzZSBAdml0ZWpzL3BsdWdpbi1yZWFjdCBpbiBidWlsZFxuICAgIC8vIGZvciB1c2UgZW1vdGlvbiBiYWJlbCBwbHVnaW5cbiAgICAvLyBodHRwczovL2Vtb3Rpb24uc2gvZG9jcy9iYWJlbCNmZWF0dXJlcy13aGljaC1hcmUtZW5hYmxlZC13aXRoLXRoZS1iYWJlbC1wbHVnaW5cbiAgICBjb21tYW5kID09PSAnc2VydmUnXG4gICAgICA/IHJlYWN0U3djKHtcbiAgICAgICAgICBqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCcsXG4gICAgICAgIH0pXG4gICAgICA6IHJlYWN0KHtcbiAgICAgICAgICBqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCcsXG4gICAgICAgICAgYmFiZWw6IHtcbiAgICAgICAgICAgIHBsdWdpbnM6IFsnQGVtb3Rpb24vYmFiZWwtcGx1Z2luJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbGlzb25nZS92aXRlLXBsdWdpbi1tb25rZXlcbiAgICBtb25rZXkoe1xuICAgICAgZW50cnk6ICdzcmMvbWFpbi50c3gnLFxuICAgICAgdXNlcnNjcmlwdDoge1xuICAgICAgICBuYW1lOiBzY3JpcHROYW1lLFxuICAgICAgICB2ZXJzaW9uOiBzY3JpcHRWZXJzaW9uLFxuICAgICAgICBuYW1lc3BhY2U6ICdodHRwczovL21hZ2ljZGF3bi5mdW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NEUzQSBCIFx1N0FEOVx1OTk5Nlx1OTg3NVx1NkRGQlx1NTJBMFx1NTBDRiBBcHAgXHU0RTAwXHU2ODM3XHU3Njg0XHU2M0E4XHU4MzUwJyxcbiAgICAgICAgaWNvbjogJ2h0dHBzOi8vd3d3LmJpbGliaWxpLmNvbS9mYXZpY29uLmljbycsXG4gICAgICAgIC8vICdkZXNjcmlwdGlvbic6ICdBZGQgYXBwIGxpa2UgcmVjb21tZW5kIHBhcnQgdG8gYmlsaWJpbGkgaG9tZXBhZ2UnLFxuICAgICAgICBhdXRob3I6ICdtYWdpY2Rhd24nLFxuICAgICAgICBzdXBwb3J0VVJMOiAnaHR0cHM6Ly9naXRodWIuY29tL21hZ2ljZGF3bi9iaWxpYmlsaS1hcHAtcmVjb21tZW5kL2lzc3VlcycsXG4gICAgICAgIGhvbWVwYWdlVVJMOiAnaHR0cHM6Ly9ncmVhc3lmb3JrLm9yZy96aC1DTi9zY3JpcHRzLzQ0MzUzMC1iaWxpYmlsaS1hcHAtcmVjb21tZW5kJyxcbiAgICAgICAgZG93bmxvYWRVUkwsXG4gICAgICAgIGxpY2Vuc2U6ICdNSVQnLFxuICAgICAgICBtYXRjaDogW1xuICAgICAgICAgICdodHRwczovL3d3dy5iaWxpYmlsaS5jb20vJyxcbiAgICAgICAgICAnaHR0cHM6Ly93d3cuYmlsaWJpbGkuY29tLz8qJyxcbiAgICAgICAgICAnaHR0cHM6Ly93d3cuYmlsaWJpbGkuY29tL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICdodHRwczovL3d3dy5iaWxpYmlsaS5jb20vaW5kZXguaHRtbD8qJyxcbiAgICAgICAgXSxcbiAgICAgICAgY29ubmVjdDogW1xuICAgICAgICAgIC8vXG4gICAgICAgICAgJ2FwcC5iaWxpYmlsaS5jb20nLFxuICAgICAgICAgICdwYXNzcG9ydC5iaWxpYmlsaS5jb20nLFxuICAgICAgICAgIC8vICd3d3cubWNiYnMubmV0JywgLy8gZm9yIGdldF9hY2Nlc3Nfa2V5XG4gICAgICAgIF0sXG4gICAgICAgIGdyYW50OiBbXG4gICAgICAgICAgLy8gYXhpb3MgZ20gYWRhcHRlciB1c2VcbiAgICAgICAgICAnR00ueG1sSHR0cFJlcXVlc3QnLFxuICAgICAgICBdLFxuICAgICAgfSxcblxuICAgICAgc2VydmVyOiB7XG4gICAgICAgIC8vIHByZWZpeDogKG5hbWUpID0+IGAke25hbWV9IERldmAsXG4gICAgICAgIHByZWZpeDogZmFsc2UsIC8vIFx1NEUwMFx1NjgzN1x1NzY4NCwgXHU5MDdGXHU1MTREXHU1MjA3XHU2MzYyXG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIG1vdW50R21BcGk6IHRydWUsXG4gICAgICB9LFxuXG4gICAgICBidWlsZDoge1xuICAgICAgICBmaWxlTmFtZTogcGFja2FnZU5hbWUgKyAoc2hvdWxkTWluaWZ5ID8gJy5taW5pJyA6ICcnKSArICcudXNlci5qcycsXG5cbiAgICAgICAgLy8gdW5wa2cgaXMgbm90IHN0YWJsZVxuICAgICAgICAvLyBodHRwczovL2dyZWFzeWZvcmsub3JnL3poLUNOL3NjcmlwdHMvNDQzNTMwLWJpbGliaWxpLWFwcC1yZWNvbW1lbmQvZGlzY3Vzc2lvbnMvMTk3OTAwXG5cbiAgICAgICAgZXh0ZXJuYWxHbG9iYWxzOiB7XG4gICAgICAgICAgLy8gaHR0cHM6Ly9jYW5pdXNlLmNvbS9yZXNpemVvYnNlcnZlclxuICAgICAgICAgIC8vIHN1cHBvcnQgc3RhcnRzIGZyb20gQ2hyb21lIDc2XG4gICAgICAgICAgJ3Jlc2l6ZS1vYnNlcnZlci1wb2x5ZmlsbCc6ICdSZXNpemVPYnNlcnZlcicsXG5cbiAgICAgICAgICAnYXhpb3MnOiBjZG4ubnBtbWlycm9yKCdheGlvcycsICdkaXN0L2F4aW9zLm1pbi5qcycpLFxuICAgICAgICAgICdheGlvcy11c2Vyc2NyaXB0LWFkYXB0ZXInOiBjZG4ubnBtbWlycm9yKFxuICAgICAgICAgICAgJ2F4aW9zR214aHJBZGFwdGVyJyxcbiAgICAgICAgICAgICdkaXN0L2F4aW9zR214aHJBZGFwdGVyLm1pbi5qcydcbiAgICAgICAgICApLFxuICAgICAgICAgICdyZWFjdCc6IGNkbi5ucG1taXJyb3IoJ1JlYWN0JywgJ3VtZC9yZWFjdC5wcm9kdWN0aW9uLm1pbi5qcycpLFxuICAgICAgICAgICdyZWFjdC1kb20nOiBjZG4ubnBtbWlycm9yKCdSZWFjdERPTScsICd1bWQvcmVhY3QtZG9tLnByb2R1Y3Rpb24ubWluLmpzJyksXG4gICAgICAgICAgJ3VhLXBhcnNlci1qcyc6IGNkbi5ucG1taXJyb3IoJ1VBUGFyc2VyJywgJ2Rpc3QvdWEtcGFyc2VyLm1pbi5qcycpLFxuICAgICAgICAgICdmcmFtZXItbW90aW9uJzogY2RuLm5wbW1pcnJvcignTW90aW9uJywgJ2Rpc3QvZnJhbWVyLW1vdGlvbi5qcycpLFxuXG4gICAgICAgICAgLy8gc2l6ZTpcbiAgICAgICAgICAvLyAgICAgZXh0ZXJuYWwgOTQ0a0IgKyAzNmtCXG4gICAgICAgICAgLy8gbm90LWV4dGVybmFsIDk0NmtCXG4gICAgICAgICAgLy8gYW50ZCB1c2UgQGVtb3Rpb24vKiB0b29cbiAgICAgICAgICAvLyAnQGVtb3Rpb24vY3NzJzogY2RuLm5wbW1pcnJvcignZW1vdGlvbicsICdkaXN0L2Vtb3Rpb24tY3NzLnVtZC5taW4uanMnKSxcbiAgICAgICAgICAvLyAnQGVtb3Rpb24vcmVhY3QnOiBjZG4ubnBtbWlycm9yKCdlbW90aW9uUmVhY3QnLCAnZGlzdC9lbW90aW9uLXJlYWN0LnVtZC5taW4uanMnKSxcblxuICAgICAgICAgIC8vICdsb2Rhc2gnOiBjZG4ubnBtbWlycm9yKCdfJywgJ2xvZGFzaC5taW4uanMnKSxcbiAgICAgICAgICAvLyAvLyBhaG9va3MgdXNlIHRoZXNlXG4gICAgICAgICAgLy8gJ2xvZGFzaC90aHJvdHRsZSc6ICdfLnRocm90dGxlJyxcbiAgICAgICAgICAvLyAnbG9kYXNoL2RlYm91bmNlJzogJ18uZGVib3VuY2UnLFxuICAgICAgICAgIC8vICdsb2Rhc2gvaXNFcXVhbCc6ICdfLmlzRXF1YWwnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIHZpc3VhbGl6ZVxuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiZcbiAgICAgIHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1hbmFseXplJykgJiZcbiAgICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxufSkpXG4iLCAie1xuICBcIm5hbWVcIjogXCJiaWxpYmlsaS1hcHAtcmVjb21tZW5kXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMTkuNVwiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJwcmVwYXJlXCI6IFwiaHVza3kgaW5zdGFsbFwiLFxuICAgIFwiZGV2OnNjc3NcIjogXCJ0eXBlZC1zY3NzLW1vZHVsZXMgc3JjIC0td2F0Y2hcIixcbiAgICBcImRldjp2aXRlXCI6IFwidml0ZVwiLFxuICAgIFwiZGV2XCI6IFwiY29uY3VycmVudGx5IC1rIG5wbTpkZXY6KlwiLFxuICAgIFwidHlwZWNoZWNrXCI6IFwidHNjIC0tbm9FbWl0XCIsXG4gICAgXCJidWlsZDpzY3NzXCI6IFwidHlwZWQtc2Nzcy1tb2R1bGVzIHNyY1wiLFxuICAgIFwiYnVpbGQ6dml0ZVwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcIi8vXCI6IFwiLy9cIixcbiAgICBcImJ1aWxkOnJlYWwtYnVpbGRcIjogXCJ0dXJibyBidWlsZDpzY3NzIHR5cGVjaGVjayBidWlsZDp2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInBucG0gYnVpbGQ6cmVhbC1idWlsZCAmJiBwbnBtIHByZXZpZXdcIixcbiAgICBcImJ1aWxkOnZpdGUtcmF3XCI6IFwidml0ZSBidWlsZCAtLSAtLW5vLW1pbmlmeVwiLFxuICAgIFwiYnVpbGQ6dml0ZS1hbmFseXplXCI6IFwidml0ZSBidWlsZCAtLSAtLW5vLW1pbmlmeSAtLWFuYWx5emVcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInRlc3RcIjogXCJ2aXRlc3RcIixcbiAgICBcInRlc3Q6dWlcIjogXCJ2aXRlc3QgLS11aVwiLFxuICAgIFwiY292ZXJhZ2VcIjogXCJ2aXRlc3QgcnVuIC0tY292ZXJhZ2VcIlxuICB9LFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGVtb3Rpb24vYmFiZWwtcGx1Z2luXCI6IFwiXjExLjExLjBcIixcbiAgICBcIkBtYWdpY2Rhd24vcHJldHRpZXItY29uZmlnXCI6IFwiXjAuMC4zXCIsXG4gICAgXCJAc3R5bGVkL3R5cGVzY3JpcHQtc3R5bGVkLXBsdWdpblwiOiBcIl4xLjAuMFwiLFxuICAgIFwiQHR5cGVzL2RlYnVnXCI6IFwiXjQuMS4xMlwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIjQuMTQuMjAyXCIsXG4gICAgXCJAdHlwZXMvbWQ1XCI6IFwiXjIuMy41XCIsXG4gICAgXCJAdHlwZXMvbXNcIjogXCJeMC43LjM0XCIsXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIjIwLjEwLjRcIixcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIjE4LjIuNDJcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCIxOC4yLjE3XCIsXG4gICAgXCJAdHlwZXMvdWEtcGFyc2VyLWpzXCI6IFwiXjAuNy4zOVwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjogXCJeNi4xMy4yXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyXCI6IFwiXjYuMTMuMlwiLFxuICAgIFwiQHZpb2xlbnRtb25rZXkvdHlwZXNcIjogXCJeMC4xLjdcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMi4xXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjogXCJeMy41LjBcIixcbiAgICBcIkB2aXRlc3QvdWlcIjogXCJeMS4wLjJcIixcbiAgICBcImNoYWxrXCI6IFwiXjUuMy4wXCIsXG4gICAgXCJjb25jdXJyZW50bHlcIjogXCJeOC4yLjJcIixcbiAgICBcImRsLXZhbXBpcmVcIjogXCJeMi4wLjBcIixcbiAgICBcImVzbGludFwiOiBcIl44LjU1LjBcIixcbiAgICBcImVzbGludC1jb25maWctcHJldHRpZXJcIjogXCJeOS4xLjBcIixcbiAgICBcImVzbS11dGlsc1wiOiBcIl40LjIuMVwiLFxuICAgIFwiaHVza3lcIjogXCJeOC4wLjNcIixcbiAgICBcImtuaXBcIjogXCJeMy42LjBcIixcbiAgICBcImxpbnQtc3RhZ2VkXCI6IFwiXjE1LjIuMFwiLFxuICAgIFwib3BlblwiOiBcIl45LjEuMFwiLFxuICAgIFwicG9zdGNzcy1tZWRpYS1taW5tYXhcIjogXCJeNS4wLjBcIixcbiAgICBcInByZXR0aWVyXCI6IFwiXjMuMS4wXCIsXG4gICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzXCI6IFwiXjAuMi4xXCIsXG4gICAgXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjogXCJeNS4xMC4wXCIsXG4gICAgXCJzYXNzXCI6IFwiXjEuNjkuNVwiLFxuICAgIFwidHVyYm9cIjogXCJeMS4xMS4xXCIsXG4gICAgXCJ0eXBlLWZlc3RcIjogXCJeNC44LjNcIixcbiAgICBcInR5cGVkLXNjc3MtbW9kdWxlc1wiOiBcIl44LjAuMFwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxuICAgIFwidml0ZVwiOiBcIl41LjAuN1wiLFxuICAgIFwidml0ZS1wbHVnaW4taW1wb3J0ZXJcIjogXCJeMC4yLjVcIixcbiAgICBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjogXCJeMC44LjFcIixcbiAgICBcInZpdGUtcGx1Z2luLW1vbmtleVwiOiBcIl4zLjUuMFwiLFxuICAgIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiOiBcIl40LjIuMlwiLFxuICAgIFwidml0ZXN0XCI6IFwiXjEuMC4yXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGRuZC1raXQvY29yZVwiOiBcIl42LjEuMFwiLFxuICAgIFwiQGRuZC1raXQvbW9kaWZpZXJzXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJAZG5kLWtpdC9zb3J0YWJsZVwiOiBcIl44LjAuMFwiLFxuICAgIFwiQGRuZC1raXQvdXRpbGl0aWVzXCI6IFwiXjMuMi4yXCIsXG4gICAgXCJAZW1vdGlvbi9jc3NcIjogXCJeMTEuMTEuMlwiLFxuICAgIFwiQGVtb3Rpb24vcmVhY3RcIjogXCJeMTEuMTEuMVwiLFxuICAgIFwiQGljb24tcGFyay9yZWFjdFwiOiBcIl4xLjQuMlwiLFxuICAgIFwiQG1nZG4vYnZpZFwiOiBcIl4wLjEuMFwiLFxuICAgIFwiQHRvdGFsLXR5cGVzY3JpcHQvdHMtcmVzZXRcIjogXCJeMC41LjFcIixcbiAgICBcImFob29rc1wiOiBcIjMuNy44XCIsXG4gICAgXCJhbnRkXCI6IFwiXjUuMTIuMVwiLFxuICAgIFwiYXhpb3NcIjogXCIwXCIsXG4gICAgXCJheGlvcy11c2Vyc2NyaXB0LWFkYXB0ZXJcIjogXCIwXCIsXG4gICAgXCJjbGFzc25hbWVzXCI6IFwiXjIuMy4yXCIsXG4gICAgXCJkYXlqc1wiOiBcIjEuMTEuMTBcIixcbiAgICBcImRlYnVnXCI6IFwiXjQuMy40XCIsXG4gICAgXCJkZWxheVwiOiBcIl42LjAuMFwiLFxuICAgIFwiZnJhbWVyLW1vdGlvblwiOiBcIl4xMC4xNi4xNVwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcImxvZGFzaC1lc1wiOiBcIl40LjE3LjIxXCIsXG4gICAgXCJtZDVcIjogXCJeMi4zLjBcIixcbiAgICBcIm1pdHRcIjogXCJeMy4wLjFcIixcbiAgICBcIm1zXCI6IFwiXjIuMS4zXCIsXG4gICAgXCJwLWV2ZW50XCI6IFwiXjYuMC4wXCIsXG4gICAgXCJwcm9taXNlLnJldHJ5XCI6IFwiXjEuMS4xXCIsXG4gICAgXCJxcmNvZGUucmVhY3RcIjogXCJeMy4xLjBcIixcbiAgICBcInF1aWNrLWxydVwiOiBcIl43LjAuMFwiLFxuICAgIFwicmVhY3RcIjogXCIxOC4yLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIjE4LjIuMFwiLFxuICAgIFwicmVhY3QtaW50ZXJzZWN0aW9uLW9ic2VydmVyXCI6IFwiXjkuNS4zXCIsXG4gICAgXCJyZWFjdC12aXJ0dW9zb1wiOiBcIl40LjYuMlwiLFxuICAgIFwidWEtcGFyc2VyLWpzXCI6IFwiXjEuMC4zN1wiLFxuICAgIFwidmFsdGlvXCI6IFwiXjEuMTIuMVwiXG4gIH0sXG4gIFwibGludC1zdGFnZWRcIjoge1xuICAgIFwiKi57anMsanN4LHRzLHRzeH1cIjogW1xuICAgICAgXCJlc2xpbnQgLS1maXhcIixcbiAgICAgIFwicHJldHRpZXIgLS13cml0ZVwiXG4gICAgXSxcbiAgICBcIioue2xlc3Msc2NzcyxtZH1cIjogW1xuICAgICAgXCJwcmV0dGllciAtLXdyaXRlXCJcbiAgICBdXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1UsT0FBTyxXQUFXO0FBQ3BWLE9BQU8sY0FBYztBQUNyQixTQUFTLGdCQUFnQjtBQUN6QixPQUFPLFFBQVE7QUFDZixPQUFPLHdCQUF3QjtBQUMvQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGNBQWM7QUFDckIsT0FBTyxVQUFVLFdBQVc7QUFDNUIsT0FBTyxtQkFBbUI7OztBQ1J4QixXQUFRO0FBQ1IsY0FBVzs7O0FEVWIsSUFBTSxlQUFlLENBQUMsUUFBUSxLQUFLLFNBQVMsYUFBYTtBQUV6RCxJQUFNLFdBQ0osUUFBUSxJQUFJLGVBQ1osUUFBUSxJQUFJLGlCQUNYLFFBQVEsS0FBSyxTQUFTLFNBQVMsS0FBSyxRQUFRLElBQUk7QUFFbkQsSUFBTSxhQUFhO0FBRW5CLElBQUksY0FDRjtBQUNGLElBQUksUUFBUSxJQUFJLFNBQVM7QUFDdkIsZ0JBQ0U7QUFDSixXQUFX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
