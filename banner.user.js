// ==UserScript==
// @name                bilibili-app-recommend
// @namespace           https://magicdawn.fun
// @version             0.0.1
// @description         Add app like recommend part to bilibili homepage
// @description:zh-CN   为B站首页添加像App一样的推荐
// @author              magicdawn
// @supportURL          https://github.com/magicdawn/bilibili-app-recommend/issues
// @homepageURL         https://github.com/magicdawn/bilibili-app-recommend
// @downloadURL         https://greasyfork.org/scripts/443530-bilibili-app-recommend/code/bilibili-app-recommend.user.js
//
// @grant               GM_registerMenuCommand
// @grant               GM_notification
// @grant               unsafeWindow
// @grant               GM_xmlhttpRequest
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM_deleteValue
// @grant               GM_addElement
// @grant               GM.xmlHttpRequest
//
// @match               *://www.bilibili.com/*
// @include             https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*
//
// @connect             app.bilibili.com
// @connect             passport.bilibili.com
// @connect             link.acg.tv
// @connect             www.mcbbs.net
//
// @require             https://cdn.jsdelivr.net/npm/axios@0.22.0/dist/axios.min.js
// @require             https://cdn.jsdelivr.net/npm/axios-userscript-adapter@0.1.11/dist/axiosGmxhrAdapter.min.js
// @require             https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// @require             https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js
// @require             https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js
//
// @license             MIT
// ==/UserScript==
