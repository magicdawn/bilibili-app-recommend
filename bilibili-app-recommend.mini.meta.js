// ==UserScript==
// @name         bilibili-app-recommend
// @namespace    https://magicdawn.fun
// @version      0.24.3
// @author       magicdawn
// @description  为 B 站首页添加像 App 一样的推荐
// @license      MIT
// @icon         https://www.bilibili.com/favicon.ico
// @homepageURL  https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend
// @supportURL   https://github.com/magicdawn/bilibili-app-recommend/issues
// @downloadURL  https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.mini.user.js
// @updateURL    https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.mini.meta.js
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/?*
// @match        https://www.bilibili.com/index.html
// @match        https://www.bilibili.com/index.html?*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/watchlater?*
// @match        https://www.bilibili.com/bangumi/play/*
// @require      https://registry.npmmirror.com/axios/0.27.2/files/dist/axios.min.js
// @require      https://registry.npmmirror.com/axios-userscript-adapter/0.2.0/files/dist/axiosGmxhrAdapter.min.js
// @require      https://registry.npmmirror.com/react/18.3.1/files/umd/react.production.min.js
// @require      https://registry.npmmirror.com/react-dom/18.3.1/files/umd/react-dom.production.min.js
// @require      https://registry.npmmirror.com/ua-parser-js/1.0.38/files/dist/ua-parser.min.js
// @require      https://registry.npmmirror.com/framer-motion/11.2.12/files/dist/framer-motion.js
// @require      https://registry.npmmirror.com/localforage/1.10.0/files/dist/localforage.min.js
// @connect      app.bilibili.com
// @grant        GM.getValue
// @grant        GM.openInTab
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @grant        window.focus
// ==/UserScript==