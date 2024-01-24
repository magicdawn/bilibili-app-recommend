// ==UserScript==
// @name         bilibili-app-recommend
// @namespace    https://magicdawn.fun
// @version      0.20.2
// @author       magicdawn
// @description  为 B 站首页添加像 App 一样的推荐
// @license      MIT
// @icon         https://www.bilibili.com/favicon.ico
// @homepageURL  https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend
// @supportURL   https://github.com/magicdawn/bilibili-app-recommend/issues
// @downloadURL  https://github.com/magicdawn/bilibili-app-recommend/raw/release/bilibili-app-recommend.user.js
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/?*
// @match        https://www.bilibili.com/index.html
// @match        https://www.bilibili.com/index.html?*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/watchlater?*
// @require      https://registry.npmmirror.com/axios/0.27.2/files/dist/axios.min.js
// @require      https://registry.npmmirror.com/axios-userscript-adapter/0.2.0/files/dist/axiosGmxhrAdapter.min.js
// @require      https://registry.npmmirror.com/react/18.2.0/files/umd/react.production.min.js
// @require      https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.production.min.js
// @require      https://registry.npmmirror.com/ua-parser-js/1.0.37/files/dist/ua-parser.min.js
// @require      https://registry.npmmirror.com/framer-motion/10.18.0/files/dist/framer-motion.js
// @require      https://registry.npmmirror.com/lodash/4.17.21/files/lodash.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.10/files/dayjs.min.js
// @require      https://registry.npmmirror.com/dayjs/1.11.10/files/plugin/duration.js
// @require      https://registry.npmmirror.com/antd/5.13.2/files/dist/antd-with-locales.min.js
// @connect      app.bilibili.com
// @connect      passport.bilibili.com
// @grant        GM.getValue
// @grant        GM.openInTab
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(n=>{if(typeof GM_addStyle=="function"){GM_addStyle(n);return}const i=document.createElement("style");i.textContent=n,document.head.append(i)})(` @charset "UTF-8";.primary-btn:disabled:active, .primary-btn:disabled:hover {
  cursor: wait;
  background-color: inherit;
}

.ant-btn {
  font-size: 13px;
  line-height: 24px;
}
.ant-btn:disabled {
  cursor: wait;
}

.ant-radio-button-wrapper-disabled {
  cursor: wait;
}

body .ant-tooltip a {
  color: #1677ff;
  transition: color 0.3s;
}
body .ant-tooltip a:visited {
  color: #1677ff;
}
body .ant-tooltip a:hover {
  color: #69b1ff;
}
body .ant-tooltip a:active {
  color: #0958d9;
}

body button:where(.ant-switch):focus, body button:where(.ant-switch):active {
  background-color: rgba(0, 0, 0, 0.25);
  outline: unset;
}

.ant-message-custom-content [role=img] {
  position: relative;
  top: -2px;
}.i-icon{display:inline-block;color:inherit;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-.125em;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.i-icon-spin svg{animation:i-icon-spin 1s infinite linear}.i-icon-rtl{transform:scaleX(-1)}@keyframes i-icon-spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes i-icon-spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}._modal-mask_1wljt_1 {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
}

._modal_1wljt_1 {
  width: 500px;
  max-height: calc(90vh - 50px);
  background-color: #fff;
  border-radius: 10px;
  padding: 0 15px 15px 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

._modal-header_1wljt_25 {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: none;
  display: flex;
  align-items: center;
}

._modal-body_1wljt_33 {
  padding-top: 0;
  flex-grow: 1;
  overflow-y: scroll;
}

._modal-title_1wljt_39 {
  font-size: 1.5rem;
  margin-bottom: 0;
  line-height: 1.5;
  display: flex;
  align-items: center;
}

._btn-close_1wljt_47 {
  margin-left: 10px;
}
._btn-close_1wljt_47 svg {
  width: 10px;
  height: 10px;
  margin-right: 3px;
  margin-top: -1px;
}
body.dark ._btn-close_1wljt_47 {
  color: #eee !important;
  background-color: #333 !important;
  border-color: transparent !important;
  height: auto;
  padding: 8px 12px;
  line-height: 16px;
  font-size: 13px;
}._bili-video-card_1ox5o_1 {
  position: relative;
}
._bili-video-card_1ox5o_1 .bili-video-card__stats--item {
  margin-right: 8px;
}

._preview-card-wrapper_1ox5o_8 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  overflow: hidden;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
._preview-card-wrapper_1ox5o_8 ._preview-card-inner_1ox5o_21 {
  width: 100%;
  height: 100%;
}

._btn-dislike_1ox5o_26 {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  background-color: rgba(33, 33, 33, 0.8);
  transform: translateZ(0);
  z-index: 5;
}
._btn-dislike_1ox5o_26 ._btn-dislike-icon_1ox5o_41 {
  pointer-events: none;
  user-select: none;
  color: #fff;
  width: 12px;
  height: 12px;
}
._btn-dislike_1ox5o_26 ._btn-dislike-tip_1ox5o_48 {
  position: absolute;
  bottom: -6px;
  left: -5px;
  pointer-events: none;
  user-select: none;
  transform: translateY(100%);
  font-size: 12px;
  color: #fff;
  border-radius: 4px;
  line-height: 18px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

._watch-later_1ox5o_64 {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  background-color: rgba(33, 33, 33, 0.8);
  transform: translateZ(0);
  z-index: 5;
}
._watch-later_1ox5o_64 ._watch-later-icon_1ox5o_79 {
  pointer-events: none;
  user-select: none;
  color: #fff;
  width: 22px;
  height: 22px;
}
._watch-later_1ox5o_64 ._watch-later-tip_1ox5o_86 {
  position: absolute;
  bottom: -6px;
  right: -5px;
  pointer-events: none;
  user-select: none;
  transform: translateY(100%);
  font-size: 12px;
  color: #fff;
  border-radius: 4px;
  line-height: 18px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

._badge_1ox5o_102 {
  color: #fa6a9d;
  border-radius: 2px;
  border: 1px #fa6a9d solid;
  line-height: 20px;
  padding: 0 10px;
  transform: scale(0.8);
  transform-origin: center left;
}

._recommend-reason_1ox5o_112 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
  color: var(--Or5);
  background-color: var(--Or1);
  border-radius: 4px;
  margin-right: 4px;
  font-size: var(--follow-icon-font-size);
  line-height: var(--follow-icon-line-height);
  height: var(--follow-icon-line-height);
  padding: 0 4px;
  cursor: default;
}

._bangumi-desc_1ox5o_128 {
  color: default;
}

._disliked-wrapper_1ox5o_132 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--video-card-border-radius);
  border: 1px solid #eee;
}
body.dark ._disliked-wrapper_1ox5o_132 {
  border: 1px solid #333;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-cover_1ox5o_146 {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding-top: 56.25%;
  position: relative;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-cover_1ox5o_146 ._dislike-content-cover-inner_1ox5o_152 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-cover_1ox5o_146 ._dislike-content-cover-inner_1ox5o_152 ._dislike-icon_1ox5o_163 {
  margin-bottom: 5px;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-cover_1ox5o_146 ._dislike-content-cover-inner_1ox5o_152 ._dislike-reason_1ox5o_166 {
  font-size: 20px;
  text-align: center;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-cover_1ox5o_146 ._dislike-content-cover-inner_1ox5o_152 ._dislike-desc_1ox5o_170 {
  font-size: 16px;
  text-align: center;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-action_1ox5o_174 {
  flex: 1;
  width: 100%;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
body.dark ._disliked-wrapper_1ox5o_132 ._dislike-content-action_1ox5o_174 {
  border-top: 1px solid #333;
}
._disliked-wrapper_1ox5o_132 ._dislike-content-action_1ox5o_174 button {
  font-size: 16px;
  color: inherit;
  display: flex;
  align-items: center;
}

body .bili-video-card__skeleton--cover, body .bili-video-card__skeleton--text, body .bili-video-card__skeleton--light, body .bili-video-card__skeleton--avatar {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.06) 25%, rgba(0, 0, 0, 0.15) 37%, rgba(0, 0, 0, 0.06) 63%);
}
body.dark .bili-video-card__skeleton--avatar {
  background-color: #444;
}
.bili-video-card__skeleton--text.tiny {
  margin-top: 4px;
  width: 15%;
}

._skeleton-active_1ox5o_206 .bili-video-card__skeleton--cover,
._skeleton-active_1ox5o_206 .bili-video-card__skeleton--text,
._skeleton-active_1ox5o_206 .bili-video-card__skeleton--light,
._skeleton-active_1ox5o_206 .bili-video-card__skeleton--avatar {
  background-size: 400% 100%;
  animation-name: _ant-skeleton-loading_1ox5o_1;
  animation-duration: 2.165s;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
}

@keyframes _ant-skeleton-loading_1ox5o_1 {
  0% {
    background-position: 100% 50%;
  }
  61.8%, 100% {
    background-position: 0 50%;
  }
}
/**
 * \u65B0\u7248\u9996\u9875
 * \u4F7F\u7528\u7684\u662F .video-card-body \u7684\u6837\u5F0F
 * \u5728B\u7AD9\u81EA\u5DF1\u7684\u9996\u9875\u4E2D, .bili-grid > 2200px \u662F\u5206 7 \u5217, .video-card-body > 2200px \u52066\u5217
 */
._video-grid_wfxpc_7 {
  --video-card-border-radius: 6px;
  display: grid;
  position: relative;
  width: 100%;
  grid-gap: 20px 12px;
  grid-template-columns: repeat(var(--col), minmax(0, 1fr));
}

@media (max-width: 1099.9px) {
  ._video-grid-new-homepage_wfxpc_17 {
    --col: 4;
  }
  ._video-grid-new-homepage_wfxpc_17._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 9) {
    display: none !important;
  }
}
@media (min-width: 1100px) and (max-width: 1700.9px) {
  ._video-grid-new-homepage_wfxpc_17 {
    --col: 5;
  }
  ._video-grid-new-homepage_wfxpc_17._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 11) {
    display: none !important;
  }
}
@media (min-width: 1701px) and (max-width: 2199.9px) {
  ._video-grid-new-homepage_wfxpc_17 {
    --col: 6;
  }
  ._video-grid-new-homepage_wfxpc_17._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 13) {
    display: none !important;
  }
}
@media (min-width: 2200px) {
  ._video-grid-new-homepage_wfxpc_17 {
    --col: 7;
  }
  ._video-grid-new-homepage_wfxpc_17._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 15) {
    display: none !important;
  }
}
/**
 * \u5185\u6D4B\u9996\u9875
 * \u53D6\u81EA .battle-feed-area .battle-feed-body
 */
._video-grid-internal-testing_wfxpc_52 {
  grid-gap: 20px 20px;
}
._video-grid-internal-testing_wfxpc_52 .ant-divider-horizontal.ant-divider-with-text {
  margin-bottom: -15px;
  margin-top: -15px;
}
._video-grid-internal-testing_wfxpc_52 .ant-divider-horizontal.ant-divider-with-text:first-of-type {
  margin-top: 0;
}

@media (max-width: 1399px) {
  ._video-grid-internal-testing_wfxpc_52 {
    --col: 4;
  }
  ._video-grid-internal-testing_wfxpc_52._limit-one-line_wfxpc_67 > *:nth-of-type(1n + 5) {
    display: none !important;
  }
  ._video-grid-internal-testing_wfxpc_52._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 9) {
    display: none !important;
  }
}
@media (min-width: 1400px) {
  ._video-grid-internal-testing_wfxpc_52 {
    --col: 5;
  }
  ._video-grid-internal-testing_wfxpc_52._limit-one-line_wfxpc_67 > *:nth-of-type(1n + 6) {
    display: none !important;
  }
  ._video-grid-internal-testing_wfxpc_52._limit-two-lines_wfxpc_20 > *:nth-of-type(1n + 11) {
    display: none !important;
  }
}
/**
 * youtube like
 */
._video-grid-container_wfxpc_88 {
  container-name: video-grid-container;
  container-type: inline-size;
}

._video-grid-fancy_wfxpc_93 {
  --video-card-border-radius: 15px;
  --col: 2;
  column-gap: 20px;
  row-gap: 0;
  --row-gap: clamp(20px, 1.6vw, 40px);
}
._video-grid-fancy_wfxpc_93 .bili-video-card {
  margin-bottom: var(--row-gap);
}
._video-grid-fancy_wfxpc_93 .ant-divider-horizontal.ant-divider-with-text {
  margin-bottom: 5px;
  margin-top: calc(10px - var(--row-gap));
}
._video-grid-fancy_wfxpc_93 .ant-divider-horizontal.ant-divider-with-text:first-of-type {
  margin-top: 0;
}

@container video-grid-container (width >= 520px) {
  ._video-grid_wfxpc_7._video-grid-fancy_wfxpc_93 {
    --col: 2;
  }
}
@container video-grid-container (width >= 790px) {
  ._video-grid_wfxpc_7._video-grid-fancy_wfxpc_93 {
    --col: 3;
  }
}
@container video-grid-container (width >= 1060px) {
  ._video-grid_wfxpc_7._video-grid-fancy_wfxpc_93 {
    --col: 4;
  }
}
@container video-grid-container (width >= 1330px) {
  ._video-grid_wfxpc_7._video-grid-fancy_wfxpc_93 {
    --col: 5;
  }
}
/**
 * \u53CC\u5217\u6A21\u5F0F
 */
._narrow-mode_wfxpc_134 {
  --col: 2 !important;
}._config-icon_1th8l_1 {
  line-height: 1;
  margin-right: 5px;
  font-size: 0;
}

._settings-group_1th8l_7 {
  margin-bottom: 10px;
}
._settings-group_1th8l_7 ._settings-group-title_1th8l_10 {
  font-size: 2em;
  display: flex;
  align-items: center;
}
._settings-group_1th8l_7 ._settings-group-sub-title_1th8l_15 {
  font-size: 1.3em;
  display: flex;
  align-items: center;
  margin-top: 15px;
}
._settings-group_1th8l_7 ._settings-group-content_1th8l_21 {
  color: default;
}
._settings-group_1th8l_7 ._settings-group-content_1th8l_21 button:first-child {
  margin-left: 0;
}

._row_1th8l_28 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
._row_1th8l_28 .primary-btn:first-child {
  margin-left: 0;
}

._check_1th8l_37 {
  margin-bottom: 5px;
  margin-inline-start: 0 !important;
  margin-inline-end: 5px !important;
}

._setting-tabs_1th8l_43.ant-tabs .ant-tabs-tab {
  padding-left: 5px;
}

._tab-pane_1th8l_47 {
  min-height: min(360px, 90vh - 121px);
  max-height: calc(90vh - 121px);
  overflow-y: scroll;
}._modal-mask_14tde_1._narrow-mode_14tde_1 {
  background-color: rgba(0, 0, 0, 0.9);
}

._modal_14tde_1 {
  width: calc(100vw - 30px);
  height: calc(100vh - 30px);
  max-height: unset;
  padding-right: 0;
}
._modal_14tde_1._narrow-mode_14tde_1 {
  width: 606px;
  height: calc(100vh - 10px);
  border: none;
}
body.dark ._modal_14tde_1._narrow-mode_14tde_1 {
  border: none;
}
._modal_14tde_1._full-screen-mode_14tde_19 {
  width: 100vw;
  height: 100vh;
}

._modal-header_14tde_24,
._modal-body_14tde_25 {
  padding-right: 15px;
}

body.dark ._btn-refresh_14tde_29 {
  color: #eee !important;
  background-color: #333 !important;
  border-color: transparent !important;
  height: auto;
  padding: 8px 12px;
  line-height: 16px;
  font-size: 13px;
} `);

(async function (axios, dayjs, gmAdapter, React__default, lodash, duration, UAParser, antd, zhCN, require$$0, isEqual, framerMotion, debounce, throttle$1) {
  'use strict';

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const React__default__namespace = /*#__PURE__*/_interopNamespaceDefault(React__default);

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
  var __publicField = (obj, key2, value) => {
    __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };
  var _a, _b, _size, _cache, _oldCache, _maxSize, _maxAge, _onEviction, _emitEvictions, emitEvictions_fn, _deleteIfExpired, deleteIfExpired_fn, _getOrDeleteIfExpired, getOrDeleteIfExpired_fn, _getItemValue, getItemValue_fn, _peek, peek_fn, _set, set_fn, _moveToRecent, moveToRecent_fn, _entriesAscending, entriesAscending_fn;
  function getDefaultExportFromCjs(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
  }
  var browser = { exports: {} };
  var ms$2;
  var hasRequiredMs;
  function requireMs() {
    if (hasRequiredMs)
      return ms$2;
    hasRequiredMs = 1;
    var s2 = 1e3;
    var m2 = s2 * 60;
    var h2 = m2 * 60;
    var d2 = h2 * 24;
    var w2 = d2 * 7;
    var y2 = d2 * 365.25;
    ms$2 = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse2(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong2(val) : fmtShort2(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse2(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match2) {
        return;
      }
      var n2 = parseFloat(match2[1]);
      var type = (match2[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n2 * y2;
        case "weeks":
        case "week":
        case "w":
          return n2 * w2;
        case "days":
        case "day":
        case "d":
          return n2 * d2;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n2 * h2;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n2 * m2;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n2 * s2;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n2;
        default:
          return void 0;
      }
    }
    function fmtShort2(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d2) {
        return Math.round(ms2 / d2) + "d";
      }
      if (msAbs >= h2) {
        return Math.round(ms2 / h2) + "h";
      }
      if (msAbs >= m2) {
        return Math.round(ms2 / m2) + "m";
      }
      if (msAbs >= s2) {
        return Math.round(ms2 / s2) + "s";
      }
      return ms2 + "ms";
    }
    function fmtLong2(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d2) {
        return plural2(ms2, msAbs, d2, "day");
      }
      if (msAbs >= h2) {
        return plural2(ms2, msAbs, h2, "hour");
      }
      if (msAbs >= m2) {
        return plural2(ms2, msAbs, m2, "minute");
      }
      if (msAbs >= s2) {
        return plural2(ms2, msAbs, s2, "second");
      }
      return ms2 + " ms";
    }
    function plural2(ms2, msAbs, n2, name) {
      var isPlural = msAbs >= n2 * 1.5;
      return Math.round(ms2 / n2) + " " + name + (isPlural ? "s" : "");
    }
    return ms$2;
  }
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key2) => {
      createDebug[key2] = env[key2];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash2 = 0;
      for (let i2 = 0; i2 < namespace.length; i2++) {
        hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i2);
        hash2 |= 0;
      }
      return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format) => {
          if (match2 === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match2 = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match2;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v2) => {
          enableOverride = v2;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend(namespace, delimiter2) {
      const newDebug = createDebug(this.namespace + (typeof delimiter2 === "undefined" ? ":" : delimiter2) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i2;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i2 = 0; i2 < len; i2++) {
        if (!split[i2]) {
          continue;
        }
        namespaces = split[i2].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      const namespaces = [...createDebug.names.map(toNamespace), ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i2;
      let len;
      for (i2 = 0, len = createDebug.skips.length; i2 < len; i2++) {
        if (createDebug.skips[i2].test(name)) {
          return false;
        }
      }
      for (i2 = 0, len = createDebug.names.length; i2 < len; i2++) {
        if (createDebug.names[i2].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  var common = setup;
  (function(module, exports) {
    var define_process_env_default = {};
    exports.formatArgs = formatArgs;
    exports.save = save2;
    exports.load = load2;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match2) => {
        if (match2 === "%%") {
          return;
        }
        index++;
        if (match2 === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save2(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load2() {
      let r2;
      try {
        r2 = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r2 && typeof process !== "undefined" && "env" in process) {
        r2 = define_process_env_default.DEBUG;
      }
      return r2;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = common(exports);
    const {
      formatters
    } = module.exports;
    formatters.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  var browserExports = browser.exports;
  const debugFactory = /* @__PURE__ */ getDefaultExportFromCjs(browserExports);
  const APP_NAME = "bilibili-app-recommend";
  const APP_KEY_PREFIX = "bilibili_app_recommend";
  const baseDebug = debugFactory(APP_NAME);
  const HOST_API = "https://api.bilibili.com";
  const HOST_APP = "https://app.bilibili.com";
  const TVKeyInfo = {
    appkey: "4409e2ce8ffd12b8",
    appsec: "59b43e04ad6965f34319062b478f83dd"
  };
  const APP_NAME_ROOT_CLASSNAME = `${APP_NAME}-root`;
  const REQUEST_FAIL_MSG = "请求失败, 请重试 !!!";
  const OPERATION_FAIL_MSG = "操作失败, 请重试 !!!";
  const hostname = location.hostname;
  const pathname = location.pathname || "";
  const IN_BILIBILI = hostname.endsWith("bilibili.com");
  const IN_BILIBILI_HOMEPAGE = IN_BILIBILI && (pathname === "/" || pathname === "/index.html");
  const IN_BILIBILI_VIDEO_PLAY_PAGE = IN_BILIBILI && (pathname.startsWith("/video/") || pathname.startsWith("/list/watchlater"));
  let HAS_RESTORED_SETTINGS = false;
  function set_HAS_RESTORED_SETTINGS(val) {
    HAS_RESTORED_SETTINGS = val;
  }
  var AppApiDevice = /* @__PURE__ */ ((AppApiDevice2) => {
    AppApiDevice2["android"] = "android";
    AppApiDevice2["ipad"] = "ipad";
    return AppApiDevice2;
  })(AppApiDevice || {});
  var ApiType = /* @__PURE__ */ ((ApiType2) => {
    ApiType2["app"] = "app";
    ApiType2["pc"] = "pc";
    ApiType2["dynamic"] = "dynamic";
    ApiType2["watchlater"] = "watchlater";
    ApiType2["fav"] = "fav";
    ApiType2["popularGeneral"] = "popular-general";
    ApiType2["popularWeekly"] = "popular-weekly";
    ApiType2["separator"] = "separator";
    return ApiType2;
  })(ApiType || {});
  var md5$1 = { exports: {} };
  var crypt = { exports: {} };
  (function() {
    var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt$1 = {
      // Bit-wise rotation left
      rotl: function(n2, b2) {
        return n2 << b2 | n2 >>> 32 - b2;
      },
      // Bit-wise rotation right
      rotr: function(n2, b2) {
        return n2 << 32 - b2 | n2 >>> b2;
      },
      // Swap big-endian to little-endian and vice versa
      endian: function(n2) {
        if (n2.constructor == Number) {
          return crypt$1.rotl(n2, 8) & 16711935 | crypt$1.rotl(n2, 24) & 4278255360;
        }
        for (var i2 = 0; i2 < n2.length; i2++)
          n2[i2] = crypt$1.endian(n2[i2]);
        return n2;
      },
      // Generate an array of any length of random bytes
      randomBytes: function(n2) {
        for (var bytes = []; n2 > 0; n2--)
          bytes.push(Math.floor(Math.random() * 256));
        return bytes;
      },
      // Convert a byte array to big-endian 32-bit words
      bytesToWords: function(bytes) {
        for (var words = [], i2 = 0, b2 = 0; i2 < bytes.length; i2++, b2 += 8)
          words[b2 >>> 5] |= bytes[i2] << 24 - b2 % 32;
        return words;
      },
      // Convert big-endian 32-bit words to a byte array
      wordsToBytes: function(words) {
        for (var bytes = [], b2 = 0; b2 < words.length * 32; b2 += 8)
          bytes.push(words[b2 >>> 5] >>> 24 - b2 % 32 & 255);
        return bytes;
      },
      // Convert a byte array to a hex string
      bytesToHex: function(bytes) {
        for (var hex = [], i2 = 0; i2 < bytes.length; i2++) {
          hex.push((bytes[i2] >>> 4).toString(16));
          hex.push((bytes[i2] & 15).toString(16));
        }
        return hex.join("");
      },
      // Convert a hex string to a byte array
      hexToBytes: function(hex) {
        for (var bytes = [], c2 = 0; c2 < hex.length; c2 += 2)
          bytes.push(parseInt(hex.substr(c2, 2), 16));
        return bytes;
      },
      // Convert a byte array to a base-64 string
      bytesToBase64: function(bytes) {
        for (var base64 = [], i2 = 0; i2 < bytes.length; i2 += 3) {
          var triplet = bytes[i2] << 16 | bytes[i2 + 1] << 8 | bytes[i2 + 2];
          for (var j = 0; j < 4; j++)
            if (i2 * 8 + j * 6 <= bytes.length * 8)
              base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63));
            else
              base64.push("=");
        }
        return base64.join("");
      },
      // Convert a base-64 string to a byte array
      base64ToBytes: function(base64) {
        base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
        for (var bytes = [], i2 = 0, imod4 = 0; i2 < base64.length; imod4 = ++i2 % 4) {
          if (imod4 == 0)
            continue;
          bytes.push((base64map.indexOf(base64.charAt(i2 - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i2)) >>> 6 - imod4 * 2);
        }
        return bytes;
      }
    };
    crypt.exports = crypt$1;
  })();
  var cryptExports = crypt.exports;
  var charenc = {
    // UTF-8 encoding
    utf8: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
      },
      // Convert a byte array to a string
      bytesToString: function(bytes) {
        return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
      }
    },
    // Binary encoding
    bin: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        for (var bytes = [], i2 = 0; i2 < str.length; i2++)
          bytes.push(str.charCodeAt(i2) & 255);
        return bytes;
      },
      // Convert a byte array to a string
      bytesToString: function(bytes) {
        for (var str = [], i2 = 0; i2 < bytes.length; i2++)
          str.push(String.fromCharCode(bytes[i2]));
        return str.join("");
      }
    }
  };
  var charenc_1 = charenc;
  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  var isBuffer_1 = function(obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
  };
  function isBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
  }
  (function() {
    var crypt2 = cryptExports, utf8 = charenc_1.utf8, isBuffer2 = isBuffer_1, bin = charenc_1.bin, md52 = function(message2, options) {
      if (message2.constructor == String) {
        if (options && options.encoding === "binary")
          message2 = bin.stringToBytes(message2);
        else
          message2 = utf8.stringToBytes(message2);
      } else if (isBuffer2(message2))
        message2 = Array.prototype.slice.call(message2, 0);
      else if (!Array.isArray(message2) && message2.constructor !== Uint8Array)
        message2 = message2.toString();
      var m2 = crypt2.bytesToWords(message2), l2 = message2.length * 8, a2 = 1732584193, b2 = -271733879, c2 = -1732584194, d2 = 271733878;
      for (var i2 = 0; i2 < m2.length; i2++) {
        m2[i2] = (m2[i2] << 8 | m2[i2] >>> 24) & 16711935 | (m2[i2] << 24 | m2[i2] >>> 8) & 4278255360;
      }
      m2[l2 >>> 5] |= 128 << l2 % 32;
      m2[(l2 + 64 >>> 9 << 4) + 14] = l2;
      var FF = md52._ff, GG = md52._gg, HH = md52._hh, II = md52._ii;
      for (var i2 = 0; i2 < m2.length; i2 += 16) {
        var aa = a2, bb = b2, cc = c2, dd = d2;
        a2 = FF(a2, b2, c2, d2, m2[i2 + 0], 7, -680876936);
        d2 = FF(d2, a2, b2, c2, m2[i2 + 1], 12, -389564586);
        c2 = FF(c2, d2, a2, b2, m2[i2 + 2], 17, 606105819);
        b2 = FF(b2, c2, d2, a2, m2[i2 + 3], 22, -1044525330);
        a2 = FF(a2, b2, c2, d2, m2[i2 + 4], 7, -176418897);
        d2 = FF(d2, a2, b2, c2, m2[i2 + 5], 12, 1200080426);
        c2 = FF(c2, d2, a2, b2, m2[i2 + 6], 17, -1473231341);
        b2 = FF(b2, c2, d2, a2, m2[i2 + 7], 22, -45705983);
        a2 = FF(a2, b2, c2, d2, m2[i2 + 8], 7, 1770035416);
        d2 = FF(d2, a2, b2, c2, m2[i2 + 9], 12, -1958414417);
        c2 = FF(c2, d2, a2, b2, m2[i2 + 10], 17, -42063);
        b2 = FF(b2, c2, d2, a2, m2[i2 + 11], 22, -1990404162);
        a2 = FF(a2, b2, c2, d2, m2[i2 + 12], 7, 1804603682);
        d2 = FF(d2, a2, b2, c2, m2[i2 + 13], 12, -40341101);
        c2 = FF(c2, d2, a2, b2, m2[i2 + 14], 17, -1502002290);
        b2 = FF(b2, c2, d2, a2, m2[i2 + 15], 22, 1236535329);
        a2 = GG(a2, b2, c2, d2, m2[i2 + 1], 5, -165796510);
        d2 = GG(d2, a2, b2, c2, m2[i2 + 6], 9, -1069501632);
        c2 = GG(c2, d2, a2, b2, m2[i2 + 11], 14, 643717713);
        b2 = GG(b2, c2, d2, a2, m2[i2 + 0], 20, -373897302);
        a2 = GG(a2, b2, c2, d2, m2[i2 + 5], 5, -701558691);
        d2 = GG(d2, a2, b2, c2, m2[i2 + 10], 9, 38016083);
        c2 = GG(c2, d2, a2, b2, m2[i2 + 15], 14, -660478335);
        b2 = GG(b2, c2, d2, a2, m2[i2 + 4], 20, -405537848);
        a2 = GG(a2, b2, c2, d2, m2[i2 + 9], 5, 568446438);
        d2 = GG(d2, a2, b2, c2, m2[i2 + 14], 9, -1019803690);
        c2 = GG(c2, d2, a2, b2, m2[i2 + 3], 14, -187363961);
        b2 = GG(b2, c2, d2, a2, m2[i2 + 8], 20, 1163531501);
        a2 = GG(a2, b2, c2, d2, m2[i2 + 13], 5, -1444681467);
        d2 = GG(d2, a2, b2, c2, m2[i2 + 2], 9, -51403784);
        c2 = GG(c2, d2, a2, b2, m2[i2 + 7], 14, 1735328473);
        b2 = GG(b2, c2, d2, a2, m2[i2 + 12], 20, -1926607734);
        a2 = HH(a2, b2, c2, d2, m2[i2 + 5], 4, -378558);
        d2 = HH(d2, a2, b2, c2, m2[i2 + 8], 11, -2022574463);
        c2 = HH(c2, d2, a2, b2, m2[i2 + 11], 16, 1839030562);
        b2 = HH(b2, c2, d2, a2, m2[i2 + 14], 23, -35309556);
        a2 = HH(a2, b2, c2, d2, m2[i2 + 1], 4, -1530992060);
        d2 = HH(d2, a2, b2, c2, m2[i2 + 4], 11, 1272893353);
        c2 = HH(c2, d2, a2, b2, m2[i2 + 7], 16, -155497632);
        b2 = HH(b2, c2, d2, a2, m2[i2 + 10], 23, -1094730640);
        a2 = HH(a2, b2, c2, d2, m2[i2 + 13], 4, 681279174);
        d2 = HH(d2, a2, b2, c2, m2[i2 + 0], 11, -358537222);
        c2 = HH(c2, d2, a2, b2, m2[i2 + 3], 16, -722521979);
        b2 = HH(b2, c2, d2, a2, m2[i2 + 6], 23, 76029189);
        a2 = HH(a2, b2, c2, d2, m2[i2 + 9], 4, -640364487);
        d2 = HH(d2, a2, b2, c2, m2[i2 + 12], 11, -421815835);
        c2 = HH(c2, d2, a2, b2, m2[i2 + 15], 16, 530742520);
        b2 = HH(b2, c2, d2, a2, m2[i2 + 2], 23, -995338651);
        a2 = II(a2, b2, c2, d2, m2[i2 + 0], 6, -198630844);
        d2 = II(d2, a2, b2, c2, m2[i2 + 7], 10, 1126891415);
        c2 = II(c2, d2, a2, b2, m2[i2 + 14], 15, -1416354905);
        b2 = II(b2, c2, d2, a2, m2[i2 + 5], 21, -57434055);
        a2 = II(a2, b2, c2, d2, m2[i2 + 12], 6, 1700485571);
        d2 = II(d2, a2, b2, c2, m2[i2 + 3], 10, -1894986606);
        c2 = II(c2, d2, a2, b2, m2[i2 + 10], 15, -1051523);
        b2 = II(b2, c2, d2, a2, m2[i2 + 1], 21, -2054922799);
        a2 = II(a2, b2, c2, d2, m2[i2 + 8], 6, 1873313359);
        d2 = II(d2, a2, b2, c2, m2[i2 + 15], 10, -30611744);
        c2 = II(c2, d2, a2, b2, m2[i2 + 6], 15, -1560198380);
        b2 = II(b2, c2, d2, a2, m2[i2 + 13], 21, 1309151649);
        a2 = II(a2, b2, c2, d2, m2[i2 + 4], 6, -145523070);
        d2 = II(d2, a2, b2, c2, m2[i2 + 11], 10, -1120210379);
        c2 = II(c2, d2, a2, b2, m2[i2 + 2], 15, 718787259);
        b2 = II(b2, c2, d2, a2, m2[i2 + 9], 21, -343485551);
        a2 = a2 + aa >>> 0;
        b2 = b2 + bb >>> 0;
        c2 = c2 + cc >>> 0;
        d2 = d2 + dd >>> 0;
      }
      return crypt2.endian([a2, b2, c2, d2]);
    };
    md52._ff = function(a2, b2, c2, d2, x2, s2, t2) {
      var n2 = a2 + (b2 & c2 | ~b2 & d2) + (x2 >>> 0) + t2;
      return (n2 << s2 | n2 >>> 32 - s2) + b2;
    };
    md52._gg = function(a2, b2, c2, d2, x2, s2, t2) {
      var n2 = a2 + (b2 & d2 | c2 & ~d2) + (x2 >>> 0) + t2;
      return (n2 << s2 | n2 >>> 32 - s2) + b2;
    };
    md52._hh = function(a2, b2, c2, d2, x2, s2, t2) {
      var n2 = a2 + (b2 ^ c2 ^ d2) + (x2 >>> 0) + t2;
      return (n2 << s2 | n2 >>> 32 - s2) + b2;
    };
    md52._ii = function(a2, b2, c2, d2, x2, s2, t2) {
      var n2 = a2 + (c2 ^ (b2 | ~d2)) + (x2 >>> 0) + t2;
      return (n2 << s2 | n2 >>> 32 - s2) + b2;
    };
    md52._blocksize = 16;
    md52._digestsize = 16;
    md5$1.exports = function(message2, options) {
      if (message2 === void 0 || message2 === null)
        throw new Error("Illegal argument " + message2);
      var digestbytes = crypt2.wordsToBytes(md52(message2, options));
      return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt2.bytesToHex(digestbytes);
    };
  })();
  var md5Exports = md5$1.exports;
  const md5 = /* @__PURE__ */ getDefaultExportFromCjs(md5Exports);
  function appSign(params, appkey2, appsec2) {
    params.appkey = appkey2;
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    return md5(searchParams.toString() + appsec2);
  }
  var s$1 = 1e3;
  var m$4 = s$1 * 60;
  var h$3 = m$4 * 60;
  var d$2 = h$3 * 24;
  var w$2 = d$2 * 7;
  var y$2 = d$2 * 365.25;
  var ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse$1(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse$1(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match2) {
      return;
    }
    var n2 = parseFloat(match2[1]);
    var type = (match2[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n2 * y$2;
      case "weeks":
      case "week":
      case "w":
        return n2 * w$2;
      case "days":
      case "day":
      case "d":
        return n2 * d$2;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n2 * h$3;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n2 * m$4;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n2 * s$1;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n2;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d$2) {
      return Math.round(ms2 / d$2) + "d";
    }
    if (msAbs >= h$3) {
      return Math.round(ms2 / h$3) + "h";
    }
    if (msAbs >= m$4) {
      return Math.round(ms2 / m$4) + "m";
    }
    if (msAbs >= s$1) {
      return Math.round(ms2 / s$1) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d$2) {
      return plural(ms2, msAbs, d$2, "day");
    }
    if (msAbs >= h$3) {
      return plural(ms2, msAbs, h$3, "hour");
    }
    if (msAbs >= m$4) {
      return plural(ms2, msAbs, m$4, "minute");
    }
    if (msAbs >= s$1) {
      return plural(ms2, msAbs, s$1, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n2, name) {
    var isPlural = msAbs >= n2 * 1.5;
    return Math.round(ms2 / n2) + " " + name + (isPlural ? "s" : "");
  }
  const ms$1 = /* @__PURE__ */ getDefaultExportFromCjs(ms);
  const mixinKeyEncTab = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52];
  function getMixinKey(orig) {
    let temp = "";
    mixinKeyEncTab.forEach((n2) => {
      temp += orig[n2];
    });
    return temp.slice(0, 32);
  }
  async function encWbi(_params) {
    const {
      img_key,
      sub_key
    } = await getWbiKeys();
    const mixin_key = getMixinKey(img_key + sub_key);
    const wts = Math.round(Date.now() / 1e3);
    const params = {
      ..._params,
      wts
    };
    const chr_filter = /[!'()*]/g;
    const query = Object.keys(params).sort().map((key2) => {
      return `${encodeURIComponent(key2)}=${encodeURIComponent(
      // 过滤 value 中的 "!'()*" 字符
      params[key2].toString().replace(chr_filter, "")
    )}`;
    }).join("&");
    const wbi_sign = md5(query + mixin_key);
    return {
      wts,
      w_rid: wbi_sign
    };
  }
  let keysCache;
  let keysCacheTs;
  let keysCacheDate;
  async function getWbiKeys() {
    const genDate = () => dayjs().format("YYYYMMDD");
    const shouldReuse = keysCache && keysCacheTs && keysCacheDate && keysCacheDate === genDate() && Date.now() - keysCacheTs <= ms$1("6h");
    if (shouldReuse) {
      return keysCache;
    }
    const res = await axios.get("/x/web-interface/nav", {
      baseURL: HOST_API
    });
    const json = res.data;
    const img_url = json.data.wbi_img.img_url;
    const sub_url = json.data.wbi_img.sub_url;
    const keys = {
      img_key: img_url.slice(img_url.lastIndexOf("/") + 1, img_url.lastIndexOf(".")),
      sub_key: sub_url.slice(sub_url.lastIndexOf("/") + 1, sub_url.lastIndexOf("."))
    };
    keysCache = keys;
    keysCacheDate = genDate();
    keysCacheTs = Date.now();
    return keys;
  }
  const request = axios.create({
    baseURL: HOST_API,
    withCredentials: true
  });
  request.interceptors.request.use(async function(config) {
    var _a2;
    config.params || (config.params = {});
    if ((_a2 = config.url) == null ? void 0 : _a2.includes("/wbi/")) {
      config.params = {
        ...config.params,
        ...await encWbi(config.params)
      };
    }
    return config;
  });
  function isWebApiSuccess(json) {
    return (json == null ? void 0 : json.code) === 0 && (json == null ? void 0 : json.message) === "0";
  }
  const gmrequest = axios.create({
    // @ts-ignore
    adapter: gmAdapter
  });
  const appkey = TVKeyInfo.appkey;
  const appsec = TVKeyInfo.appsec;
  gmrequest.interceptors.request.use(function(config) {
    config.params = {
      appkey,
      access_key: settings.accessKey || "",
      ...config.params
    };
    config.params.sign = appSign(config.params, appkey, appsec);
    return config;
  });
  gmrequest.interceptors.response.use((res) => {
    if (res.config.responseType === "json" && res.data && res.data instanceof ArrayBuffer) {
      const decoder = new TextDecoder();
      const u8arr = new Uint8Array(res.data);
      const text = decoder.decode(u8arr);
      res.data = text;
      try {
        res.data = JSON.parse(text);
      } catch (e2) {
      }
    }
    return res;
  });
  const e$2 = Symbol(), t$2 = Symbol(), r$2 = "a", n$3 = "w";
  let o = (e2, t2) => new Proxy(e2, t2);
  const s = Object.getPrototypeOf, c$1 = /* @__PURE__ */ new WeakMap(), l$3 = (e2) => e2 && (c$1.has(e2) ? c$1.get(e2) : s(e2) === Object.prototype || s(e2) === Array.prototype), f$2 = (e2) => "object" == typeof e2 && null !== e2, i = (e2) => {
    if (Array.isArray(e2))
      return Array.from(e2);
    const t2 = Object.getOwnPropertyDescriptors(e2);
    return Object.values(t2).forEach((e3) => {
      e3.configurable = true;
    }), Object.create(s(e2), t2);
  }, u$1 = (e2) => e2[t$2] || e2, a = (s2, c2, f2, p2) => {
    if (!l$3(s2))
      return s2;
    let g2 = p2 && p2.get(s2);
    if (!g2) {
      const e2 = u$1(s2);
      g2 = ((e3) => Object.values(Object.getOwnPropertyDescriptors(e3)).some((e4) => !e4.configurable && !e4.writable))(e2) ? [e2, i(e2)] : [e2], null == p2 || p2.set(s2, g2);
    }
    const [y2, h2] = g2;
    let w2 = f2 && f2.get(y2);
    return w2 && w2[1].f === !!h2 || (w2 = ((o2, s3) => {
      const c3 = {
        f: s3
      };
      let l2 = false;
      const f3 = (e2, t2) => {
        if (!l2) {
          let s4 = c3[r$2].get(o2);
          if (s4 || (s4 = {}, c3[r$2].set(o2, s4)), e2 === n$3)
            s4[n$3] = true;
          else {
            let r2 = s4[e2];
            r2 || (r2 = /* @__PURE__ */ new Set(), s4[e2] = r2), r2.add(t2);
          }
        }
      }, i2 = {
        get: (e2, n2) => n2 === t$2 ? o2 : (f3("k", n2), a(Reflect.get(e2, n2), c3[r$2], c3.c, c3.t)),
        has: (t2, n2) => n2 === e$2 ? (l2 = true, c3[r$2].delete(o2), true) : (f3("h", n2), Reflect.has(t2, n2)),
        getOwnPropertyDescriptor: (e2, t2) => (f3("o", t2), Reflect.getOwnPropertyDescriptor(e2, t2)),
        ownKeys: (e2) => (f3(n$3), Reflect.ownKeys(e2))
      };
      return s3 && (i2.set = i2.deleteProperty = () => false), [i2, c3];
    })(y2, !!h2), w2[1].p = o(h2 || y2, w2[0]), f2 && f2.set(y2, w2)), w2[1][r$2] = c2, w2[1].c = f2, w2[1].t = p2, w2[1].p;
  }, p$3 = (e2, t2, r2, o2) => {
    if (Object.is(e2, t2))
      return false;
    if (!f$2(e2) || !f$2(t2))
      return true;
    const s2 = r2.get(u$1(e2));
    if (!s2)
      return true;
    if (o2) {
      const r3 = o2.get(e2);
      if (r3 && r3.n === t2)
        return r3.g;
      o2.set(e2, {
        n: t2,
        g: false
      });
    }
    let c2 = null;
    try {
      for (const r3 of s2.h || [])
        if (c2 = Reflect.has(e2, r3) !== Reflect.has(t2, r3), c2)
          return c2;
      if (true === s2[n$3]) {
        if (c2 = ((e3, t3) => {
          const r3 = Reflect.ownKeys(e3), n2 = Reflect.ownKeys(t3);
          return r3.length !== n2.length || r3.some((e4, t4) => e4 !== n2[t4]);
        })(e2, t2), c2)
          return c2;
      } else
        for (const r3 of s2.o || [])
          if (c2 = !!Reflect.getOwnPropertyDescriptor(e2, r3) != !!Reflect.getOwnPropertyDescriptor(t2, r3), c2)
            return c2;
      for (const n2 of s2.k || [])
        if (c2 = p$3(e2[n2], t2[n2], r2, o2), c2)
          return c2;
      return null === c2 && (c2 = true), c2;
    } finally {
      o2 && o2.set(e2, {
        n: t2,
        g: c2
      });
    }
  }, y$1 = (e2) => l$3(e2) && e2[t$2] || null, h$2 = (e2, t2 = true) => {
    c$1.set(e2, t2);
  }, w$1 = (e2, t2, r2) => {
    const o2 = [], s2 = /* @__PURE__ */ new WeakSet(), c2 = (e3, l2) => {
      if (s2.has(e3))
        return;
      f$2(e3) && s2.add(e3);
      const i2 = f$2(e3) && t2.get(u$1(e3));
      if (i2) {
        var a2, p2;
        if (null == (a2 = i2.h) || a2.forEach((e4) => {
          const t3 = `:has(${String(e4)})`;
          o2.push(l2 ? [...l2, t3] : [t3]);
        }), true === i2[n$3]) {
          const e4 = ":ownKeys";
          o2.push(l2 ? [...l2, e4] : [e4]);
        } else {
          var g2;
          null == (g2 = i2.o) || g2.forEach((e4) => {
            const t3 = `:hasOwn(${String(e4)})`;
            o2.push(l2 ? [...l2, t3] : [t3]);
          });
        }
        null == (p2 = i2.k) || p2.forEach((t3) => {
          r2 && !("value" in (Object.getOwnPropertyDescriptor(e3, t3) || {})) || c2(e3[t3], l2 ? [...l2, t3] : [t3]);
        });
      } else
        l2 && o2.push(l2);
    };
    return c2(e2), o2;
  };
  var define_import_meta_env_default$1 = { BASE_URL: "/", MODE: "production", DEV: false, PROD: true, SSR: false };
  const isObject = (x2) => typeof x2 === "object" && x2 !== null;
  const proxyStateMap = /* @__PURE__ */ new WeakMap();
  const refSet = /* @__PURE__ */ new WeakSet();
  const buildProxyFunction = (objectIs = Object.is, newProxy = (target, handler) => new Proxy(target, handler), canProxy = (x2) => isObject(x2) && !refSet.has(x2) && (Array.isArray(x2) || !(Symbol.iterator in x2)) && !(x2 instanceof WeakMap) && !(x2 instanceof WeakSet) && !(x2 instanceof Error) && !(x2 instanceof Number) && !(x2 instanceof Date) && !(x2 instanceof String) && !(x2 instanceof RegExp) && !(x2 instanceof ArrayBuffer), defaultHandlePromise = (promise) => {
    switch (promise.status) {
      case "fulfilled":
        return promise.value;
      case "rejected":
        throw promise.reason;
      default:
        throw promise;
    }
  }, snapCache = /* @__PURE__ */ new WeakMap(), createSnapshot = (target, version, handlePromise = defaultHandlePromise) => {
    const cache2 = snapCache.get(target);
    if ((cache2 == null ? void 0 : cache2[0]) === version) {
      return cache2[1];
    }
    const snap = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
    h$2(snap, true);
    snapCache.set(target, [version, snap]);
    Reflect.ownKeys(target).forEach((key2) => {
      if (Object.getOwnPropertyDescriptor(snap, key2)) {
        return;
      }
      const value = Reflect.get(target, key2);
      const { enumerable } = Reflect.getOwnPropertyDescriptor(
        target,
        key2
      );
      const desc = {
        value,
        enumerable,
        // This is intentional to avoid copying with proxy-compare.
        // It's still non-writable, so it avoids assigning a value.
        configurable: true
      };
      if (refSet.has(value)) {
        h$2(value, false);
      } else if (value instanceof Promise) {
        delete desc.value;
        desc.get = () => handlePromise(value);
      } else if (proxyStateMap.has(value)) {
        const [target2, ensureVersion] = proxyStateMap.get(
          value
        );
        desc.value = createSnapshot(
          target2,
          ensureVersion(),
          handlePromise
        );
      }
      Object.defineProperty(snap, key2, desc);
    });
    return Object.preventExtensions(snap);
  }, proxyCache = /* @__PURE__ */ new WeakMap(), versionHolder = [1, 1], proxyFunction = (initialObject) => {
    if (!isObject(initialObject)) {
      throw new Error("object required");
    }
    const found = proxyCache.get(initialObject);
    if (found) {
      return found;
    }
    let version = versionHolder[0];
    const listeners2 = /* @__PURE__ */ new Set();
    const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
      if (version !== nextVersion) {
        version = nextVersion;
        listeners2.forEach((listener) => listener(op, nextVersion));
      }
    };
    let checkVersion = versionHolder[1];
    const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
      if (checkVersion !== nextCheckVersion && !listeners2.size) {
        checkVersion = nextCheckVersion;
        propProxyStates.forEach(([propProxyState]) => {
          const propVersion = propProxyState[1](nextCheckVersion);
          if (propVersion > version) {
            version = propVersion;
          }
        });
      }
      return version;
    };
    const createPropListener = (prop) => (op, nextVersion) => {
      const newOp = [...op];
      newOp[1] = [prop, ...newOp[1]];
      notifyUpdate(newOp, nextVersion);
    };
    const propProxyStates = /* @__PURE__ */ new Map();
    const addPropListener = (prop, propProxyState) => {
      if ((define_import_meta_env_default$1 ? "production" : void 0) !== "production" && propProxyStates.has(prop)) {
        throw new Error("prop listener already exists");
      }
      if (listeners2.size) {
        const remove = propProxyState[3](createPropListener(prop));
        propProxyStates.set(prop, [propProxyState, remove]);
      } else {
        propProxyStates.set(prop, [propProxyState]);
      }
    };
    const removePropListener = (prop) => {
      var _a2;
      const entry = propProxyStates.get(prop);
      if (entry) {
        propProxyStates.delete(prop);
        (_a2 = entry[1]) == null ? void 0 : _a2.call(entry);
      }
    };
    const addListener = (listener) => {
      listeners2.add(listener);
      if (listeners2.size === 1) {
        propProxyStates.forEach(([propProxyState, prevRemove], prop) => {
          if ((define_import_meta_env_default$1 ? "production" : void 0) !== "production" && prevRemove) {
            throw new Error("remove already exists");
          }
          const remove = propProxyState[3](createPropListener(prop));
          propProxyStates.set(prop, [propProxyState, remove]);
        });
      }
      const removeListener = () => {
        listeners2.delete(listener);
        if (listeners2.size === 0) {
          propProxyStates.forEach(([propProxyState, remove], prop) => {
            if (remove) {
              remove();
              propProxyStates.set(prop, [propProxyState]);
            }
          });
        }
      };
      return removeListener;
    };
    const baseObject = Array.isArray(initialObject) ? [] : Object.create(Object.getPrototypeOf(initialObject));
    const handler = {
      deleteProperty(target, prop) {
        const prevValue = Reflect.get(target, prop);
        removePropListener(prop);
        const deleted = Reflect.deleteProperty(target, prop);
        if (deleted) {
          notifyUpdate(["delete", [prop], prevValue]);
        }
        return deleted;
      },
      set(target, prop, value, receiver) {
        const hasPrevValue = Reflect.has(target, prop);
        const prevValue = Reflect.get(target, prop, receiver);
        if (hasPrevValue && (objectIs(prevValue, value) || proxyCache.has(value) && objectIs(prevValue, proxyCache.get(value)))) {
          return true;
        }
        removePropListener(prop);
        if (isObject(value)) {
          value = y$1(value) || value;
        }
        let nextValue = value;
        if (value instanceof Promise) {
          value.then((v2) => {
            value.status = "fulfilled";
            value.value = v2;
            notifyUpdate(["resolve", [prop], v2]);
          }).catch((e2) => {
            value.status = "rejected";
            value.reason = e2;
            notifyUpdate(["reject", [prop], e2]);
          });
        } else {
          if (!proxyStateMap.has(value) && canProxy(value)) {
            nextValue = proxyFunction(value);
          }
          const childProxyState = !refSet.has(nextValue) && proxyStateMap.get(nextValue);
          if (childProxyState) {
            addPropListener(prop, childProxyState);
          }
        }
        Reflect.set(target, prop, nextValue, receiver);
        notifyUpdate(["set", [prop], value, prevValue]);
        return true;
      }
    };
    const proxyObject = newProxy(baseObject, handler);
    proxyCache.set(initialObject, proxyObject);
    const proxyState = [
      baseObject,
      ensureVersion,
      createSnapshot,
      addListener
    ];
    proxyStateMap.set(proxyObject, proxyState);
    Reflect.ownKeys(initialObject).forEach((key2) => {
      const desc = Object.getOwnPropertyDescriptor(
        initialObject,
        key2
      );
      if ("value" in desc) {
        proxyObject[key2] = initialObject[key2];
        delete desc.value;
        delete desc.writable;
      }
      Object.defineProperty(baseObject, key2, desc);
    });
    return proxyObject;
  }) => [
    // public functions
    proxyFunction,
    // shared state
    proxyStateMap,
    refSet,
    // internal things
    objectIs,
    newProxy,
    canProxy,
    defaultHandlePromise,
    snapCache,
    createSnapshot,
    proxyCache,
    versionHolder
  ];
  const [defaultProxyFunction] = buildProxyFunction();
  function proxy(initialObject = {}) {
    return defaultProxyFunction(initialObject);
  }
  function subscribe$3(proxyObject, callback, notifyInSync) {
    const proxyState = proxyStateMap.get(proxyObject);
    if ((define_import_meta_env_default$1 ? "production" : void 0) !== "production" && !proxyState) {
      console.warn("Please use proxy object");
    }
    let promise;
    const ops = [];
    const addListener = proxyState[3];
    let isListenerActive = false;
    const listener = (op) => {
      ops.push(op);
      if (notifyInSync) {
        callback(ops.splice(0));
        return;
      }
      if (!promise) {
        promise = Promise.resolve().then(() => {
          promise = void 0;
          if (isListenerActive) {
            callback(ops.splice(0));
          }
        });
      }
    };
    const removeListener = addListener(listener);
    isListenerActive = true;
    return () => {
      isListenerActive = false;
      removeListener();
    };
  }
  function snapshot(proxyObject, handlePromise) {
    const proxyState = proxyStateMap.get(proxyObject);
    if ((define_import_meta_env_default$1 ? "production" : void 0) !== "production" && !proxyState) {
      console.warn("Please use proxy object");
    }
    const [target, ensureVersion, createSnapshot] = proxyState;
    return createSnapshot(target, ensureVersion(), handlePromise);
  }
  var shim = { exports: {} };
  var useSyncExternalStoreShim_production_min = {};
  /**
   * @license React
   * use-sync-external-store-shim.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var e$1 = React__default;
  function h$1(a2, b2) {
    return a2 === b2 && (0 !== a2 || 1 / a2 === 1 / b2) || a2 !== a2 && b2 !== b2;
  }
  var k$2 = "function" === typeof Object.is ? Object.is : h$1, l$2 = e$1.useState, m$3 = e$1.useEffect, n$2 = e$1.useLayoutEffect, p$2 = e$1.useDebugValue;
  function q$2(a2, b2) {
    var d2 = b2(), f2 = l$2({
      inst: {
        value: d2,
        getSnapshot: b2
      }
    }), c2 = f2[0].inst, g2 = f2[1];
    n$2(function() {
      c2.value = d2;
      c2.getSnapshot = b2;
      r$1(c2) && g2({
        inst: c2
      });
    }, [a2, d2, b2]);
    m$3(function() {
      r$1(c2) && g2({
        inst: c2
      });
      return a2(function() {
        r$1(c2) && g2({
          inst: c2
        });
      });
    }, [a2]);
    p$2(d2);
    return d2;
  }
  function r$1(a2) {
    var b2 = a2.getSnapshot;
    a2 = a2.value;
    try {
      var d2 = b2();
      return !k$2(a2, d2);
    } catch (f2) {
      return true;
    }
  }
  function t$1(a2, b2) {
    return b2();
  }
  var u = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? t$1 : q$2;
  useSyncExternalStoreShim_production_min.useSyncExternalStore = void 0 !== e$1.useSyncExternalStore ? e$1.useSyncExternalStore : u;
  {
    shim.exports = useSyncExternalStoreShim_production_min;
  }
  var shimExports = shim.exports;
  const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(shimExports);
  var define_import_meta_env_default = { BASE_URL: "/", MODE: "production", DEV: false, PROD: true, SSR: false };
  const { use } = React__default;
  const { useSyncExternalStore } = useSyncExternalStoreExports;
  const useAffectedDebugValue = (state, affected) => {
    const pathList = React__default.useRef();
    React__default.useEffect(() => {
      pathList.current = w$1(state, affected, true);
    });
    React__default.useDebugValue(pathList.current);
  };
  const targetCache = /* @__PURE__ */ new WeakMap();
  function useSnapshot(proxyObject, options) {
    const notifyInSync = options == null ? void 0 : options.sync;
    const lastSnapshot = React__default.useRef();
    const lastAffected = React__default.useRef();
    let inRender = true;
    const currSnapshot = useSyncExternalStore(
      React__default.useCallback(
        (callback) => {
          const unsub = subscribe$3(proxyObject, callback, notifyInSync);
          callback();
          return unsub;
        },
        [proxyObject, notifyInSync]
      ),
      () => {
        const nextSnapshot = snapshot(proxyObject, use);
        try {
          if (!inRender && lastSnapshot.current && lastAffected.current && !p$3(
            lastSnapshot.current,
            nextSnapshot,
            lastAffected.current,
            /* @__PURE__ */ new WeakMap()
          )) {
            return lastSnapshot.current;
          }
        } catch (e2) {
        }
        return nextSnapshot;
      },
      () => snapshot(proxyObject, use)
    );
    inRender = false;
    const currAffected = /* @__PURE__ */ new WeakMap();
    React__default.useEffect(() => {
      lastSnapshot.current = currSnapshot;
      lastAffected.current = currAffected;
    });
    if ((define_import_meta_env_default ? "production" : void 0) !== "production") {
      useAffectedDebugValue(currSnapshot, currAffected);
    }
    const proxyCache = React__default.useMemo(() => /* @__PURE__ */ new WeakMap(), []);
    return a(
      currSnapshot,
      currAffected,
      proxyCache,
      targetCache
    );
  }
  var jsxRuntime = { exports: {} };
  var reactJsxRuntime_production_min = {};
  /**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var f$1 = React__default, k$1 = Symbol.for("react.element"), l$1 = Symbol.for("react.fragment"), m$2 = Object.prototype.hasOwnProperty, n$1 = f$1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p$1 = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  function q$1(c2, a2, g2) {
    var b2, d2 = {}, e2 = null, h2 = null;
    void 0 !== g2 && (e2 = "" + g2);
    void 0 !== a2.key && (e2 = "" + a2.key);
    void 0 !== a2.ref && (h2 = a2.ref);
    for (b2 in a2)
      m$2.call(a2, b2) && !p$1.hasOwnProperty(b2) && (d2[b2] = a2[b2]);
    if (c2 && c2.defaultProps)
      for (b2 in a2 = c2.defaultProps, a2)
        void 0 === d2[b2] && (d2[b2] = a2[b2]);
    return {
      $$typeof: k$1,
      type: c2,
      key: e2,
      ref: h2,
      props: d2,
      _owner: n$1.current
    };
  }
  reactJsxRuntime_production_min.Fragment = l$1;
  reactJsxRuntime_production_min.jsx = q$1;
  reactJsxRuntime_production_min.jsxs = q$1;
  {
    jsxRuntime.exports = reactJsxRuntime_production_min;
  }
  var jsxRuntimeExports = jsxRuntime.exports;
  function sheetForTag(tag) {
    if (tag.sheet) {
      return tag.sheet;
    }
    for (var i2 = 0; i2 < document.styleSheets.length; i2++) {
      if (document.styleSheets[i2].ownerNode === tag) {
        return document.styleSheets[i2];
      }
    }
  }
  function createStyleElement(options) {
    var tag = document.createElement("style");
    tag.setAttribute("data-emotion", options.key);
    if (options.nonce !== void 0) {
      tag.setAttribute("nonce", options.nonce);
    }
    tag.appendChild(document.createTextNode(""));
    tag.setAttribute("data-s", "");
    return tag;
  }
  var StyleSheet = /* @__PURE__ */ function() {
    function StyleSheet2(options) {
      var _this = this;
      this._insertTag = function(tag) {
        var before;
        if (_this.tags.length === 0) {
          if (_this.insertionPoint) {
            before = _this.insertionPoint.nextSibling;
          } else if (_this.prepend) {
            before = _this.container.firstChild;
          } else {
            before = _this.before;
          }
        } else {
          before = _this.tags[_this.tags.length - 1].nextSibling;
        }
        _this.container.insertBefore(tag, before);
        _this.tags.push(tag);
      };
      this.isSpeedy = options.speedy === void 0 ? true : options.speedy;
      this.tags = [];
      this.ctr = 0;
      this.nonce = options.nonce;
      this.key = options.key;
      this.container = options.container;
      this.prepend = options.prepend;
      this.insertionPoint = options.insertionPoint;
      this.before = null;
    }
    var _proto = StyleSheet2.prototype;
    _proto.hydrate = function hydrate(nodes) {
      nodes.forEach(this._insertTag);
    };
    _proto.insert = function insert(rule) {
      if (this.ctr % (this.isSpeedy ? 65e3 : 1) === 0) {
        this._insertTag(createStyleElement(this));
      }
      var tag = this.tags[this.tags.length - 1];
      if (this.isSpeedy) {
        var sheet = sheetForTag(tag);
        try {
          sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e2) {
        }
      } else {
        tag.appendChild(document.createTextNode(rule));
      }
      this.ctr++;
    };
    _proto.flush = function flush() {
      this.tags.forEach(function(tag) {
        return tag.parentNode && tag.parentNode.removeChild(tag);
      });
      this.tags = [];
      this.ctr = 0;
    };
    return StyleSheet2;
  }();
  var MS = "-ms-";
  var MOZ = "-moz-";
  var WEBKIT = "-webkit-";
  var COMMENT = "comm";
  var RULESET = "rule";
  var DECLARATION = "decl";
  var IMPORT = "@import";
  var KEYFRAMES = "@keyframes";
  var LAYER = "@layer";
  var abs = Math.abs;
  var from = String.fromCharCode;
  var assign = Object.assign;
  function hash$1(value, length2) {
    return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
  }
  function trim(value) {
    return value.trim();
  }
  function match(value, pattern) {
    return (value = pattern.exec(value)) ? value[0] : value;
  }
  function replace(value, pattern, replacement) {
    return value.replace(pattern, replacement);
  }
  function indexof(value, search) {
    return value.indexOf(search);
  }
  function charat(value, index) {
    return value.charCodeAt(index) | 0;
  }
  function substr(value, begin, end) {
    return value.slice(begin, end);
  }
  function strlen(value) {
    return value.length;
  }
  function sizeof(value) {
    return value.length;
  }
  function append(value, array) {
    return array.push(value), value;
  }
  function combine(array, callback) {
    return array.map(callback).join("");
  }
  var line = 1;
  var column = 1;
  var length = 0;
  var position = 0;
  var character = 0;
  var characters = "";
  function node(value, root2, parent, type, props, children, length2) {
    return {
      value,
      root: root2,
      parent,
      type,
      props,
      children,
      line,
      column,
      length: length2,
      return: ""
    };
  }
  function copy(root2, props) {
    return assign(node("", null, null, "", null, null, 0), root2, {
      length: -root2.length
    }, props);
  }
  function char() {
    return character;
  }
  function prev() {
    character = position > 0 ? charat(characters, --position) : 0;
    if (column--, character === 10)
      column = 1, line--;
    return character;
  }
  function next() {
    character = position < length ? charat(characters, position++) : 0;
    if (column++, character === 10)
      column = 1, line++;
    return character;
  }
  function peek() {
    return charat(characters, position);
  }
  function caret() {
    return position;
  }
  function slice(begin, end) {
    return substr(characters, begin, end);
  }
  function token(type) {
    switch (type) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      case 59:
      case 123:
      case 125:
        return 4;
      case 58:
        return 3;
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function alloc(value) {
    return line = column = 1, length = strlen(characters = value), position = 0, [];
  }
  function dealloc(value) {
    return characters = "", value;
  }
  function delimit(type) {
    return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
  }
  function whitespace(type) {
    while (character = peek())
      if (character < 33)
        next();
      else
        break;
    return token(type) > 2 || token(character) > 3 ? "" : " ";
  }
  function escaping(index, count) {
    while (--count && next())
      if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
        break;
    return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32));
  }
  function delimiter(type) {
    while (next())
      switch (character) {
        case type:
          return position;
        case 34:
        case 39:
          if (type !== 34 && type !== 39)
            delimiter(character);
          break;
        case 40:
          if (type === 41)
            delimiter(type);
          break;
        case 92:
          next();
          break;
      }
    return position;
  }
  function commenter(type, index) {
    while (next())
      if (type + character === 47 + 10)
        break;
      else if (type + character === 42 + 42 && peek() === 47)
        break;
    return "/*" + slice(index, position - 1) + "*" + from(type === 47 ? type : next());
  }
  function identifier(index) {
    while (!token(peek()))
      next();
    return slice(index, position);
  }
  function compile(value) {
    return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
  }
  function parse(value, root2, parent, rule, rules, rulesets, pseudo, points, declarations) {
    var index = 0;
    var offset = 0;
    var length2 = pseudo;
    var atrule = 0;
    var property = 0;
    var previous = 0;
    var variable = 1;
    var scanning = 1;
    var ampersand = 1;
    var character2 = 0;
    var type = "";
    var props = rules;
    var children = rulesets;
    var reference = rule;
    var characters2 = type;
    while (scanning)
      switch (previous = character2, character2 = next()) {
        case 40:
          if (previous != 108 && charat(characters2, length2 - 1) == 58) {
            if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f") != -1)
              ampersand = -1;
            break;
          }
        case 34:
        case 39:
        case 91:
          characters2 += delimit(character2);
          break;
        case 9:
        case 10:
        case 13:
        case 32:
          characters2 += whitespace(previous);
          break;
        case 92:
          characters2 += escaping(caret() - 1, 7);
          continue;
        case 47:
          switch (peek()) {
            case 42:
            case 47:
              append(comment(commenter(next(), caret()), root2, parent), declarations);
              break;
            default:
              characters2 += "/";
          }
          break;
        case 123 * variable:
          points[index++] = strlen(characters2) * ampersand;
        case 125 * variable:
        case 59:
        case 0:
          switch (character2) {
            case 0:
            case 125:
              scanning = 0;
            case 59 + offset:
              if (ampersand == -1)
                characters2 = replace(characters2, /\f/g, "");
              if (property > 0 && strlen(characters2) - length2)
                append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2), declarations);
              break;
            case 59:
              characters2 += ";";
            default:
              append(reference = ruleset(characters2, root2, parent, index, offset, rules, points, type, props = [], children = [], length2), rulesets);
              if (character2 === 123)
                if (offset === 0)
                  parse(characters2, root2, reference, reference, props, rulesets, length2, points, children);
                else
                  switch (atrule === 99 && charat(characters2, 3) === 110 ? 100 : atrule) {
                    case 100:
                    case 108:
                    case 109:
                    case 115:
                      parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2), children), rules, children, length2, points, rule ? props : children);
                      break;
                    default:
                      parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                  }
          }
          index = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
          break;
        case 58:
          length2 = 1 + strlen(characters2), property = previous;
        default:
          if (variable < 1) {
            if (character2 == 123)
              --variable;
            else if (character2 == 125 && variable++ == 0 && prev() == 125)
              continue;
          }
          switch (characters2 += from(character2), character2 * variable) {
            case 38:
              ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
              break;
            case 44:
              points[index++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
              break;
            case 64:
              if (peek() === 45)
                characters2 += delimit(next());
              atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
              break;
            case 45:
              if (previous === 45 && strlen(characters2) == 2)
                variable = 0;
          }
      }
    return rulesets;
  }
  function ruleset(value, root2, parent, index, offset, rules, points, type, props, children, length2) {
    var post = offset - 1;
    var rule = offset === 0 ? rules : [""];
    var size = sizeof(rule);
    for (var i2 = 0, j = 0, k2 = 0; i2 < index; ++i2)
      for (var x2 = 0, y2 = substr(value, post + 1, post = abs(j = points[i2])), z2 = value; x2 < size; ++x2)
        if (z2 = trim(j > 0 ? rule[x2] + " " + y2 : replace(y2, /&\f/g, rule[x2])))
          props[k2++] = z2;
    return node(value, root2, parent, offset === 0 ? RULESET : type, props, children, length2);
  }
  function comment(value, root2, parent) {
    return node(value, root2, parent, COMMENT, from(char()), substr(value, 2, -2), 0);
  }
  function declaration(value, root2, parent, length2) {
    return node(value, root2, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2);
  }
  function serialize(children, callback) {
    var output = "";
    var length2 = sizeof(children);
    for (var i2 = 0; i2 < length2; i2++)
      output += callback(children[i2], i2, children, callback) || "";
    return output;
  }
  function stringify(element, index, children, callback) {
    switch (element.type) {
      case LAYER:
        if (element.children.length)
          break;
      case IMPORT:
      case DECLARATION:
        return element.return = element.return || element.value;
      case COMMENT:
        return "";
      case KEYFRAMES:
        return element.return = element.value + "{" + serialize(element.children, callback) + "}";
      case RULESET:
        element.value = element.props.join(",");
    }
    return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
  }
  function middleware(collection) {
    var length2 = sizeof(collection);
    return function(element, index, children, callback) {
      var output = "";
      for (var i2 = 0; i2 < length2; i2++)
        output += collection[i2](element, index, children, callback) || "";
      return output;
    };
  }
  function rulesheet(callback) {
    return function(element) {
      if (!element.root) {
        if (element = element.return)
          callback(element);
      }
    };
  }
  function memoize(fn) {
    var cache2 = /* @__PURE__ */ Object.create(null);
    return function(arg) {
      if (cache2[arg] === void 0)
        cache2[arg] = fn(arg);
      return cache2[arg];
    };
  }
  var identifierWithPointTracking = function identifierWithPointTracking2(begin, points, index) {
    var previous = 0;
    var character2 = 0;
    while (true) {
      previous = character2;
      character2 = peek();
      if (previous === 38 && character2 === 12) {
        points[index] = 1;
      }
      if (token(character2)) {
        break;
      }
      next();
    }
    return slice(begin, position);
  };
  var toRules = function toRules2(parsed, points) {
    var index = -1;
    var character2 = 44;
    do {
      switch (token(character2)) {
        case 0:
          if (character2 === 38 && peek() === 12) {
            points[index] = 1;
          }
          parsed[index] += identifierWithPointTracking(position - 1, points, index);
          break;
        case 2:
          parsed[index] += delimit(character2);
          break;
        case 4:
          if (character2 === 44) {
            parsed[++index] = peek() === 58 ? "&\f" : "";
            points[index] = parsed[index].length;
            break;
          }
        default:
          parsed[index] += from(character2);
      }
    } while (character2 = next());
    return parsed;
  };
  var getRules = function getRules2(value, points) {
    return dealloc(toRules(alloc(value), points));
  };
  var fixedElements = /* @__PURE__ */ new WeakMap();
  var compat = function compat2(element) {
    if (element.type !== "rule" || !element.parent || // positive .length indicates that this rule contains pseudo
    // negative .length indicates that this rule has been already prefixed
    element.length < 1) {
      return;
    }
    var value = element.value, parent = element.parent;
    var isImplicitRule = element.column === parent.column && element.line === parent.line;
    while (parent.type !== "rule") {
      parent = parent.parent;
      if (!parent)
        return;
    }
    if (element.props.length === 1 && value.charCodeAt(0) !== 58 && !fixedElements.get(parent)) {
      return;
    }
    if (isImplicitRule) {
      return;
    }
    fixedElements.set(element, true);
    var points = [];
    var rules = getRules(value, points);
    var parentRules = parent.props;
    for (var i2 = 0, k2 = 0; i2 < rules.length; i2++) {
      for (var j = 0; j < parentRules.length; j++, k2++) {
        element.props[k2] = points[i2] ? rules[i2].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i2];
      }
    }
  };
  var removeLabel = function removeLabel2(element) {
    if (element.type === "decl") {
      var value = element.value;
      if (
        // charcode for l
        value.charCodeAt(0) === 108 && // charcode for b
        value.charCodeAt(2) === 98
      ) {
        element["return"] = "";
        element.value = "";
      }
    }
  };
  function prefix(value, length2) {
    switch (hash$1(value, length2)) {
      case 5103:
        return WEBKIT + "print-" + value + value;
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return WEBKIT + value + value;
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return WEBKIT + value + MOZ + value + MS + value + value;
      case 6828:
      case 4268:
        return WEBKIT + value + MS + value + value;
      case 6165:
        return WEBKIT + value + MS + "flex-" + value + value;
      case 5187:
        return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
      case 5443:
        return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/, "") + value;
      case 4675:
        return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/, "") + value;
      case 5548:
        return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
      case 5292:
        return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
      case 6060:
        return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
      case 4554:
        return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
      case 6187:
        return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
      case 5495:
      case 3959:
        return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
      case 4968:
        return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + WEBKIT + value + value;
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (strlen(value) - 1 - length2 > 6)
          switch (charat(value, length2 + 1)) {
            case 109:
              if (charat(value, length2 + 4) !== 45)
                break;
            case 102:
              return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
            case 115:
              return ~indexof(value, "stretch") ? prefix(replace(value, "stretch", "fill-available"), length2) + value : value;
          }
        break;
      case 4949:
        if (charat(value, length2 + 1) !== 115)
          break;
      case 6444:
        switch (charat(value, strlen(value) - 3 - (~indexof(value, "!important") && 10))) {
          case 107:
            return replace(value, ":", ":" + WEBKIT) + value;
          case 101:
            return replace(value, /(.+:)([^;!]+)(;|!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
        }
        break;
      case 5936:
        switch (charat(value, length2 + 11)) {
          case 114:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
          case 108:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
          case 45:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
        }
        return WEBKIT + value + MS + value + value;
    }
    return value;
  }
  var prefixer = function prefixer2(element, index, children, callback) {
    if (element.length > -1) {
      if (!element["return"])
        switch (element.type) {
          case DECLARATION:
            element["return"] = prefix(element.value, element.length);
            break;
          case KEYFRAMES:
            return serialize([copy(element, {
              value: replace(element.value, "@", "@" + WEBKIT)
            })], callback);
          case RULESET:
            if (element.length)
              return combine(element.props, function(value) {
                switch (match(value, /(::plac\w+|:read-\w+)/)) {
                  case ":read-only":
                  case ":read-write":
                    return serialize([copy(element, {
                      props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")]
                    })], callback);
                  case "::placeholder":
                    return serialize([copy(element, {
                      props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")]
                    }), copy(element, {
                      props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")]
                    }), copy(element, {
                      props: [replace(value, /:(plac\w+)/, MS + "input-$1")]
                    })], callback);
                }
                return "";
              });
        }
    }
  };
  var defaultStylisPlugins = [prefixer];
  var createCache = function createCache2(options) {
    var key2 = options.key;
    if (key2 === "css") {
      var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])");
      Array.prototype.forEach.call(ssrStyles, function(node2) {
        var dataEmotionAttribute = node2.getAttribute("data-emotion");
        if (dataEmotionAttribute.indexOf(" ") === -1) {
          return;
        }
        document.head.appendChild(node2);
        node2.setAttribute("data-s", "");
      });
    }
    var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;
    var inserted = {};
    var container;
    var nodesToHydrate = [];
    {
      container = options.container || document.head;
      Array.prototype.forEach.call(
        // this means we will ignore elements which don't have a space in them which
        // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
        document.querySelectorAll('style[data-emotion^="' + key2 + ' "]'),
        function(node2) {
          var attrib = node2.getAttribute("data-emotion").split(" ");
          for (var i2 = 1; i2 < attrib.length; i2++) {
            inserted[attrib[i2]] = true;
          }
          nodesToHydrate.push(node2);
        }
      );
    }
    var _insert;
    var omnipresentPlugins = [compat, removeLabel];
    {
      var currentSheet;
      var finalizingPlugins = [stringify, rulesheet(function(rule) {
        currentSheet.insert(rule);
      })];
      var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));
      var stylis = function stylis2(styles2) {
        return serialize(compile(styles2), serializer);
      };
      _insert = function insert(selector, serialized, sheet, shouldCache) {
        currentSheet = sheet;
        stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
        if (shouldCache) {
          cache2.inserted[serialized.name] = true;
        }
      };
    }
    var cache2 = {
      key: key2,
      sheet: new StyleSheet({
        key: key2,
        container,
        nonce: options.nonce,
        speedy: options.speedy,
        prepend: options.prepend,
        insertionPoint: options.insertionPoint
      }),
      nonce: options.nonce,
      inserted,
      registered: {},
      insert: _insert
    };
    cache2.sheet.hydrate(nodesToHydrate);
    return cache2;
  };
  var reactIs$1 = { exports: {} };
  var reactIs_production_min = {};
  /** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var b = "function" === typeof Symbol && Symbol.for, c = b ? Symbol.for("react.element") : 60103, d$1 = b ? Symbol.for("react.portal") : 60106, e = b ? Symbol.for("react.fragment") : 60107, f = b ? Symbol.for("react.strict_mode") : 60108, g = b ? Symbol.for("react.profiler") : 60114, h = b ? Symbol.for("react.provider") : 60109, k = b ? Symbol.for("react.context") : 60110, l = b ? Symbol.for("react.async_mode") : 60111, m$1 = b ? Symbol.for("react.concurrent_mode") : 60111, n = b ? Symbol.for("react.forward_ref") : 60112, p = b ? Symbol.for("react.suspense") : 60113, q = b ? Symbol.for("react.suspense_list") : 60120, r = b ? Symbol.for("react.memo") : 60115, t = b ? Symbol.for("react.lazy") : 60116, v = b ? Symbol.for("react.block") : 60121, w = b ? Symbol.for("react.fundamental") : 60117, x = b ? Symbol.for("react.responder") : 60118, y = b ? Symbol.for("react.scope") : 60119;
  function z(a2) {
    if ("object" === typeof a2 && null !== a2) {
      var u2 = a2.$$typeof;
      switch (u2) {
        case c:
          switch (a2 = a2.type, a2) {
            case l:
            case m$1:
            case e:
            case g:
            case f:
            case p:
              return a2;
            default:
              switch (a2 = a2 && a2.$$typeof, a2) {
                case k:
                case n:
                case t:
                case r:
                case h:
                  return a2;
                default:
                  return u2;
              }
          }
        case d$1:
          return u2;
      }
    }
  }
  function A(a2) {
    return z(a2) === m$1;
  }
  reactIs_production_min.AsyncMode = l;
  reactIs_production_min.ConcurrentMode = m$1;
  reactIs_production_min.ContextConsumer = k;
  reactIs_production_min.ContextProvider = h;
  reactIs_production_min.Element = c;
  reactIs_production_min.ForwardRef = n;
  reactIs_production_min.Fragment = e;
  reactIs_production_min.Lazy = t;
  reactIs_production_min.Memo = r;
  reactIs_production_min.Portal = d$1;
  reactIs_production_min.Profiler = g;
  reactIs_production_min.StrictMode = f;
  reactIs_production_min.Suspense = p;
  reactIs_production_min.isAsyncMode = function(a2) {
    return A(a2) || z(a2) === l;
  };
  reactIs_production_min.isConcurrentMode = A;
  reactIs_production_min.isContextConsumer = function(a2) {
    return z(a2) === k;
  };
  reactIs_production_min.isContextProvider = function(a2) {
    return z(a2) === h;
  };
  reactIs_production_min.isElement = function(a2) {
    return "object" === typeof a2 && null !== a2 && a2.$$typeof === c;
  };
  reactIs_production_min.isForwardRef = function(a2) {
    return z(a2) === n;
  };
  reactIs_production_min.isFragment = function(a2) {
    return z(a2) === e;
  };
  reactIs_production_min.isLazy = function(a2) {
    return z(a2) === t;
  };
  reactIs_production_min.isMemo = function(a2) {
    return z(a2) === r;
  };
  reactIs_production_min.isPortal = function(a2) {
    return z(a2) === d$1;
  };
  reactIs_production_min.isProfiler = function(a2) {
    return z(a2) === g;
  };
  reactIs_production_min.isStrictMode = function(a2) {
    return z(a2) === f;
  };
  reactIs_production_min.isSuspense = function(a2) {
    return z(a2) === p;
  };
  reactIs_production_min.isValidElementType = function(a2) {
    return "string" === typeof a2 || "function" === typeof a2 || a2 === e || a2 === m$1 || a2 === g || a2 === f || a2 === p || a2 === q || "object" === typeof a2 && null !== a2 && (a2.$$typeof === t || a2.$$typeof === r || a2.$$typeof === h || a2.$$typeof === k || a2.$$typeof === n || a2.$$typeof === w || a2.$$typeof === x || a2.$$typeof === y || a2.$$typeof === v);
  };
  reactIs_production_min.typeOf = z;
  {
    reactIs$1.exports = reactIs_production_min;
  }
  var reactIsExports = reactIs$1.exports;
  var reactIs = reactIsExports;
  var FORWARD_REF_STATICS = {
    "$$typeof": true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    "$$typeof": true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
  var isBrowser$2 = true;
  function getRegisteredStyles(registered, registeredStyles, classNames) {
    var rawClassName = "";
    classNames.split(" ").forEach(function(className) {
      if (registered[className] !== void 0) {
        registeredStyles.push(registered[className] + ";");
      } else {
        rawClassName += className + " ";
      }
    });
    return rawClassName;
  }
  var registerStyles = function registerStyles2(cache2, serialized, isStringTag) {
    var className = cache2.key + "-" + serialized.name;
    if (
      // we only need to add the styles to the registered cache if the
      // class name could be used further down
      // the tree but if it's a string tag, we know it won't
      // so we don't have to add it to registered cache.
      // this improves memory usage since we can avoid storing the whole style string
      (isStringTag === false || // we need to always store it if we're in compat mode and
      // in node since emotion-server relies on whether a style is in
      // the registered cache to know whether a style is global or not
      // also, note that this check will be dead code eliminated in the browser
      isBrowser$2 === false) && cache2.registered[className] === void 0
    ) {
      cache2.registered[className] = serialized.styles;
    }
  };
  var insertStyles = function insertStyles2(cache2, serialized, isStringTag) {
    registerStyles(cache2, serialized, isStringTag);
    var className = cache2.key + "-" + serialized.name;
    if (cache2.inserted[serialized.name] === void 0) {
      var current = serialized;
      do {
        cache2.insert(serialized === current ? "." + className : "", current, cache2.sheet, true);
        current = current.next;
      } while (current !== void 0);
    }
  };
  function murmur2(str) {
    var h2 = 0;
    var k2, i2 = 0, len = str.length;
    for (; len >= 4; ++i2, len -= 4) {
      k2 = str.charCodeAt(i2) & 255 | (str.charCodeAt(++i2) & 255) << 8 | (str.charCodeAt(++i2) & 255) << 16 | (str.charCodeAt(++i2) & 255) << 24;
      k2 = /* Math.imul(k, m): */
      (k2 & 65535) * 1540483477 + ((k2 >>> 16) * 59797 << 16);
      k2 ^= /* k >>> r: */
      k2 >>> 24;
      h2 = /* Math.imul(k, m): */
      (k2 & 65535) * 1540483477 + ((k2 >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
      (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
    }
    switch (len) {
      case 3:
        h2 ^= (str.charCodeAt(i2 + 2) & 255) << 16;
      case 2:
        h2 ^= (str.charCodeAt(i2 + 1) & 255) << 8;
      case 1:
        h2 ^= str.charCodeAt(i2) & 255;
        h2 = /* Math.imul(h, m): */
        (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
    }
    h2 ^= h2 >>> 13;
    h2 = /* Math.imul(h, m): */
    (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
    return ((h2 ^ h2 >>> 15) >>> 0).toString(36);
  }
  var unitlessKeys = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };
  var hyphenateRegex$1 = /[A-Z]|^ms/g;
  var animationRegex$1 = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
  var isCustomProperty$1 = function isCustomProperty2(property) {
    return property.charCodeAt(1) === 45;
  };
  var isProcessableValue$1 = function isProcessableValue2(value) {
    return value != null && typeof value !== "boolean";
  };
  var processStyleName$1 = /* @__PURE__ */ memoize(function(styleName) {
    return isCustomProperty$1(styleName) ? styleName : styleName.replace(hyphenateRegex$1, "-$&").toLowerCase();
  });
  var processStyleValue$1 = function processStyleValue2(key2, value) {
    switch (key2) {
      case "animation":
      case "animationName": {
        if (typeof value === "string") {
          return value.replace(animationRegex$1, function(match2, p1, p2) {
            cursor$1 = {
              name: p1,
              styles: p2,
              next: cursor$1
            };
            return p1;
          });
        }
      }
    }
    if (unitlessKeys[key2] !== 1 && !isCustomProperty$1(key2) && typeof value === "number" && value !== 0) {
      return value + "px";
    }
    return value;
  };
  var noComponentSelectorMessage$1 = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
  function handleInterpolation$1(mergedProps, registered, interpolation) {
    if (interpolation == null) {
      return "";
    }
    if (interpolation.__emotion_styles !== void 0) {
      return interpolation;
    }
    switch (typeof interpolation) {
      case "boolean": {
        return "";
      }
      case "object": {
        if (interpolation.anim === 1) {
          cursor$1 = {
            name: interpolation.name,
            styles: interpolation.styles,
            next: cursor$1
          };
          return interpolation.name;
        }
        if (interpolation.styles !== void 0) {
          var next2 = interpolation.next;
          if (next2 !== void 0) {
            while (next2 !== void 0) {
              cursor$1 = {
                name: next2.name,
                styles: next2.styles,
                next: cursor$1
              };
              next2 = next2.next;
            }
          }
          var styles2 = interpolation.styles + ";";
          return styles2;
        }
        return createStringFromObject$1(mergedProps, registered, interpolation);
      }
      case "function": {
        if (mergedProps !== void 0) {
          var previousCursor = cursor$1;
          var result = interpolation(mergedProps);
          cursor$1 = previousCursor;
          return handleInterpolation$1(mergedProps, registered, result);
        }
        break;
      }
    }
    if (registered == null) {
      return interpolation;
    }
    var cached = registered[interpolation];
    return cached !== void 0 ? cached : interpolation;
  }
  function createStringFromObject$1(mergedProps, registered, obj) {
    var string = "";
    if (Array.isArray(obj)) {
      for (var i2 = 0; i2 < obj.length; i2++) {
        string += handleInterpolation$1(mergedProps, registered, obj[i2]) + ";";
      }
    } else {
      for (var _key in obj) {
        var value = obj[_key];
        if (typeof value !== "object") {
          if (registered != null && registered[value] !== void 0) {
            string += _key + "{" + registered[value] + "}";
          } else if (isProcessableValue$1(value)) {
            string += processStyleName$1(_key) + ":" + processStyleValue$1(_key, value) + ";";
          }
        } else {
          if (_key === "NO_COMPONENT_SELECTOR" && false) {
            throw new Error(noComponentSelectorMessage$1);
          }
          if (Array.isArray(value) && typeof value[0] === "string" && (registered == null || registered[value[0]] === void 0)) {
            for (var _i = 0; _i < value.length; _i++) {
              if (isProcessableValue$1(value[_i])) {
                string += processStyleName$1(_key) + ":" + processStyleValue$1(_key, value[_i]) + ";";
              }
            }
          } else {
            var interpolated = handleInterpolation$1(mergedProps, registered, value);
            switch (_key) {
              case "animation":
              case "animationName": {
                string += processStyleName$1(_key) + ":" + interpolated + ";";
                break;
              }
              default: {
                string += _key + "{" + interpolated + "}";
              }
            }
          }
        }
      }
    }
    return string;
  }
  var labelPattern$1 = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
  var cursor$1;
  var serializeStyles$1 = function serializeStyles2(args, registered, mergedProps) {
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].styles !== void 0) {
      return args[0];
    }
    var stringMode = true;
    var styles2 = "";
    cursor$1 = void 0;
    var strings = args[0];
    if (strings == null || strings.raw === void 0) {
      stringMode = false;
      styles2 += handleInterpolation$1(mergedProps, registered, strings);
    } else {
      styles2 += strings[0];
    }
    for (var i2 = 1; i2 < args.length; i2++) {
      styles2 += handleInterpolation$1(mergedProps, registered, args[i2]);
      if (stringMode) {
        styles2 += strings[i2];
      }
    }
    labelPattern$1.lastIndex = 0;
    var identifierName = "";
    var match2;
    while ((match2 = labelPattern$1.exec(styles2)) !== null) {
      identifierName += "-" + // $FlowFixMe we know it's not null
      match2[1];
    }
    var name = murmur2(styles2) + identifierName;
    return {
      name,
      styles: styles2,
      next: cursor$1
    };
  };
  var syncFallback = function syncFallback2(create) {
    return create();
  };
  var useInsertionEffect = React__default__namespace["useInsertionEffect"] ? React__default__namespace["useInsertionEffect"] : false;
  var useInsertionEffectAlwaysWithSyncFallback = useInsertionEffect || syncFallback;
  var useInsertionEffectWithLayoutFallback = useInsertionEffect || React__default__namespace.useLayoutEffect;
  var hasOwnProperty = {}.hasOwnProperty;
  var EmotionCacheContext = /* @__PURE__ */ React__default__namespace.createContext(
    // we're doing this to avoid preconstruct's dead code elimination in this one case
    // because this module is primarily intended for the browser and node
    // but it's also required in react native and similar environments sometimes
    // and we could have a special build just for that
    // but this is much easier and the native packages
    // might use a different theme context in the future anyway
    typeof HTMLElement !== "undefined" ? /* @__PURE__ */ createCache({
      key: "css"
    }) : null
  );
  EmotionCacheContext.Provider;
  var withEmotionCache = function withEmotionCache2(func) {
    return /* @__PURE__ */ React__default.forwardRef(function(props, ref) {
      var cache2 = React__default.useContext(EmotionCacheContext);
      return func(props, cache2, ref);
    });
  };
  var ThemeContext = /* @__PURE__ */ React__default__namespace.createContext({});
  var typePropName = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__";
  var createEmotionProps = function createEmotionProps2(type, props) {
    var newProps = {};
    for (var key2 in props) {
      if (hasOwnProperty.call(props, key2)) {
        newProps[key2] = props[key2];
      }
    }
    newProps[typePropName] = type;
    return newProps;
  };
  var Insertion = function Insertion2(_ref13) {
    var cache2 = _ref13.cache, serialized = _ref13.serialized, isStringTag = _ref13.isStringTag;
    registerStyles(cache2, serialized, isStringTag);
    useInsertionEffectAlwaysWithSyncFallback(function() {
      return insertStyles(cache2, serialized, isStringTag);
    });
    return null;
  };
  var Emotion = /* @__PURE__ */ withEmotionCache(function(props, cache2, ref) {
    var cssProp = props.css;
    if (typeof cssProp === "string" && cache2.registered[cssProp] !== void 0) {
      cssProp = cache2.registered[cssProp];
    }
    var WrappedComponent = props[typePropName];
    var registeredStyles = [cssProp];
    var className = "";
    if (typeof props.className === "string") {
      className = getRegisteredStyles(cache2.registered, registeredStyles, props.className);
    } else if (props.className != null) {
      className = props.className + " ";
    }
    var serialized = serializeStyles$1(registeredStyles, void 0, React__default__namespace.useContext(ThemeContext));
    className += cache2.key + "-" + serialized.name;
    var newProps = {};
    for (var key2 in props) {
      if (hasOwnProperty.call(props, key2) && key2 !== "css" && key2 !== typePropName && true) {
        newProps[key2] = props[key2];
      }
    }
    newProps.ref = ref;
    newProps.className = className;
    return /* @__PURE__ */ React__default__namespace.createElement(React__default__namespace.Fragment, null, /* @__PURE__ */ React__default__namespace.createElement(Insertion, {
      cache: cache2,
      serialized,
      isStringTag: typeof WrappedComponent === "string"
    }), /* @__PURE__ */ React__default__namespace.createElement(WrappedComponent, newProps));
  });
  var Emotion$1 = Emotion;
  var Fragment = jsxRuntimeExports.Fragment;
  function jsx(type, props, key2) {
    if (!hasOwnProperty.call(props, "css")) {
      return jsxRuntimeExports.jsx(type, props, key2);
    }
    return jsxRuntimeExports.jsx(Emotion$1, createEmotionProps(type, props), key2);
  }
  function jsxs(type, props, key2) {
    if (!hasOwnProperty.call(props, "css")) {
      return jsxRuntimeExports.jsxs(type, props, key2);
    }
    return jsxRuntimeExports.jsxs(Emotion$1, createEmotionProps(type, props), key2);
  }
  const LX_THEMES = [
    {
      id: "green",
      name: "绿意盎然",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(77, 175, 124)",
      colorTheme: "rgb(77, 175, 124)"
    },
    {
      id: "blue",
      name: "蓝田生玉",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(52, 152, 219)",
      colorTheme: "rgb(52, 152, 219)"
    },
    {
      id: "blue_plus",
      name: "蛋雅深蓝",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(77, 131, 175)",
      colorTheme: "rgb(77, 131, 175)"
    },
    {
      id: "orange",
      name: "橙黄橘绿",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(245, 171, 53)",
      colorTheme: "rgb(245, 171, 53)"
    },
    {
      id: "red",
      name: "热情似火",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(214, 69, 65)",
      colorTheme: "rgb(214, 69, 65)"
    },
    {
      id: "pink",
      name: "粉装玉琢",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(241, 130, 141)",
      colorTheme: "rgb(241, 130, 141)"
    },
    {
      id: "purple",
      name: "重斤球紫",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(155, 89, 182)",
      colorTheme: "rgb(155, 89, 182)"
    },
    {
      id: "grey",
      name: "灰常美丽",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(108, 122, 137)",
      colorTheme: "rgb(108, 122, 137)"
    },
    {
      id: "ming",
      name: "青出于黑",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(51, 110, 123)",
      colorTheme: "rgb(51, 110, 123)"
    },
    {
      id: "blue2",
      name: "清热板蓝",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(79, 98, 208)",
      colorTheme: "rgb(79, 98, 208)"
    },
    {
      id: "black",
      name: "黑灯瞎火",
      isDark: true,
      isCustom: false,
      colorPrimary: "rgb(150, 150, 150)",
      colorTheme: "rgb(59,59,59)"
    },
    {
      id: "mid_autumn",
      name: "月里嫦娥",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(74, 55, 82)",
      colorTheme: "rgb(74, 55, 82)"
    },
    {
      id: "naruto",
      name: "木叶之村",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(87, 144, 167)",
      colorTheme: "rgb(87, 144, 167)"
    },
    {
      id: "china_ink",
      name: "近墨者黑",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgba(47, 47, 47, 1)",
      colorTheme: "rgba(47, 47, 47, 1)"
    },
    {
      id: "happy_new_year",
      name: "新年快乐",
      isDark: false,
      isCustom: false,
      colorPrimary: "rgb(192, 57, 43)",
      colorTheme: "rgb(192, 57, 43)"
    }
  ];
  const colorPrimaryIdentifier = `--${APP_NAME}-color-primary`;
  const colorPrimaryValue = `var(${colorPrimaryIdentifier})`;
  const DEFAULT_BILI_PINK_THEME = {
    id: "default-bili-pink",
    name: "B站粉",
    isDark: false,
    isCustom: false,
    colorPrimary: "#ff6699"
  };
  const COLOR_PICKER_THEME = {
    id: "color-picker",
    name: "自定义",
    isDark: false,
    isCustom: true,
    colorPrimary: "#ff6699"
  };
  function toThemes(groupName, definitionStr) {
    return definitionStr.split("\n").map((s2) => s2.trim()).filter(Boolean).map((line2) => {
      const [colorPrimary, name] = line2.split(" ").filter(Boolean);
      return {
        id: groupName + ":" + name,
        name,
        colorPrimary
      };
    });
  }
  const LongwashingGroupName = "UP长期洗涤";
  const LongwashingThemes = toThemes(LongwashingGroupName, `
  #0545b2 理想之蓝
  #f4cd00 柠檬黄
  #ef2729 石榴红
  #f89c00 鹿箭
  #233728 黛绿
  #f2b9b7 和熙粉
  #f3cc91 芝士黄
  #6b4c68 葡萄紫
  #ff7227 落日橙
  #004d62 碧海天
  #23909b 洗碧空
  #aeb400 芥丝绿
  #425a17 箬叶青

  #002FA7 克莱因蓝
  #003153 普鲁士蓝
  #01847F 马尔斯绿
  #FBD26A 申布伦黄
  #470024 勃艮第红
  #492D22 凡戴克棕
  `);
  const ThemeGroups = [{
    name: "预设",
    themes: [DEFAULT_BILI_PINK_THEME, {
      id: "bilibili-blue",
      name: "B站蓝",
      colorPrimary: "#00aeec"
    }, {
      id: "app-靓紫",
      name: "靓紫",
      colorPrimary: "#8500ff"
    }, COLOR_PICKER_THEME]
  }, {
    name: "移动端",
    themes: [{
      id: "app-custom-高能红",
      name: "高能红",
      colorPrimary: "#fd453e"
    }, {
      id: "app-custom-咸蛋黄",
      name: "咸蛋黄",
      colorPrimary: "#ffc034"
    }, {
      id: "app-custom-早苗绿",
      name: "早苗绿",
      colorPrimary: "#85c255"
    }, {
      id: "app-custom-宝石蓝",
      name: "宝石蓝",
      colorPrimary: "#0095ef"
    }, {
      id: "app-custom-罗兰紫",
      name: "罗兰紫",
      colorPrimary: "#a029ac"
    }]
  }, {
    name: "LX Themes",
    themes: LX_THEMES,
    tooltip: /* @__PURE__ */ jsxs(Fragment, {
      children: ["提取自", " ", /* @__PURE__ */ jsx("a", {
        target: "_blank",
        href: "https://github.com/lyswhut/lx-music-desktop/",
        children: "lx-music-desktop"
      }), /* @__PURE__ */ jsx("br", {}), "Apache License 2.0"]
    })
  }, {
    name: LongwashingGroupName,
    themes: LongwashingThemes,
    tooltip: /* @__PURE__ */ jsxs(Fragment, {
      children: ["提取自", " ", /* @__PURE__ */ jsx("a", {
        target: "_blank",
        href: "https://www.bilibili.com/video/BV1g3411u7Lg/",
        children: "BV1g3411u7Lg"
      }), " ", "&", " ", /* @__PURE__ */ jsx("a", {
        target: "_blank",
        href: "https://www.bilibili.com/video/BV1xu411q7sU/",
        children: "BV1xu411q7sU"
      })]
    })
  }];
  const ALL_THEMES = ThemeGroups.map((x2) => x2.themes).flat();
  function useCurrentTheme() {
    let {
      theme: themeId,
      colorPickerThemeSelectedColor
    } = useSettingsSnapshot();
    themeId || (themeId = DEFAULT_BILI_PINK_THEME.id);
    return React__default.useMemo(() => {
      const theme2 = ALL_THEMES.find((t2) => t2.id === themeId) || DEFAULT_BILI_PINK_THEME;
      if (theme2.id === COLOR_PICKER_THEME.id && colorPickerThemeSelectedColor) {
        theme2.colorPrimary = colorPickerThemeSelectedColor;
      }
      return theme2;
    }, [themeId, colorPickerThemeSelectedColor]);
  }
  var hyphenateRegex = /[A-Z]|^ms/g;
  var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
  var isCustomProperty = function isCustomProperty22(property) {
    return property.charCodeAt(1) === 45;
  };
  var isProcessableValue = function isProcessableValue22(value) {
    return value != null && typeof value !== "boolean";
  };
  var processStyleName = /* @__PURE__ */ memoize(function(styleName) {
    return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, "-$&").toLowerCase();
  });
  var processStyleValue = function processStyleValue22(key2, value) {
    switch (key2) {
      case "animation":
      case "animationName": {
        if (typeof value === "string") {
          return value.replace(animationRegex, function(match2, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
    }
    if (unitlessKeys[key2] !== 1 && !isCustomProperty(key2) && typeof value === "number" && value !== 0) {
      return value + "px";
    }
    return value;
  };
  var noComponentSelectorMessage = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
  function handleInterpolation(mergedProps, registered, interpolation) {
    if (interpolation == null) {
      return "";
    }
    if (interpolation.__emotion_styles !== void 0) {
      return interpolation;
    }
    switch (typeof interpolation) {
      case "boolean": {
        return "";
      }
      case "object": {
        if (interpolation.anim === 1) {
          cursor = {
            name: interpolation.name,
            styles: interpolation.styles,
            next: cursor
          };
          return interpolation.name;
        }
        if (interpolation.styles !== void 0) {
          var next2 = interpolation.next;
          if (next2 !== void 0) {
            while (next2 !== void 0) {
              cursor = {
                name: next2.name,
                styles: next2.styles,
                next: cursor
              };
              next2 = next2.next;
            }
          }
          var styles2 = interpolation.styles + ";";
          return styles2;
        }
        return createStringFromObject(mergedProps, registered, interpolation);
      }
      case "function": {
        if (mergedProps !== void 0) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result);
        }
        break;
      }
    }
    if (registered == null) {
      return interpolation;
    }
    var cached = registered[interpolation];
    return cached !== void 0 ? cached : interpolation;
  }
  function createStringFromObject(mergedProps, registered, obj) {
    var string = "";
    if (Array.isArray(obj)) {
      for (var i2 = 0; i2 < obj.length; i2++) {
        string += handleInterpolation(mergedProps, registered, obj[i2]) + ";";
      }
    } else {
      for (var _key in obj) {
        var value = obj[_key];
        if (typeof value !== "object") {
          if (registered != null && registered[value] !== void 0) {
            string += _key + "{" + registered[value] + "}";
          } else if (isProcessableValue(value)) {
            string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
          }
        } else {
          if (_key === "NO_COMPONENT_SELECTOR" && false) {
            throw new Error(noComponentSelectorMessage);
          }
          if (Array.isArray(value) && typeof value[0] === "string" && (registered == null || registered[value[0]] === void 0)) {
            for (var _i = 0; _i < value.length; _i++) {
              if (isProcessableValue(value[_i])) {
                string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
              }
            }
          } else {
            var interpolated = handleInterpolation(mergedProps, registered, value);
            switch (_key) {
              case "animation":
              case "animationName": {
                string += processStyleName(_key) + ":" + interpolated + ";";
                break;
              }
              default: {
                string += _key + "{" + interpolated + "}";
              }
            }
          }
        }
      }
    }
    return string;
  }
  var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
  var cursor;
  var serializeStyles = function serializeStyles22(args, registered, mergedProps) {
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].styles !== void 0) {
      return args[0];
    }
    var stringMode = true;
    var styles2 = "";
    cursor = void 0;
    var strings = args[0];
    if (strings == null || strings.raw === void 0) {
      stringMode = false;
      styles2 += handleInterpolation(mergedProps, registered, strings);
    } else {
      styles2 += strings[0];
    }
    for (var i2 = 1; i2 < args.length; i2++) {
      styles2 += handleInterpolation(mergedProps, registered, args[i2]);
      if (stringMode) {
        styles2 += strings[i2];
      }
    }
    labelPattern.lastIndex = 0;
    var identifierName = "";
    var match2;
    while ((match2 = labelPattern.exec(styles2)) !== null) {
      identifierName += "-" + // $FlowFixMe we know it's not null
      match2[1];
    }
    var name = murmur2(styles2) + identifierName;
    return {
      name,
      styles: styles2,
      next: cursor
    };
  };
  function insertWithoutScoping(cache2, serialized) {
    if (cache2.inserted[serialized.name] === void 0) {
      return cache2.insert("", serialized, cache2.sheet, true);
    }
  }
  function merge(registered, css2, className) {
    var registeredStyles = [];
    var rawClassName = getRegisteredStyles(registered, registeredStyles, className);
    if (registeredStyles.length < 2) {
      return className;
    }
    return rawClassName + css2(registeredStyles);
  }
  var createEmotion = function createEmotion2(options) {
    var cache2 = createCache(options);
    cache2.sheet.speedy = function(value) {
      this.isSpeedy = value;
    };
    cache2.compat = true;
    var css2 = function css22() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var serialized = serializeStyles(args, cache2.registered, void 0);
      insertStyles(cache2, serialized, false);
      return cache2.key + "-" + serialized.name;
    };
    var keyframes = function keyframes2() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var serialized = serializeStyles(args, cache2.registered);
      var animation = "animation-" + serialized.name;
      insertWithoutScoping(cache2, {
        name: serialized.name,
        styles: "@keyframes " + animation + "{" + serialized.styles + "}"
      });
      return animation;
    };
    var injectGlobal = function injectGlobal2() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var serialized = serializeStyles(args, cache2.registered);
      insertWithoutScoping(cache2, serialized);
    };
    var cx2 = function cx22() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return merge(cache2.registered, css2, classnames$1(args));
    };
    return {
      css: css2,
      cx: cx2,
      injectGlobal,
      keyframes,
      hydrate: function hydrate(ids2) {
        ids2.forEach(function(key2) {
          cache2.inserted[key2] = true;
        });
      },
      flush: function flush() {
        cache2.registered = {};
        cache2.inserted = {};
        cache2.sheet.flush();
      },
      // $FlowFixMe
      sheet: cache2.sheet,
      cache: cache2,
      getRegisteredStyles: getRegisteredStyles.bind(null, cache2.registered),
      merge: merge.bind(null, cache2.registered, css2)
    };
  };
  var classnames$1 = function classnames2(args) {
    var cls = "";
    for (var i2 = 0; i2 < args.length; i2++) {
      var arg = args[i2];
      if (arg == null)
        continue;
      var toAdd = void 0;
      switch (typeof arg) {
        case "boolean":
          break;
        case "object": {
          if (Array.isArray(arg)) {
            toAdd = classnames2(arg);
          } else {
            toAdd = "";
            for (var k2 in arg) {
              if (arg[k2] && k2) {
                toAdd && (toAdd += " ");
                toAdd += k2;
              }
            }
          }
          break;
        }
        default: {
          toAdd = arg;
        }
      }
      if (toAdd) {
        cls && (cls += " ");
        cls += toAdd;
      }
    }
    return cls;
  };
  var _createEmotion = createEmotion({
    key: "css"
  }), css$1 = _createEmotion.css;
  const toastContainer = /* @__PURE__ */ css$1("position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);z-index:90000;padding:12px 24px;font-size:14px;min-width:200px;width:max-content;max-width:450px;color:#fff;background-color:#ffb243;background-color:", colorPrimaryValue, ";border-radius:6px;white-space:pre-wrap;", "");
  const singleLine = /* @__PURE__ */ css$1({
    name: "1azakc",
    styles: "text-align:center"
  });
  function toast(msg, duration2 = 2e3) {
    const div = document.createElement("div");
    div.classList.add(toastContainer, APP_NAME_ROOT_CLASSNAME);
    div.innerText = msg;
    if (!msg.includes("\n") && !msg.includes("<br")) {
      div.classList.add(singleLine);
    }
    document.body.appendChild(div);
    setTimeout(() => div.remove(), duration2);
  }
  function toastRequestFail() {
    return toast(REQUEST_FAIL_MSG);
  }
  function parseCookie() {
    const cookies = {};
    document.cookie.split(";").map((pair) => pair.trim()).filter(Boolean).forEach((pair) => {
      const [key2, val] = pair.split("=").map((s2) => s2.trim()).filter(Boolean);
      if (!key2)
        return;
      cookies[key2] = val;
    });
    return cookies;
  }
  function getCsrfToken() {
    const csrfToken = parseCookie().bili_jct;
    if (!csrfToken) {
      toast("找不到 csrf token, 请检查是否登录");
      throw new Error("找不到 csrf token, 请检查是否登录");
    }
    return csrfToken;
  }
  function getUid() {
    return parseCookie().DedeUserID;
  }
  function getHasLogined() {
    const cookies = parseCookie();
    return !!cookies.DedeUserID;
  }
  const loginState = proxy({
    cookie: document.cookie,
    logined: getHasLogined()
  });
  function checkLoginStatus() {
    Object.assign(loginState, {
      cookie: document.cookie,
      logined: getHasLogined()
    });
    return loginState.logined;
  }
  function useHasLogined() {
    return useSnapshot(loginState).logined;
  }
  async function listAll() {
    var _a2;
    const json = (await request.get("https://member.bilibili.com/x/web/draft/list")).data;
    const drafts = ((_a2 = json.artlist) == null ? void 0 : _a2.drafts) || [];
    return drafts;
  }
  async function addupdate(payload) {
    var _a2, _b2;
    const form = new URLSearchParams({
      title: "",
      banner_url: "",
      content: "",
      summary: "",
      words: "0",
      category: "15",
      tid: "0",
      reprint: "0",
      tags: "",
      image_urls: "",
      origin_image_urls: "",
      dynamic_intro: "",
      media_id: "0",
      spoiler: "0",
      original: "0",
      top_video_bvid: "",
      aid: "",
      csrf: getCsrfToken(),
      ...payload
    });
    const json = (await request.post("/x/article/creative/draft/addupdate", form)).data;
    const aid2 = (_b2 = (_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.aid) == null ? void 0 : _b2.toString();
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || "addupdate error");
    }
    return {
      success,
      aid: aid2
    };
  }
  async function draftView(aid2) {
    var _a2;
    const json = (await request.get("/x/article/creative/draft/view", {
      params: {
        aid: aid2
      }
    })).data;
    return ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.content) || "";
  }
  async function getData() {
    const allDrafts = await listAll();
    const draft = allDrafts.find((d2) => d2.title === APP_NAME);
    if (!draft) {
      await addupdate({
        title: APP_NAME
      });
      return;
    }
    const content = await draftView(draft.id);
    const parser = new DOMParser();
    const parsed = parser.parseFromString(content, "text/html");
    const text = (parsed.body.textContent || "").trim();
    if (!text)
      return;
    try {
      return JSON.parse(text);
    } catch (e2) {
      return;
    }
  }
  let aid = "";
  async function setData(data) {
    if (!aid) {
      const allDrafts = await listAll();
      const draft = allDrafts.find((d2) => d2.title === APP_NAME);
      if (!draft) {
        const {
          success: success2,
          aid: newDraftAid
        } = await addupdate({
          title: APP_NAME
        });
        if (!success2)
          return false;
        aid = newDraftAid;
      } else {
        aid = draft.id.toString();
      }
    }
    const dataStr = JSON.stringify(data);
    const {
      success
    } = await addupdate({
      aid,
      title: APP_NAME,
      content: `<p>${dataStr}</p>`,
      words: dataStr.length.toString()
    });
    return success;
  }
  const debug$8 = baseDebug.extend("settings");
  const initialSettings = {
    accessKey: "",
    accessKeyExpireAt: 0,
    // 窄屏模式
    useNarrowMode: false,
    // 纯推荐模式
    pureRecommend: false,
    /**
     * app recommend
     */
    appApiDecice: AppApiDevice.ipad,
    /**
     * 查看更多, aka ModalFeed
     */
    // 自动查看更多
    showModalFeedOnLoad: false,
    // "查看更多" 按钮
    showModalFeedEntry: true,
    // ModalFeed.全屏
    modalFeedFullScreen: false,
    /**
     * Video Card
     */
    // 自动开始预览
    autoPreviewWhenKeyboardSelect: false,
    // 自动预览更新间隔
    autoPreviewUpdateInterval: 400,
    // 鼠标悬浮自动预览, 不再跟随鼠标位置, 默认: 跟随鼠标
    autoPreviewWhenHover: false,
    // 颜色主题
    theme: "",
    colorPickerThemeSelectedColor: "",
    // 自定义颜色
    /**
     * tab=watchlater
     */
    shuffleForWatchLater: true,
    // 打乱顺序
    addSeparatorForWatchLater: true,
    // 添加 "近期" / "更早" 分割线
    /**
     * tab=fav
     */
    shuffleForFav: true,
    // 打乱顺序
    excludeFavFolderIds: [],
    // 忽略的收藏夹
    addSeparatorForFav: true,
    // 收藏夹分割线
    /**
     * tab=popular-general
     */
    // shuffleForPopularGeneral: false, // shuffle
    anonymousForPopularGeneral: false,
    // without credentials
    /**
     * tab=popular-weekly
     */
    shuffleForPopularWeekly: false,
    /**
     * 过滤器模块
     * 使用 flat config 方便使用 FlagSettingItem
     */
    filterEnabled: true,
    // 最少播放量
    filterMinPlayCountEnabled: false,
    filterMinPlayCount: 1e4,
    // 时长
    filterMinDurationEnabled: false,
    filterMinDuration: 60,
    // 60s
    // 已关注UP的推荐视频, 默认不参与过滤
    enableFilterForFollowedVideo: false,
    // filter out whose goto = 'picture'
    filterOutGotoTypePicture: false,
    // 已关注UP的推荐图文, 默认不参与过滤
    // 图文也是有 rcmd_reason = '已关注' 的
    enableFilterForFollowedPicture: false,
    /**
     * 外观
     */
    // 自用新样式
    styleFancy: false,
    // video-source-tab 高度, 默认 compact
    styleUseStandardVideoSourceTab: false,
    // sticky tabbar
    styleUseStickyTabbarInPureRecommend: true,
    /**
     * 功能
     */
    backupSettingsToArticleDraft: false,
    // 点击视频默认在 popup 中打开
    openVideoInPopupWhenClick: false,
    // 新标签打开时, 自动全屏
    openVideoAutoFullscreen: false,
    /**
     * 隐藏的 tab, 使用黑名单, 功能迭代之后新增的 tab, 默认开启.
     * 如果使用白名单, 新增的 tab 会被隐藏
     */
    hidingTabKeys: [],
    customTabKeysOrder: []
  };
  const settings = proxy({
    ...initialSettings
  });
  const allowedSettingsKeys = Object.keys(initialSettings);
  function useSettingsSnapshot() {
    return useSnapshot(settings);
  }
  const nsp = APP_NAME;
  const key = `${nsp}.settings`;
  async function load() {
    const val = await GM.getValue(key);
    if (val && typeof val === "object") {
      Object.assign(settings, lodash.pick(val, allowedSettingsKeys));
    }
    subscribe$3(settings, () => {
      save();
    });
  }
  const setDataThrottled = lodash.throttle(setData, ms$1("5s"));
  async function save() {
    const newVal = snapshot(settings);
    await GM.setValue(key, newVal);
    await saveToDraft(newVal);
  }
  async function saveToDraft(val) {
    if (!val.backupSettingsToArticleDraft)
      return;
    if (HAS_RESTORED_SETTINGS)
      return;
    const httpBackupVal = lodash.omit(val, ["accessKey", "accessKeyExpireAt"]);
    try {
      await setDataThrottled(httpBackupVal);
      debug$8("backup to article draft complete");
    } catch (e2) {
      console.error(e2.stack || e2);
    }
  }
  function updateSettings(c2) {
    Object.assign(settings, c2);
  }
  function resetSettings() {
    return updateSettings(initialSettings);
  }
  await( load());
  if (IN_BILIBILI_HOMEPAGE && settings.accessKey && settings.accessKeyExpireAt && Date.now() >= settings.accessKeyExpireAt) {
    toast("access_key 已过期, 请重新获取 !!!");
  }
  const getIsInternalTesting = lodash.once(() => {
    return !!document.querySelectorAll(".bili-feed4").length;
  });
  const getIsDarkMode = () => document.body.classList.contains("dark") || document.body.classList.contains("bilibili-helper-dark-mode");
  const isDarkModeState = proxy({
    value: getIsDarkMode()
  });
  function useIsDarkMode() {
    return useSnapshot(isDarkModeState).value;
  }
  const darkOb = new MutationObserver(function() {
    isDarkModeState.value = getIsDarkMode();
  });
  darkOb.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  darkOb.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-darkreader-scheme"]
  });
  window.addEventListener("unload", () => {
    darkOb.disconnect();
  });
  const uaParseResult = UAParser();
  const isMac = ((_a = uaParseResult.os.name) == null ? void 0 : _a.toLowerCase()) === "mac os";
  const isSafari = ((_b = uaParseResult.browser.name) == null ? void 0 : _b.toLowerCase()) === "safari";
  const defaultHeader = () => document.querySelector(".bili-header__bar");
  function isUsingCustomHeader() {
    const el = defaultHeader();
    return Boolean(el && window.getComputedStyle(el).display === "none");
  }
  function calcHeaderHeight() {
    if (!isUsingCustomHeader())
      return 64;
    const fixed = document.body.classList.contains("fixed-navbar");
    if (!fixed)
      return 0;
    const heightDef = document.documentElement.style.getPropertyValue("--navbar-height");
    if (!heightDef)
      return 50;
    const height = Number(heightDef.replace("px", ""));
    if (isNaN(height))
      return 50;
    return height;
  }
  const headerHeightState = proxy({
    value: calcHeaderHeight()
  });
  function useHeaderHeight() {
    return useSnapshot(headerHeightState).value;
  }
  function getHeaderHeight() {
    return headerHeightState.value;
  }
  setTimeout(() => {
    headerHeightState.value = calcHeaderHeight();
    const ob = new MutationObserver(() => {
      headerHeightState.value = calcHeaderHeight();
    });
    ob.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"]
    });
    ob.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
    window.addEventListener("unload", () => {
      ob.disconnect();
    });
  }, 2e3);
  let AntdMessage = antd.message;
  const messageConfig = {
    // duration: default 3, 单位秒
    maxCount: 5,
    top: getHeaderHeight() + 5
  };
  antd.message.config(messageConfig);
  function UseApp() {
    const h2 = useHeaderHeight();
    return /* @__PURE__ */ jsx(antd.App, {
      component: false,
      message: {
        ...messageConfig,
        top: h2 + 5
      },
      children: /* @__PURE__ */ jsx(UseAppInner, {})
    });
  }
  function UseAppInner() {
    const staticFunction = antd.App.useApp();
    AntdMessage = staticFunction.message;
    staticFunction.notification;
    return null;
  }
  var Global = /* @__PURE__ */ withEmotionCache(function(props, cache2) {
    var styles2 = props.styles;
    var serialized = serializeStyles$1([styles2], void 0, React__default__namespace.useContext(ThemeContext));
    var sheetRef = React__default__namespace.useRef();
    useInsertionEffectWithLayoutFallback(function() {
      var key2 = cache2.key + "-global";
      var sheet = new cache2.sheet.constructor({
        key: key2,
        nonce: cache2.sheet.nonce,
        container: cache2.sheet.container,
        speedy: cache2.sheet.isSpeedy
      });
      var rehydrating = false;
      var node2 = document.querySelector('style[data-emotion="' + key2 + " " + serialized.name + '"]');
      if (cache2.sheet.tags.length) {
        sheet.before = cache2.sheet.tags[0];
      }
      if (node2 !== null) {
        rehydrating = true;
        node2.setAttribute("data-emotion", key2);
        sheet.hydrate([node2]);
      }
      sheetRef.current = [sheet, rehydrating];
      return function() {
        sheet.flush();
      };
    }, [cache2]);
    useInsertionEffectWithLayoutFallback(function() {
      var sheetRefCurrent = sheetRef.current;
      var sheet = sheetRefCurrent[0], rehydrating = sheetRefCurrent[1];
      if (rehydrating) {
        sheetRefCurrent[1] = false;
        return;
      }
      if (serialized.next !== void 0) {
        insertStyles(cache2, serialized.next, true);
      }
      if (sheet.tags.length) {
        var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
        sheet.before = element;
        sheet.flush();
      }
      cache2.insert("", serialized, sheet, false);
    }, [cache2, serialized.name]);
    return null;
  });
  function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return serializeStyles$1(args);
  }
  const USING_FONT_FAMILY = "HarmonyOS_Regular,PingFang SC,Helvetica Neue,Microsoft YaHei,sans-serif";
  function AntdApp({
    children,
    injectGlobalStyle = false,
    renderAppComponent = false
  }) {
    const dark = useIsDarkMode();
    const {
      colorPrimary
    } = useCurrentTheme();
    return /* @__PURE__ */ jsxs(antd.ConfigProvider, {
      locale: zhCN,
      theme: {
        cssVar: true,
        algorithm: dark ? antd.theme.darkAlgorithm : antd.theme.defaultAlgorithm,
        token: {
          colorPrimary,
          colorBgSpotlight: colorPrimary,
          // tooltip bg
          zIndexPopupBase: 11e3,
          // base-modal 10002
          fontFamily: USING_FONT_FAMILY
        },
        components: {
          // Message: {
          //   contentBg: colorPrimary,
          //   colorText: '#fff',
          // },
        }
      },
      children: [renderAppComponent && /* @__PURE__ */ jsx(UseApp, {}), injectGlobalStyle && /* @__PURE__ */ jsx(GlobalStyle, {}), children]
    });
  }
  var _ref$c = {
    name: "ykj9m0",
    styles: "body{background-color:var(--bg1);}"
  };
  var _ref2$b = {
    name: "bts51",
    styles: "body,.large-header,#i_cecream,.bili-header .bili-header__channel{background-color:var(--bg2);}"
  };
  var _ref3$5 = {
    name: "8xrafg",
    styles: "#i_cecream .bili-feed4-layout{display:none;}"
  };
  function GlobalStyle() {
    const {
      colorPrimary
    } = useCurrentTheme();
    const {
      styleFancy,
      pureRecommend
    } = useSettingsSnapshot();
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Global, {
        styles: css`
          :root {
            ${colorPrimaryIdentifier}: ${colorPrimary};
          }

          .${APP_NAME_ROOT_CLASSNAME} {
            font-family: ${USING_FONT_FAMILY};
            --back-top-right: 24px;

            .bili-video-card a:not(.disable-hover):hover{
              color: ${colorPrimaryValue} !important;
            }
          }

          @media (max-width: 1440px) {
            .${APP_NAME_ROOT_CLASSNAME} {
              --back-top-right: 16px;
            }
          }
        `
      }), pureRecommend && /* @__PURE__ */ jsx(Global, {
        styles: [_ref3$5, styleFancy ? _ref2$b : _ref$c, "", ""]
      })]
    });
  }
  function AntdTooltip(props) {
    return /* @__PURE__ */ jsx(antd.Tooltip, {
      ...props,
      overlayStyle: {
        width: "max-content",
        maxWidth: "50vw",
        ...props.overlayInnerStyle
      },
      children: props.children
    });
  }
  const createAbortError = () => {
    const error = new Error("Delay aborted");
    error.name = "AbortError";
    return error;
  };
  const clearMethods = /* @__PURE__ */ new WeakMap();
  function createDelay({
    clearTimeout: defaultClear,
    setTimeout: defaultSet
  } = {}) {
    return (milliseconds, {
      value,
      signal
    } = {}) => {
      if (signal == null ? void 0 : signal.aborted) {
        return Promise.reject(createAbortError());
      }
      let timeoutId;
      let settle;
      let rejectFunction;
      const clear = defaultClear ?? clearTimeout;
      const signalListener = () => {
        clear(timeoutId);
        rejectFunction(createAbortError());
      };
      const cleanup = () => {
        if (signal) {
          signal.removeEventListener("abort", signalListener);
        }
      };
      const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
          cleanup();
          resolve(value);
        };
        rejectFunction = reject;
        timeoutId = (defaultSet ?? setTimeout)(settle, milliseconds);
      });
      if (signal) {
        signal.addEventListener("abort", signalListener, {
          once: true
        });
      }
      clearMethods.set(delayPromise, () => {
        clear(timeoutId);
        timeoutId = null;
        settle();
      });
      return delayPromise;
    };
  }
  const delay = createDelay();
  const debug$7 = baseDebug.extend("utility:dom");
  const DEFAULT_TIMEOUT = 10 * 1e3;
  const DEFAULT_DELAY_INTERVAL = 200;
  async function tryAction(selector, action, moreOptions) {
    const selectorPredicate = moreOptions == null ? void 0 : moreOptions.selectorPredicate;
    const timeout = (moreOptions == null ? void 0 : moreOptions.timeout) ?? DEFAULT_TIMEOUT;
    const delayInterval = (moreOptions == null ? void 0 : moreOptions.delayInterval) ?? DEFAULT_DELAY_INTERVAL;
    const warnOnTimeout = (moreOptions == null ? void 0 : moreOptions.warnOnTimeout) ?? true;
    let arr = [];
    const query = () => {
      arr = Array.from(document.querySelectorAll(selector));
      if (selectorPredicate)
        arr = arr.filter(selectorPredicate);
    };
    query();
    const start = performance.now();
    const timeoutAt = start + timeout;
    while (!arr.length && performance.now() < timeoutAt) {
      await delay(delayInterval);
      query();
    }
    if (!arr.length) {
      if (warnOnTimeout) {
        console.warn(`[${APP_NAME}]: tryAction timeout, selector = \`%s\``, selector);
      }
      return;
    }
    debug$7("tryAction: selector=`%s` count=%s", selector, arr.length);
    for (const el of arr) {
      await Promise.resolve(action(el));
    }
  }
  async function tryToRemove(selector, selectorPredicate, delayMs) {
    if (typeof delayMs === "number")
      await delay(delayMs);
    return tryAction(selector, (el) => el.remove(), {
      selectorPredicate
    });
  }
  function shouldDisableShortcut() {
    var _a2;
    const activeTagName = (((_a2 = document.activeElement) == null ? void 0 : _a2.tagName) || "").toLowerCase();
    if (["input", "textarea"].includes(activeTagName)) {
      return true;
    }
    if (document.querySelector(".center-search__bar.is-focus")) {
      return true;
    }
    return false;
  }
  function nextTick() {
    return new Promise((resolve) => {
      queueMicrotask(resolve);
    });
  }
  function whenIdle(options) {
    return new Promise((resolve) => {
      typeof requestIdleCallback === "function" ? requestIdleCallback(() => resolve(), options) : setTimeout(resolve);
    });
  }
  var createRoot;
  var m = require$$0;
  {
    createRoot = m.createRoot;
    m.hydrateRoot;
  }
  var _excluded = ["size", "strokeWidth", "strokeLinecap", "strokeLinejoin", "theme", "fill", "className", "spin"];
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys(Object(source), true).forEach(function(key2) {
        _defineProperty(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty(obj, key2, value) {
    if (key2 in obj) {
      Object.defineProperty(obj, key2, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null)
      return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0)
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2))
          continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0)
        continue;
      target[key2] = source[key2];
    }
    return target;
  }
  var DEFAULT_ICON_CONFIGS = {
    size: "1em",
    strokeWidth: 4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    rtl: false,
    theme: "outline",
    colors: {
      outline: {
        fill: "#333",
        background: "transparent"
      },
      filled: {
        fill: "#333",
        background: "#FFF"
      },
      twoTone: {
        fill: "#333",
        twoTone: "#2F88FF"
      },
      multiColor: {
        outStrokeColor: "#333",
        outFillColor: "#2F88FF",
        innerStrokeColor: "#FFF",
        innerFillColor: "#43CCF8"
      }
    },
    prefix: "i"
  };
  function guid() {
    return "icon-" + ((1 + Math.random()) * 4294967296 | 0).toString(16).substring(1);
  }
  function IconConverter(id, icon, config) {
    var fill = typeof icon.fill === "string" ? [icon.fill] : icon.fill || [];
    var colors = [];
    var theme2 = icon.theme || config.theme;
    switch (theme2) {
      case "outline":
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push("none");
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push("none");
        break;
      case "filled":
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push("#FFF");
        colors.push("#FFF");
        break;
      case "two-tone":
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push(typeof fill[1] === "string" ? fill[1] : config.colors.twoTone.twoTone);
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push(typeof fill[1] === "string" ? fill[1] : config.colors.twoTone.twoTone);
        break;
      case "multi-color":
        colors.push(typeof fill[0] === "string" ? fill[0] : "currentColor");
        colors.push(typeof fill[1] === "string" ? fill[1] : config.colors.multiColor.outFillColor);
        colors.push(typeof fill[2] === "string" ? fill[2] : config.colors.multiColor.innerStrokeColor);
        colors.push(typeof fill[3] === "string" ? fill[3] : config.colors.multiColor.innerFillColor);
        break;
    }
    return {
      size: icon.size || config.size,
      strokeWidth: icon.strokeWidth || config.strokeWidth,
      strokeLinecap: icon.strokeLinecap || config.strokeLinecap,
      strokeLinejoin: icon.strokeLinejoin || config.strokeLinejoin,
      colors,
      id
    };
  }
  var IconContext = /* @__PURE__ */ React__default.createContext(DEFAULT_ICON_CONFIGS);
  IconContext.Provider;
  function IconWrapper(name, rtl, render2) {
    return function(props) {
      var size = props.size, strokeWidth = props.strokeWidth, strokeLinecap = props.strokeLinecap, strokeLinejoin = props.strokeLinejoin, theme2 = props.theme, fill = props.fill, className = props.className, spin = props.spin, extra = _objectWithoutProperties(props, _excluded);
      var ICON_CONFIGS = React__default.useContext(IconContext);
      var id = React__default.useMemo(guid, []);
      var svgProps = IconConverter(id, {
        size,
        strokeWidth,
        strokeLinecap,
        strokeLinejoin,
        theme: theme2,
        fill
      }, ICON_CONFIGS);
      var cls = [ICON_CONFIGS.prefix + "-icon"];
      cls.push(ICON_CONFIGS.prefix + "-icon-" + name);
      if (rtl && ICON_CONFIGS.rtl) {
        cls.push(ICON_CONFIGS.prefix + "-icon-rtl");
      }
      if (spin) {
        cls.push(ICON_CONFIGS.prefix + "-icon-spin");
      }
      if (className) {
        cls.push(className);
      }
      return /* @__PURE__ */ React__default.createElement("span", _objectSpread(_objectSpread({}, extra), {}, {
        className: cls.join(" ")
      }), render2(svgProps));
    };
  }
  const _CheckSmall = IconWrapper("check-small", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M10 24L20 34L40 14",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Drag = IconWrapper("drag", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M19 10C19 12.2091 17.2091 14 15 14C12.7909 14 11 12.2091 11 10C11 7.79086 12.7909 6 15 6C17.2091 6 19 7.79086 19 10ZM15 28C17.2091 28 19 26.2091 19 24C19 21.7909 17.2091 20 15 20C12.7909 20 11 21.7909 11 24C11 26.2091 12.7909 28 15 28ZM15 42C17.2091 42 19 40.2091 19 38C19 35.7909 17.2091 34 15 34C12.7909 34 11 35.7909 11 38C11 40.2091 12.7909 42 15 42Z",
      fill: props.colors[0]
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M37 10C37 12.2091 35.2091 14 33 14C30.7909 14 29 12.2091 29 10C29 7.79086 30.7909 6 33 6C35.2091 6 37 7.79086 37 10ZM33 28C35.2091 28 37 26.2091 37 24C37 21.7909 35.2091 20 33 20C30.7909 20 29 21.7909 29 24C29 26.2091 30.7909 28 33 28ZM33 42C35.2091 42 37 40.2091 37 38C37 35.7909 35.2091 34 33 34C30.7909 34 29 35.7909 29 38C29 40.2091 30.7909 42 33 42Z",
      fill: props.colors[0]
    }));
  });
  const _TrendTwo = IconWrapper("trend-two", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M4 44H44",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M4 26L12 28V38H4V26Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M20 24L28 20V38H20V24Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M36 16L44 12V38H36V16Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M4 18L12 20L44 4H34",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Fire = IconWrapper("fire", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 44C32.2347 44 38.9998 37.4742 38.9998 29.0981C38.9998 27.0418 38.8953 24.8375 37.7555 21.4116C36.6157 17.9858 36.3861 17.5436 35.1809 15.4279C34.666 19.7454 31.911 21.5448 31.2111 22.0826C31.2111 21.5231 29.5445 15.3359 27.0176 11.6339C24.537 8 21.1634 5.61592 19.1853 4C19.1853 7.06977 18.3219 11.6339 17.0854 13.9594C15.8489 16.2849 15.6167 16.3696 14.0722 18.1002C12.5278 19.8308 11.8189 20.3653 10.5274 22.4651C9.23596 24.565 9 27.3618 9 29.4181C9 37.7942 15.7653 44 24 44Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Split = IconWrapper("split", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M19 10V7C19 5.89543 19.8954 5 21 5H41C42.1046 5 43 5.89543 43 7V29C43 30.1046 42.1046 31 41 31H37",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("rect", {
      x: "5",
      y: "18",
      width: "24",
      height: "24",
      rx: "2",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _PeopleSearch = IconWrapper("people-search", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M19 20C22.866 20 26 16.866 26 13C26 9.13401 22.866 6 19 6C15.134 6 12 9.13401 12 13C12 16.866 15.134 20 19 20Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M27 28H18.8C14.3196 28 12.0794 28 10.3681 28.8719C8.86278 29.6389 7.63893 30.8628 6.87195 32.3681C6 34.0794 6 36.3196 6 40.8V42H27",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M39.9997 41.0002L36.8281 37.8286",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M38 35C38 36.1046 37.5523 37.1046 36.8284 37.8284C36.1046 38.5523 35.1046 39 34 39C31.7909 39 30 37.2091 30 35C30 32.7909 31.7909 31 34 31C36.2091 31 38 32.7909 38 35Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _PeopleMinus = IconWrapper("people-minus", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M19 20C22.866 20 26 16.866 26 13C26 9.13401 22.866 6 19 6C15.134 6 12 9.13401 12 13C12 16.866 15.134 20 19 20Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M30 35H42H30Z",
      fill: props.colors[1]
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M30 35H42",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M27 28H18.8C14.3196 28 12.0794 28 10.3681 28.8719C8.86278 29.6389 7.63893 30.8628 6.87195 32.3681C6 34.0794 6 36.3196 6 40.8V42H27",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _PeopleDelete = IconWrapper("people-delete", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M19 20C22.866 20 26 16.866 26 13C26 9.13401 22.866 6 19 6C15.134 6 12 9.13401 12 13C12 16.866 15.134 20 19 20Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M33 31L41 39",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M33 39L41 31",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M27 28H18.8C14.3196 28 12.0794 28 10.3681 28.8719C8.86278 29.6389 7.63893 30.8628 6.87195 32.3681C6 34.0794 6 36.3196 6 40.8V42H27",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Delete = IconWrapper("delete", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M9 10V44H39V10H9Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M20 20V33",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M28 20V33",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M4 10H44",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M16 10L19.289 4H28.7771L32 10H16Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _AddTwo = IconWrapper("add-two", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M33 7.26261C30.3212 5.81915 27.2563 5 24 5C13.5066 5 5 13.5066 5 24C5 34.4934 13.5066 43 24 43C26.858 43 29.5685 42.369 32 41.2387",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M31 30L43 30",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M15 22L22 29L41 11",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M37 24V36",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _PlayTwo = IconWrapper("play-two", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("rect", {
      x: "6",
      y: "6",
      width: "36",
      height: "36",
      rx: "3",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M18.5 24V16.2058L25.25 20.1029L32 24L25.25 27.8971L18.5 31.7942V24Z",
      fill: props.colors[3],
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Unlike = IconWrapper("unlike", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C25.1936 41.9295 26.5616 41.3098 28.0099 40.5",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M34.959 27L41.8375 35.5",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M41.8375 27L34.959 35.5",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _DislikeTwo = IconWrapper("dislike-two", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M28 20L20 28L28 20Z",
      fill: props.colors[1]
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M28 20L20 28",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M20 20.0001L28 28L20 20.0001Z",
      fill: props.colors[1]
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M20 20.0001L28 28",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Copy = IconWrapper("copy", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _EfferentFour = IconWrapper("efferent-four", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M20 5L10 5C8.89543 5 8 5.89543 8 7L8 41C8 42.1046 8.89543 43 10 43L38 43C39.1046 43 40 42.1046 40 41L40 24.75",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M28 5H40V17",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M21.0001 23.9998L39 6",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Star = IconWrapper("star", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M23.9986 5L17.8856 17.4776L4 19.4911L14.0589 29.3251L11.6544 43L23.9986 36.4192L36.3454 43L33.9586 29.3251L44 19.4911L30.1913 17.4776L23.9986 5Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _FileCabinet = IconWrapper("file-cabinet", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M42 4H6V14H42V4Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M42 19H6V29H42V19Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M42 34H6V44H42V34Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M21 9H27",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M21 24H27",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M21 39H27",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }));
  });
  const _Tumblr = IconWrapper("tumblr", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M39 6H9C7.34315 6 6 7.34315 6 9V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V9C42 7.34315 40.6569 6 39 6Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M15 22V17H20V14L26 12V17H31V22H26V29C26 29 26 30.5 28 31C30 31.5 33 30 33 30L31 36H26C22.5 36 20 32.5 20 30V22H15Z",
      fill: props.colors[2]
    }));
  });
  const _Concern = IconWrapper("concern", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M10.8579 9.85803C7.23858 13.4773 5 18.4773 5 24.0002C5 29.523 7.23858 34.523 10.8579 38.1423",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M39.1421 38.1423C42.7614 34.523 45 29.523 45 24.0002C45 18.4773 42.7614 13.4773 39.1421 9.85803",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M34.8994 33.8997C37.4329 31.3662 38.9999 27.8662 38.9999 24.0002C38.9999 20.1342 37.4329 16.6342 34.8994 14.1007",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M15.1005 14.1007C12.567 16.6342 11 20.1342 11 24.0002C11 27.8662 12.567 31.3662 15.1005 33.8997",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M28.1818 20C30.2905 20 32 21.6118 32 23.6C32 26.1882 29.4545 28.4 28.1818 29.6C27.3333 30.4 26.2727 31.2 25 32C23.7273 31.2 22.6667 30.4 21.8182 29.6C20.5455 28.4 18 26.1882 18 23.6C18 21.6118 19.7095 20 21.8182 20C23.1463 20 24.316 20.6393 25 21.6093C25.684 20.6393 26.8537 20 28.1818 20Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Iphone = IconWrapper("iphone", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("rect", {
      x: "11",
      y: "4",
      width: "26",
      height: "40",
      rx: "3",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M22 10L26 10",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M20 38H28",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Computer = IconWrapper("computer", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("rect", {
      x: "19",
      y: "32",
      width: "10",
      height: "9",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("rect", {
      x: "5",
      y: "8",
      width: "38",
      height: "24",
      rx: "2",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M22 27H26",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M14 41L34 41",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Tips = IconWrapper("tips", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M40 20C40 26.8077 35.7484 32.6224 29.7555 34.9336H24H18.2445C12.2516 32.6224 8 26.8077 8 20C8 11.1634 15.1634 4 24 4C32.8366 4 40 11.1634 40 20Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M29.7557 34.9336L29.0766 43.0831C29.0334 43.6014 28.6001 44 28.08 44H19.9203C19.4002 44 18.9669 43.6014 18.9238 43.0831L18.2446 34.9336",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M18 17V23L24 20L30 23V17",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Return = IconWrapper("return", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M12.9998 8L6 14L12.9998 21",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M6 14H28.9938C35.8768 14 41.7221 19.6204 41.9904 26.5C42.2739 33.7696 36.2671 40 28.9938 40H11.9984",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _LoadingThree = IconWrapper("loading-three", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 12V15",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M32.4852 15.5147L30.3639 17.636",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M36 24H33",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M32.4852 32.4853L30.3639 30.364",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 36V33",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M15.5148 32.4853L17.6361 30.364",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M12 24H15",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M15.5148 15.5147L17.6361 17.636",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Loading = IconWrapper("loading", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M4 24C4 35.0457 12.9543 44 24 44V44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36V36",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Info = IconWrapper("info", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M24 11C25.3807 11 26.5 12.1193 26.5 13.5C26.5 14.8807 25.3807 16 24 16C22.6193 16 21.5 14.8807 21.5 13.5C21.5 12.1193 22.6193 11 24 11Z",
      fill: props.colors[2]
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24.5 34V20H23.5H22.5",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M21 34H28",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Help = IconWrapper("help", true, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z",
      fill: props.colors[2]
    }));
  });
  const _DistraughtFace = IconWrapper("distraught-face", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 29C29 29 31 33 31 33H17C17 33 19 29 24 29Z",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M32 17L29 20L32 23",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M16 17L19 20L16 23",
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Config = IconWrapper("config", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 4L18 10H10V18L4 24L10 30V38H18L24 44L30 38H38V30L44 24L38 18V10H30L24 4Z",
      fill: props.colors[1],
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z",
      fill: props.colors[3],
      stroke: props.colors[2],
      strokeWidth: props.strokeWidth,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const _Close = IconWrapper("close", false, function(props) {
    return /* @__PURE__ */ React__default.createElement("svg", {
      width: props.size,
      height: props.size,
      viewBox: "0 0 48 48",
      fill: "none"
    }, /* @__PURE__ */ React__default.createElement("path", {
      d: "M8 8L40 40",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }), /* @__PURE__ */ React__default.createElement("path", {
      d: "M8 40L40 8",
      stroke: props.colors[0],
      strokeWidth: props.strokeWidth,
      strokeLinecap: props.strokeLinecap,
      strokeLinejoin: props.strokeLinejoin
    }));
  });
  const ImportedIcons = {
    Close: _Close,
    Config: _Config,
    DistraughtFace: _DistraughtFace,
    Help: _Help,
    Info: _Info,
    Loading: _Loading,
    LoadingThree: _LoadingThree,
    Return: _Return,
    Tips: _Tips,
    Computer: _Computer,
    Iphone: _Iphone,
    Concern: _Concern,
    Tumblr: _Tumblr,
    FileCabinet: _FileCabinet,
    Star: _Star,
    EfferentFour: _EfferentFour,
    Copy: _Copy,
    DislikeTwo: _DislikeTwo,
    Unlike: _Unlike,
    PlayTwo: _PlayTwo,
    AddTwo: _AddTwo,
    Delete: _Delete,
    PeopleDelete: _PeopleDelete,
    PeopleMinus: _PeopleMinus,
    PeopleSearch: _PeopleSearch,
    Split: _Split,
    Fire: _Fire,
    TrendTwo: _TrendTwo,
    Drag: _Drag,
    CheckSmall: _CheckSmall
  };
  function IconPark({
    name,
    theme: theme2,
    size,
    fill,
    ...props
  }) {
    theme2 || (theme2 = "outline");
    size || (size = 24);
    fill || (fill = "currentColor");
    const Comp = ImportedIcons[name];
    return /* @__PURE__ */ jsx(Comp, {
      ...{
        theme: theme2,
        size,
        fill,
        ...props
      },
      style: {
        fontSize: 0,
        ...props.style
      }
    });
  }
  var classnames = { exports: {} };
  /*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  */
  (function(module) {
    (function() {
      var hasOwn = {}.hasOwnProperty;
      function classNames() {
        var classes = "";
        for (var i2 = 0; i2 < arguments.length; i2++) {
          var arg = arguments[i2];
          if (arg) {
            classes = appendClass(classes, parseValue(arg));
          }
        }
        return classes;
      }
      function parseValue(arg) {
        if (typeof arg === "string" || typeof arg === "number") {
          return arg;
        }
        if (typeof arg !== "object") {
          return "";
        }
        if (Array.isArray(arg)) {
          return classNames.apply(null, arg);
        }
        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
          return arg.toString();
        }
        var classes = "";
        for (var key2 in arg) {
          if (hasOwn.call(arg, key2) && arg[key2]) {
            classes = appendClass(classes, key2);
          }
        }
        return classes;
      }
      function appendClass(value, newClass) {
        if (!newClass) {
          return value;
        }
        if (value) {
          return value + " " + newClass;
        }
        return value + newClass;
      }
      if (module.exports) {
        classNames.default = classNames;
        module.exports = classNames;
      } else {
        window.classNames = classNames;
      }
    })();
  })(classnames);
  var classnamesExports = classnames.exports;
  const cx = /* @__PURE__ */ getDefaultExportFromCjs(classnamesExports);
  var createUpdateEffect = function(hook) {
    return function(effect, deps) {
      var isMounted = React__default.useRef(false);
      hook(function() {
        return function() {
          isMounted.current = false;
        };
      }, []);
      hook(function() {
        if (!isMounted.current) {
          isMounted.current = true;
        } else {
          return effect();
        }
      }, deps);
    };
  };
  var __assign = function() {
    __assign = Object.assign || function __assign2(t2) {
      for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
        s2 = arguments[i2];
        for (var p2 in s2)
          if (Object.prototype.hasOwnProperty.call(s2, p2))
            t2[p2] = s2[p2];
      }
      return t2;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s2, e2) {
    var t2 = {};
    for (var p2 in s2)
      if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0)
        t2[p2] = s2[p2];
    if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
        if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
          t2[p2[i2]] = s2[p2[i2]];
      }
    return t2;
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e2) {
          reject(e2);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t2[0] & 1)
        throw t2[1];
      return t2[1];
    }, trys: [], ops: [] }, f2, y2, t2, g2;
    return g2 = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
      return this;
    }), g2;
    function verb(n2) {
      return function(v2) {
        return step([n2, v2]);
      };
    }
    function step(op) {
      if (f2)
        throw new TypeError("Generator is already executing.");
      while (g2 && (g2 = 0, op[0] && (_ = 0)), _)
        try {
          if (f2 = 1, y2 && (t2 = op[0] & 2 ? y2["return"] : op[0] ? y2["throw"] || ((t2 = y2["return"]) && t2.call(y2), 0) : y2.next) && !(t2 = t2.call(y2, op[1])).done)
            return t2;
          if (y2 = 0, t2)
            op = [op[0] & 2, t2.value];
          switch (op[0]) {
            case 0:
            case 1:
              t2 = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y2 = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t2 = _.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t2[1]) {
                _.label = t2[1];
                t2 = op;
                break;
              }
              if (t2 && _.label < t2[2]) {
                _.label = t2[2];
                _.ops.push(op);
                break;
              }
              if (t2[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e2) {
          op = [6, e2];
          y2 = 0;
        } finally {
          f2 = t2 = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o2) {
    var s2 = typeof Symbol === "function" && Symbol.iterator, m2 = s2 && o2[s2], i2 = 0;
    if (m2)
      return m2.call(o2);
    if (o2 && typeof o2.length === "number")
      return {
        next: function() {
          if (o2 && i2 >= o2.length)
            o2 = void 0;
          return { value: o2 && o2[i2++], done: !o2 };
        }
      };
    throw new TypeError(s2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o2, n2) {
    var m2 = typeof Symbol === "function" && o2[Symbol.iterator];
    if (!m2)
      return o2;
    var i2 = m2.call(o2), r2, ar = [], e2;
    try {
      while ((n2 === void 0 || n2-- > 0) && !(r2 = i2.next()).done)
        ar.push(r2.value);
    } catch (error) {
      e2 = { error };
    } finally {
      try {
        if (r2 && !r2.done && (m2 = i2["return"]))
          m2.call(i2);
      } finally {
        if (e2)
          throw e2.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from2, pack) {
    if (pack || arguments.length === 2)
      for (var i2 = 0, l2 = from2.length, ar; i2 < l2; i2++) {
        if (ar || !(i2 in from2)) {
          if (!ar)
            ar = Array.prototype.slice.call(from2, 0, i2);
          ar[i2] = from2[i2];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from2));
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message2) {
    var e2 = new Error(message2);
    return e2.name = "SuppressedError", e2.error = error, e2.suppressed = suppressed, e2;
  };
  var isFunction = function(value) {
    return typeof value === "function";
  };
  var isString = function(value) {
    return typeof value === "string";
  };
  var isNumber = function(value) {
    return typeof value === "number";
  };
  function useMemoizedFn(fn) {
    var fnRef = React__default.useRef(fn);
    fnRef.current = React__default.useMemo(function() {
      return fn;
    }, [fn]);
    var memoizedFn = React__default.useRef();
    if (!memoizedFn.current) {
      memoizedFn.current = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return fnRef.current.apply(this, args);
      };
    }
    return memoizedFn.current;
  }
  const useUpdateEffect = createUpdateEffect(React__default.useEffect);
  var useAutoRunPlugin = function(fetchInstance, _a2) {
    var manual = _a2.manual, _b2 = _a2.ready, ready = _b2 === void 0 ? true : _b2, _c = _a2.defaultParams, defaultParams = _c === void 0 ? [] : _c, _d = _a2.refreshDeps, refreshDeps = _d === void 0 ? [] : _d, refreshDepsAction = _a2.refreshDepsAction;
    var hasAutoRun = React__default.useRef(false);
    hasAutoRun.current = false;
    useUpdateEffect(function() {
      if (!manual && ready) {
        hasAutoRun.current = true;
        fetchInstance.run.apply(fetchInstance, __spreadArray([], __read(defaultParams), false));
      }
    }, [ready]);
    useUpdateEffect(function() {
      if (hasAutoRun.current) {
        return;
      }
      if (!manual) {
        hasAutoRun.current = true;
        if (refreshDepsAction) {
          refreshDepsAction();
        } else {
          fetchInstance.refresh();
        }
      }
    }, __spreadArray([], __read(refreshDeps), false));
    return {
      onBefore: function() {
        if (!ready) {
          return {
            stopNow: true
          };
        }
      }
    };
  };
  useAutoRunPlugin.onInit = function(_a2) {
    var _b2 = _a2.ready, ready = _b2 === void 0 ? true : _b2, manual = _a2.manual;
    return {
      loading: !manual && ready
    };
  };
  const useAutoRunPlugin$1 = useAutoRunPlugin;
  function depsAreSame(oldDeps, deps) {
    if (oldDeps === deps)
      return true;
    for (var i2 = 0; i2 < oldDeps.length; i2++) {
      if (!Object.is(oldDeps[i2], deps[i2]))
        return false;
    }
    return true;
  }
  function useCreation(factory, deps) {
    var current = React__default.useRef({
      deps,
      obj: void 0,
      initialized: false
    }).current;
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
      current.deps = deps;
      current.obj = factory();
      current.initialized = true;
    }
    return current.obj;
  }
  function useLatest(value) {
    var ref = React__default.useRef(value);
    ref.current = value;
    return ref;
  }
  var useUnmount = function(fn) {
    var fnRef = useLatest(fn);
    React__default.useEffect(function() {
      return function() {
        fnRef.current();
      };
    }, []);
  };
  const useUnmount$1 = useUnmount;
  var cache$2 = /* @__PURE__ */ new Map();
  var setCache = function(key2, cacheTime, cachedData) {
    var currentCache = cache$2.get(key2);
    if (currentCache === null || currentCache === void 0 ? void 0 : currentCache.timer) {
      clearTimeout(currentCache.timer);
    }
    var timer = void 0;
    if (cacheTime > -1) {
      timer = setTimeout(function() {
        cache$2.delete(key2);
      }, cacheTime);
    }
    cache$2.set(key2, __assign(__assign({}, cachedData), {
      timer
    }));
  };
  var getCache = function(key2) {
    return cache$2.get(key2);
  };
  var cachePromise = /* @__PURE__ */ new Map();
  var getCachePromise = function(cacheKey2) {
    return cachePromise.get(cacheKey2);
  };
  var setCachePromise = function(cacheKey2, promise) {
    cachePromise.set(cacheKey2, promise);
    promise.then(function(res) {
      cachePromise.delete(cacheKey2);
      return res;
    }).catch(function() {
      cachePromise.delete(cacheKey2);
    });
  };
  var listeners$2 = {};
  var trigger = function(key2, data) {
    if (listeners$2[key2]) {
      listeners$2[key2].forEach(function(item) {
        return item(data);
      });
    }
  };
  var subscribe$2 = function(key2, listener) {
    if (!listeners$2[key2]) {
      listeners$2[key2] = [];
    }
    listeners$2[key2].push(listener);
    return function unsubscribe() {
      var index = listeners$2[key2].indexOf(listener);
      listeners$2[key2].splice(index, 1);
    };
  };
  var useCachePlugin = function(fetchInstance, _a2) {
    var cacheKey2 = _a2.cacheKey, _b2 = _a2.cacheTime, cacheTime = _b2 === void 0 ? 5 * 60 * 1e3 : _b2, _c = _a2.staleTime, staleTime = _c === void 0 ? 0 : _c, customSetCache = _a2.setCache, customGetCache = _a2.getCache;
    var unSubscribeRef = React__default.useRef();
    var currentPromiseRef = React__default.useRef();
    var _setCache = function(key2, cachedData) {
      if (customSetCache) {
        customSetCache(cachedData);
      } else {
        setCache(key2, cacheTime, cachedData);
      }
      trigger(key2, cachedData.data);
    };
    var _getCache = function(key2, params) {
      if (params === void 0) {
        params = [];
      }
      if (customGetCache) {
        return customGetCache(params);
      }
      return getCache(key2);
    };
    useCreation(function() {
      if (!cacheKey2) {
        return;
      }
      var cacheData = _getCache(cacheKey2);
      if (cacheData && Object.hasOwnProperty.call(cacheData, "data")) {
        fetchInstance.state.data = cacheData.data;
        fetchInstance.state.params = cacheData.params;
        if (staleTime === -1 || (/* @__PURE__ */ new Date()).getTime() - cacheData.time <= staleTime) {
          fetchInstance.state.loading = false;
        }
      }
      unSubscribeRef.current = subscribe$2(cacheKey2, function(data) {
        fetchInstance.setState({
          data
        });
      });
    }, []);
    useUnmount$1(function() {
      var _a3;
      (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
    });
    if (!cacheKey2) {
      return {};
    }
    return {
      onBefore: function(params) {
        var cacheData = _getCache(cacheKey2, params);
        if (!cacheData || !Object.hasOwnProperty.call(cacheData, "data")) {
          return {};
        }
        if (staleTime === -1 || (/* @__PURE__ */ new Date()).getTime() - cacheData.time <= staleTime) {
          return {
            loading: false,
            data: cacheData === null || cacheData === void 0 ? void 0 : cacheData.data,
            error: void 0,
            returnNow: true
          };
        } else {
          return {
            data: cacheData === null || cacheData === void 0 ? void 0 : cacheData.data,
            error: void 0
          };
        }
      },
      onRequest: function(service, args) {
        var servicePromise = getCachePromise(cacheKey2);
        if (servicePromise && servicePromise !== currentPromiseRef.current) {
          return {
            servicePromise
          };
        }
        servicePromise = service.apply(void 0, __spreadArray([], __read(args), false));
        currentPromiseRef.current = servicePromise;
        setCachePromise(cacheKey2, servicePromise);
        return {
          servicePromise
        };
      },
      onSuccess: function(data, params) {
        var _a3;
        if (cacheKey2) {
          (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
          _setCache(cacheKey2, {
            data,
            params,
            time: (/* @__PURE__ */ new Date()).getTime()
          });
          unSubscribeRef.current = subscribe$2(cacheKey2, function(d2) {
            fetchInstance.setState({
              data: d2
            });
          });
        }
      },
      onMutate: function(data) {
        var _a3;
        if (cacheKey2) {
          (_a3 = unSubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unSubscribeRef);
          _setCache(cacheKey2, {
            data,
            params: fetchInstance.state.params,
            time: (/* @__PURE__ */ new Date()).getTime()
          });
          unSubscribeRef.current = subscribe$2(cacheKey2, function(d2) {
            fetchInstance.setState({
              data: d2
            });
          });
        }
      }
    };
  };
  const useCachePlugin$1 = useCachePlugin;
  var useDebouncePlugin = function(fetchInstance, _a2) {
    var debounceWait = _a2.debounceWait, debounceLeading = _a2.debounceLeading, debounceTrailing = _a2.debounceTrailing, debounceMaxWait = _a2.debounceMaxWait;
    var debouncedRef = React__default.useRef();
    var options = React__default.useMemo(function() {
      var ret = {};
      if (debounceLeading !== void 0) {
        ret.leading = debounceLeading;
      }
      if (debounceTrailing !== void 0) {
        ret.trailing = debounceTrailing;
      }
      if (debounceMaxWait !== void 0) {
        ret.maxWait = debounceMaxWait;
      }
      return ret;
    }, [debounceLeading, debounceTrailing, debounceMaxWait]);
    React__default.useEffect(function() {
      if (debounceWait) {
        var _originRunAsync_1 = fetchInstance.runAsync.bind(fetchInstance);
        debouncedRef.current = debounce(function(callback) {
          callback();
        }, debounceWait, options);
        fetchInstance.runAsync = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return new Promise(function(resolve, reject) {
            var _a3;
            (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(debouncedRef, function() {
              _originRunAsync_1.apply(void 0, __spreadArray([], __read(args), false)).then(resolve).catch(reject);
            });
          });
        };
        return function() {
          var _a3;
          (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
          fetchInstance.runAsync = _originRunAsync_1;
        };
      }
    }, [debounceWait, options]);
    if (!debounceWait) {
      return {};
    }
    return {
      onCancel: function() {
        var _a3;
        (_a3 = debouncedRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
      }
    };
  };
  const useDebouncePlugin$1 = useDebouncePlugin;
  var useLoadingDelayPlugin = function(fetchInstance, _a2) {
    var loadingDelay = _a2.loadingDelay, ready = _a2.ready;
    var timerRef = React__default.useRef();
    if (!loadingDelay) {
      return {};
    }
    var cancelTimeout = function() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    return {
      onBefore: function() {
        cancelTimeout();
        if (ready !== false) {
          timerRef.current = setTimeout(function() {
            fetchInstance.setState({
              loading: true
            });
          }, loadingDelay);
        }
        return {
          loading: false
        };
      },
      onFinally: function() {
        cancelTimeout();
      },
      onCancel: function() {
        cancelTimeout();
      }
    };
  };
  const useLoadingDelayPlugin$1 = useLoadingDelayPlugin;
  var isBrowser = !!(typeof window !== "undefined" && window.document && window.document.createElement);
  const isBrowser$1 = isBrowser;
  function isDocumentVisible() {
    if (isBrowser$1) {
      return document.visibilityState !== "hidden";
    }
    return true;
  }
  var listeners$1 = [];
  function subscribe$1(listener) {
    listeners$1.push(listener);
    return function unsubscribe() {
      var index = listeners$1.indexOf(listener);
      listeners$1.splice(index, 1);
    };
  }
  if (isBrowser$1) {
    var revalidate$1 = function() {
      if (!isDocumentVisible())
        return;
      for (var i2 = 0; i2 < listeners$1.length; i2++) {
        var listener = listeners$1[i2];
        listener();
      }
    };
    window.addEventListener("visibilitychange", revalidate$1, false);
  }
  var usePollingPlugin = function(fetchInstance, _a2) {
    var pollingInterval = _a2.pollingInterval, _b2 = _a2.pollingWhenHidden, pollingWhenHidden = _b2 === void 0 ? true : _b2, _c = _a2.pollingErrorRetryCount, pollingErrorRetryCount = _c === void 0 ? -1 : _c;
    var timerRef = React__default.useRef();
    var unsubscribeRef = React__default.useRef();
    var countRef = React__default.useRef(0);
    var stopPolling = function() {
      var _a3;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      (_a3 = unsubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unsubscribeRef);
    };
    useUpdateEffect(function() {
      if (!pollingInterval) {
        stopPolling();
      }
    }, [pollingInterval]);
    if (!pollingInterval) {
      return {};
    }
    return {
      onBefore: function() {
        stopPolling();
      },
      onError: function() {
        countRef.current += 1;
      },
      onSuccess: function() {
        countRef.current = 0;
      },
      onFinally: function() {
        if (pollingErrorRetryCount === -1 || // When an error occurs, the request is not repeated after pollingErrorRetryCount retries
        pollingErrorRetryCount !== -1 && countRef.current <= pollingErrorRetryCount) {
          timerRef.current = setTimeout(function() {
            if (!pollingWhenHidden && !isDocumentVisible()) {
              unsubscribeRef.current = subscribe$1(function() {
                fetchInstance.refresh();
              });
            } else {
              fetchInstance.refresh();
            }
          }, pollingInterval);
        } else {
          countRef.current = 0;
        }
      },
      onCancel: function() {
        stopPolling();
      }
    };
  };
  const usePollingPlugin$1 = usePollingPlugin;
  function limit(fn, timespan) {
    var pending = false;
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (pending)
        return;
      pending = true;
      fn.apply(void 0, __spreadArray([], __read(args), false));
      setTimeout(function() {
        pending = false;
      }, timespan);
    };
  }
  function isOnline() {
    if (isBrowser$1 && typeof navigator.onLine !== "undefined") {
      return navigator.onLine;
    }
    return true;
  }
  var listeners = [];
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  if (isBrowser$1) {
    var revalidate = function() {
      if (!isDocumentVisible() || !isOnline())
        return;
      for (var i2 = 0; i2 < listeners.length; i2++) {
        var listener = listeners[i2];
        listener();
      }
    };
    window.addEventListener("visibilitychange", revalidate, false);
    window.addEventListener("focus", revalidate, false);
  }
  var useRefreshOnWindowFocusPlugin = function(fetchInstance, _a2) {
    var refreshOnWindowFocus = _a2.refreshOnWindowFocus, _b2 = _a2.focusTimespan, focusTimespan = _b2 === void 0 ? 5e3 : _b2;
    var unsubscribeRef = React__default.useRef();
    var stopSubscribe = function() {
      var _a3;
      (_a3 = unsubscribeRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(unsubscribeRef);
    };
    React__default.useEffect(function() {
      if (refreshOnWindowFocus) {
        var limitRefresh_1 = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
        unsubscribeRef.current = subscribe(function() {
          limitRefresh_1();
        });
      }
      return function() {
        stopSubscribe();
      };
    }, [refreshOnWindowFocus, focusTimespan]);
    useUnmount$1(function() {
      stopSubscribe();
    });
    return {};
  };
  const useRefreshOnWindowFocusPlugin$1 = useRefreshOnWindowFocusPlugin;
  var useRetryPlugin = function(fetchInstance, _a2) {
    var retryInterval = _a2.retryInterval, retryCount = _a2.retryCount;
    var timerRef = React__default.useRef();
    var countRef = React__default.useRef(0);
    var triggerByRetry = React__default.useRef(false);
    if (!retryCount) {
      return {};
    }
    return {
      onBefore: function() {
        if (!triggerByRetry.current) {
          countRef.current = 0;
        }
        triggerByRetry.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      },
      onSuccess: function() {
        countRef.current = 0;
      },
      onError: function() {
        countRef.current += 1;
        if (retryCount === -1 || countRef.current <= retryCount) {
          var timeout = retryInterval !== null && retryInterval !== void 0 ? retryInterval : Math.min(1e3 * Math.pow(2, countRef.current), 3e4);
          timerRef.current = setTimeout(function() {
            triggerByRetry.current = true;
            fetchInstance.refresh();
          }, timeout);
        } else {
          countRef.current = 0;
        }
      },
      onCancel: function() {
        countRef.current = 0;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
    };
  };
  const useRetryPlugin$1 = useRetryPlugin;
  var useThrottlePlugin = function(fetchInstance, _a2) {
    var throttleWait = _a2.throttleWait, throttleLeading = _a2.throttleLeading, throttleTrailing = _a2.throttleTrailing;
    var throttledRef = React__default.useRef();
    var options = {};
    if (throttleLeading !== void 0) {
      options.leading = throttleLeading;
    }
    if (throttleTrailing !== void 0) {
      options.trailing = throttleTrailing;
    }
    React__default.useEffect(function() {
      if (throttleWait) {
        var _originRunAsync_1 = fetchInstance.runAsync.bind(fetchInstance);
        throttledRef.current = throttle$1(function(callback) {
          callback();
        }, throttleWait, options);
        fetchInstance.runAsync = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return new Promise(function(resolve, reject) {
            var _a3;
            (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(throttledRef, function() {
              _originRunAsync_1.apply(void 0, __spreadArray([], __read(args), false)).then(resolve).catch(reject);
            });
          });
        };
        return function() {
          var _a3;
          fetchInstance.runAsync = _originRunAsync_1;
          (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
        };
      }
    }, [throttleWait, throttleLeading, throttleTrailing]);
    if (!throttleWait) {
      return {};
    }
    return {
      onCancel: function() {
        var _a3;
        (_a3 = throttledRef.current) === null || _a3 === void 0 ? void 0 : _a3.cancel();
      }
    };
  };
  const useThrottlePlugin$1 = useThrottlePlugin;
  var useMount = function(fn) {
    React__default.useEffect(function() {
      fn === null || fn === void 0 ? void 0 : fn();
    }, []);
  };
  const useMount$1 = useMount;
  var useUpdate = function() {
    var _a2 = __read(React__default.useState({}), 2), setState = _a2[1];
    return React__default.useCallback(function() {
      return setState({});
    }, []);
  };
  const useUpdate$1 = useUpdate;
  var Fetch = (
    /** @class */
    function() {
      function Fetch2(serviceRef, options, subscribe2, initState2) {
        if (initState2 === void 0) {
          initState2 = {};
        }
        this.serviceRef = serviceRef;
        this.options = options;
        this.subscribe = subscribe2;
        this.initState = initState2;
        this.count = 0;
        this.state = {
          loading: false,
          params: void 0,
          data: void 0,
          error: void 0
        };
        this.state = __assign(__assign(__assign({}, this.state), {
          loading: !options.manual
        }), initState2);
      }
      Fetch2.prototype.setState = function(s2) {
        if (s2 === void 0) {
          s2 = {};
        }
        this.state = __assign(__assign({}, this.state), s2);
        this.subscribe();
      };
      Fetch2.prototype.runPluginHandler = function(event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
        }
        var r2 = this.pluginImpls.map(function(i2) {
          var _a2;
          return (_a2 = i2[event]) === null || _a2 === void 0 ? void 0 : _a2.call.apply(_a2, __spreadArray([i2], __read(rest), false));
        }).filter(Boolean);
        return Object.assign.apply(Object, __spreadArray([{}], __read(r2), false));
      };
      Fetch2.prototype.runAsync = function() {
        var _a2, _b2, _c, _d, _e, _f, _g, _h, _j, _k;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          params[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function() {
          var currentCount, _l, _m, stopNow, _o, returnNow, state, servicePromise, res, error_1;
          var _p;
          return __generator(this, function(_q) {
            switch (_q.label) {
              case 0:
                this.count += 1;
                currentCount = this.count;
                _l = this.runPluginHandler("onBefore", params), _m = _l.stopNow, stopNow = _m === void 0 ? false : _m, _o = _l.returnNow, returnNow = _o === void 0 ? false : _o, state = __rest(_l, ["stopNow", "returnNow"]);
                if (stopNow) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState(__assign({
                  loading: true,
                  params
                }, state));
                if (returnNow) {
                  return [2, Promise.resolve(state.data)];
                }
                (_b2 = (_a2 = this.options).onBefore) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, params);
                _q.label = 1;
              case 1:
                _q.trys.push([1, 3, , 4]);
                servicePromise = this.runPluginHandler("onRequest", this.serviceRef.current, params).servicePromise;
                if (!servicePromise) {
                  servicePromise = (_p = this.serviceRef).current.apply(_p, __spreadArray([], __read(params), false));
                }
                return [4, servicePromise];
              case 2:
                res = _q.sent();
                if (currentCount !== this.count) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState({
                  data: res,
                  error: void 0,
                  loading: false
                });
                (_d = (_c = this.options).onSuccess) === null || _d === void 0 ? void 0 : _d.call(_c, res, params);
                this.runPluginHandler("onSuccess", res, params);
                (_f = (_e = this.options).onFinally) === null || _f === void 0 ? void 0 : _f.call(_e, params, res, void 0);
                if (currentCount === this.count) {
                  this.runPluginHandler("onFinally", params, res, void 0);
                }
                return [2, res];
              case 3:
                error_1 = _q.sent();
                if (currentCount !== this.count) {
                  return [2, new Promise(function() {
                  })];
                }
                this.setState({
                  error: error_1,
                  loading: false
                });
                (_h = (_g = this.options).onError) === null || _h === void 0 ? void 0 : _h.call(_g, error_1, params);
                this.runPluginHandler("onError", error_1, params);
                (_k = (_j = this.options).onFinally) === null || _k === void 0 ? void 0 : _k.call(_j, params, void 0, error_1);
                if (currentCount === this.count) {
                  this.runPluginHandler("onFinally", params, void 0, error_1);
                }
                throw error_1;
              case 4:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      Fetch2.prototype.run = function() {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          params[_i] = arguments[_i];
        }
        this.runAsync.apply(this, __spreadArray([], __read(params), false)).catch(function(error) {
          if (!_this.options.onError) {
            console.error(error);
          }
        });
      };
      Fetch2.prototype.cancel = function() {
        this.count += 1;
        this.setState({
          loading: false
        });
        this.runPluginHandler("onCancel");
      };
      Fetch2.prototype.refresh = function() {
        this.run.apply(this, __spreadArray([], __read(this.state.params || []), false));
      };
      Fetch2.prototype.refreshAsync = function() {
        return this.runAsync.apply(this, __spreadArray([], __read(this.state.params || []), false));
      };
      Fetch2.prototype.mutate = function(data) {
        var targetData = isFunction(data) ? data(this.state.data) : data;
        this.runPluginHandler("onMutate", targetData);
        this.setState({
          data: targetData
        });
      };
      return Fetch2;
    }()
  );
  const Fetch$1 = Fetch;
  function useRequestImplement(service, options, plugins) {
    if (options === void 0) {
      options = {};
    }
    if (plugins === void 0) {
      plugins = [];
    }
    var _a2 = options.manual, manual = _a2 === void 0 ? false : _a2, rest = __rest(options, ["manual"]);
    var fetchOptions = __assign({
      manual
    }, rest);
    var serviceRef = useLatest(service);
    var update = useUpdate$1();
    var fetchInstance = useCreation(function() {
      var initState2 = plugins.map(function(p2) {
        var _a3;
        return (_a3 = p2 === null || p2 === void 0 ? void 0 : p2.onInit) === null || _a3 === void 0 ? void 0 : _a3.call(p2, fetchOptions);
      }).filter(Boolean);
      return new Fetch$1(serviceRef, fetchOptions, update, Object.assign.apply(Object, __spreadArray([{}], __read(initState2), false)));
    }, []);
    fetchInstance.options = fetchOptions;
    fetchInstance.pluginImpls = plugins.map(function(p2) {
      return p2(fetchInstance, fetchOptions);
    });
    useMount$1(function() {
      if (!manual) {
        var params = fetchInstance.state.params || options.defaultParams || [];
        fetchInstance.run.apply(fetchInstance, __spreadArray([], __read(params), false));
      }
    });
    useUnmount$1(function() {
      fetchInstance.cancel();
    });
    return {
      loading: fetchInstance.state.loading,
      data: fetchInstance.state.data,
      error: fetchInstance.state.error,
      params: fetchInstance.state.params || [],
      cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
      refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
      refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
      run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
      runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
      mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance))
    };
  }
  function useRequest(service, options, plugins) {
    return useRequestImplement(service, options, __spreadArray(__spreadArray([], __read(plugins || []), false), [useDebouncePlugin$1, useLoadingDelayPlugin$1, usePollingPlugin$1, useRefreshOnWindowFocusPlugin$1, useThrottlePlugin$1, useAutoRunPlugin$1, useCachePlugin$1, useRetryPlugin$1], false));
  }
  function useToggle(defaultValue2, reverseValue) {
    if (defaultValue2 === void 0) {
      defaultValue2 = false;
    }
    var _a2 = __read(React__default.useState(defaultValue2), 2), state = _a2[0], setState = _a2[1];
    var actions = React__default.useMemo(function() {
      var reverseValueOrigin = reverseValue === void 0 ? !defaultValue2 : reverseValue;
      var toggle = function() {
        return setState(function(s2) {
          return s2 === defaultValue2 ? reverseValueOrigin : defaultValue2;
        });
      };
      var set = function(value) {
        return setState(value);
      };
      var setLeft = function() {
        return setState(defaultValue2);
      };
      var setRight = function() {
        return setState(reverseValueOrigin);
      };
      return {
        toggle,
        set,
        setLeft,
        setRight
      };
    }, []);
    return [state, actions];
  }
  function useBoolean(defaultValue2) {
    if (defaultValue2 === void 0) {
      defaultValue2 = false;
    }
    var _a2 = __read(useToggle(!!defaultValue2), 2), state = _a2[0], _b2 = _a2[1], toggle = _b2.toggle, set = _b2.set;
    var actions = React__default.useMemo(function() {
      var setTrue = function() {
        return set(true);
      };
      var setFalse = function() {
        return set(false);
      };
      return {
        toggle,
        set: function(v2) {
          return set(!!v2);
        },
        setTrue,
        setFalse
      };
    }, []);
    return [state, actions];
  }
  function getTargetElement(target, defaultElement) {
    if (!isBrowser$1) {
      return void 0;
    }
    if (!target) {
      return defaultElement;
    }
    var targetElement;
    if (isFunction(target)) {
      targetElement = target();
    } else if ("current" in target) {
      targetElement = target.current;
    } else {
      targetElement = target;
    }
    return targetElement;
  }
  var createEffectWithTarget = function(useEffectType) {
    var useEffectWithTarget2 = function(effect, deps, target) {
      var hasInitRef = React__default.useRef(false);
      var lastElementRef = React__default.useRef([]);
      var lastDepsRef = React__default.useRef([]);
      var unLoadRef = React__default.useRef();
      useEffectType(function() {
        var _a2;
        var targets = Array.isArray(target) ? target : [target];
        var els = targets.map(function(item) {
          return getTargetElement(item);
        });
        if (!hasInitRef.current) {
          hasInitRef.current = true;
          lastElementRef.current = els;
          lastDepsRef.current = deps;
          unLoadRef.current = effect();
          return;
        }
        if (els.length !== lastElementRef.current.length || !depsAreSame(els, lastElementRef.current) || !depsAreSame(deps, lastDepsRef.current)) {
          (_a2 = unLoadRef.current) === null || _a2 === void 0 ? void 0 : _a2.call(unLoadRef);
          lastElementRef.current = els;
          lastDepsRef.current = deps;
          unLoadRef.current = effect();
        }
      });
      useUnmount$1(function() {
        var _a2;
        (_a2 = unLoadRef.current) === null || _a2 === void 0 ? void 0 : _a2.call(unLoadRef);
        hasInitRef.current = false;
      });
    };
    return useEffectWithTarget2;
  };
  const createEffectWithTarget$1 = createEffectWithTarget;
  var useEffectWithTarget = createEffectWithTarget$1(React__default.useEffect);
  const useEffectWithTarget$1 = useEffectWithTarget;
  var depsEqual = function(aDeps, bDeps) {
    if (aDeps === void 0) {
      aDeps = [];
    }
    if (bDeps === void 0) {
      bDeps = [];
    }
    return isEqual(aDeps, bDeps);
  };
  function useEventListener(eventName, handler, options) {
    if (options === void 0) {
      options = {};
    }
    var handlerRef = useLatest(handler);
    useEffectWithTarget$1(function() {
      var targetElement = getTargetElement(options.target, window);
      if (!(targetElement === null || targetElement === void 0 ? void 0 : targetElement.addEventListener)) {
        return;
      }
      var eventListener = function(event) {
        return handlerRef.current(event);
      };
      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture,
        once: options.once,
        passive: options.passive
      });
      return function() {
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture
        });
      };
    }, [eventName, options.capture, options.once, options.passive], options.target);
  }
  function useGetState(initialState) {
    var _a2 = __read(React__default.useState(initialState), 2), state = _a2[0], setState = _a2[1];
    var stateRef = React__default.useRef(state);
    stateRef.current = state;
    var getState = React__default.useCallback(function() {
      return stateRef.current;
    }, []);
    return [state, setState, getState];
  }
  const useHover = function(target, options) {
    var _a2 = options || {}, onEnter = _a2.onEnter, onLeave = _a2.onLeave, onChange = _a2.onChange;
    var _b2 = __read(useBoolean(false), 2), state = _b2[0], _c = _b2[1], setTrue = _c.setTrue, setFalse = _c.setFalse;
    useEventListener("mouseenter", function() {
      onEnter === null || onEnter === void 0 ? void 0 : onEnter();
      setTrue();
      onChange === null || onChange === void 0 ? void 0 : onChange(true);
    }, {
      target
    });
    useEventListener("mouseleave", function() {
      onLeave === null || onLeave === void 0 ? void 0 : onLeave();
      setFalse();
      onChange === null || onChange === void 0 ? void 0 : onChange(false);
    }, {
      target
    });
    return state;
  };
  var useDeepCompareEffectWithTarget = function(effect, deps, target) {
    var ref = React__default.useRef();
    var signalRef = React__default.useRef(0);
    if (!depsEqual(deps, ref.current)) {
      ref.current = deps;
      signalRef.current += 1;
    }
    useEffectWithTarget$1(effect, [signalRef.current], target);
  };
  const useDeepCompareEffectWithTarget$1 = useDeepCompareEffectWithTarget;
  var isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(typeof navigator !== "undefined" ? navigator === null || navigator === void 0 ? void 0 : navigator.platform : "");
  const isAppleDevice$1 = isAppleDevice;
  var aliasKeyCodeMap = {
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pausebreak: 19,
    capslock: 20,
    esc: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    leftarrow: 37,
    uparrow: 38,
    rightarrow: 39,
    downarrow: 40,
    insert: 45,
    delete: 46,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    leftwindowkey: 91,
    rightwindowkey: 92,
    meta: isAppleDevice$1 ? [91, 93] : [91, 92],
    selectkey: 93,
    numpad0: 96,
    numpad1: 97,
    numpad2: 98,
    numpad3: 99,
    numpad4: 100,
    numpad5: 101,
    numpad6: 102,
    numpad7: 103,
    numpad8: 104,
    numpad9: 105,
    multiply: 106,
    add: 107,
    subtract: 109,
    decimalpoint: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numlock: 144,
    scrolllock: 145,
    semicolon: 186,
    equalsign: 187,
    comma: 188,
    dash: 189,
    period: 190,
    forwardslash: 191,
    graveaccent: 192,
    openbracket: 219,
    backslash: 220,
    closebracket: 221,
    singlequote: 222
  };
  var modifierKey = {
    ctrl: function(event) {
      return event.ctrlKey;
    },
    shift: function(event) {
      return event.shiftKey;
    },
    alt: function(event) {
      return event.altKey;
    },
    meta: function(event) {
      if (event.type === "keyup") {
        return aliasKeyCodeMap.meta.includes(event.keyCode);
      }
      return event.metaKey;
    }
  };
  function countKeyByEvent(event) {
    var countOfModifier = Object.keys(modifierKey).reduce(function(total, key2) {
      if (modifierKey[key2](event)) {
        return total + 1;
      }
      return total;
    }, 0);
    return [16, 17, 18, 91, 92].includes(event.keyCode) ? countOfModifier : countOfModifier + 1;
  }
  function genFilterKey(event, keyFilter, exactMatch) {
    var e_1, _a2;
    if (!event.key) {
      return false;
    }
    if (isNumber(keyFilter)) {
      return event.keyCode === keyFilter;
    }
    var genArr = keyFilter.split(".");
    var genLen = 0;
    try {
      for (var genArr_1 = __values(genArr), genArr_1_1 = genArr_1.next(); !genArr_1_1.done; genArr_1_1 = genArr_1.next()) {
        var key2 = genArr_1_1.value;
        var genModifier = modifierKey[key2];
        var aliasKeyCode = aliasKeyCodeMap[key2.toLowerCase()];
        if (genModifier && genModifier(event) || aliasKeyCode && aliasKeyCode === event.keyCode) {
          genLen++;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (genArr_1_1 && !genArr_1_1.done && (_a2 = genArr_1.return))
          _a2.call(genArr_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    if (exactMatch) {
      return genLen === genArr.length && countKeyByEvent(event) === genArr.length;
    }
    return genLen === genArr.length;
  }
  function genKeyFormatter(keyFilter, exactMatch) {
    if (isFunction(keyFilter)) {
      return keyFilter;
    }
    if (isString(keyFilter) || isNumber(keyFilter)) {
      return function(event) {
        return genFilterKey(event, keyFilter, exactMatch);
      };
    }
    if (Array.isArray(keyFilter)) {
      return function(event) {
        return keyFilter.some(function(item) {
          return genFilterKey(event, item, exactMatch);
        });
      };
    }
    return function() {
      return Boolean(keyFilter);
    };
  }
  var defaultEvents = ["keydown"];
  function useKeyPress(keyFilter, eventHandler, option) {
    var _a2 = option || {}, _b2 = _a2.events, events2 = _b2 === void 0 ? defaultEvents : _b2, target = _a2.target, _c = _a2.exactMatch, exactMatch = _c === void 0 ? false : _c, _d = _a2.useCapture, useCapture = _d === void 0 ? false : _d;
    var eventHandlerRef = useLatest(eventHandler);
    var keyFilterRef = useLatest(keyFilter);
    useDeepCompareEffectWithTarget$1(function() {
      var e_2, _a3;
      var _b3;
      var el = getTargetElement(target, window);
      if (!el) {
        return;
      }
      var callbackHandler = function(event) {
        var _a4;
        var genGuard = genKeyFormatter(keyFilterRef.current, exactMatch);
        if (genGuard(event)) {
          return (_a4 = eventHandlerRef.current) === null || _a4 === void 0 ? void 0 : _a4.call(eventHandlerRef, event);
        }
      };
      try {
        for (var events_1 = __values(events2), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
          var eventName = events_1_1.value;
          (_b3 = el === null || el === void 0 ? void 0 : el.addEventListener) === null || _b3 === void 0 ? void 0 : _b3.call(el, eventName, callbackHandler, useCapture);
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (events_1_1 && !events_1_1.done && (_a3 = events_1.return))
            _a3.call(events_1);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      return function() {
        var e_3, _a4;
        var _b4;
        try {
          for (var events_2 = __values(events2), events_2_1 = events_2.next(); !events_2_1.done; events_2_1 = events_2.next()) {
            var eventName2 = events_2_1.value;
            (_b4 = el === null || el === void 0 ? void 0 : el.removeEventListener) === null || _b4 === void 0 ? void 0 : _b4.call(el, eventName2, callbackHandler, useCapture);
          }
        } catch (e_3_1) {
          e_3 = {
            error: e_3_1
          };
        } finally {
          try {
            if (events_2_1 && !events_2_1.done && (_a4 = events_2.return))
              _a4.call(events_2);
          } finally {
            if (e_3)
              throw e_3.error;
          }
        }
      };
    }, [events2], target);
  }
  function useRafState(initialState) {
    var ref = React__default.useRef(0);
    var _a2 = __read(React__default.useState(initialState), 2), state = _a2[0], setState = _a2[1];
    var setRafState = React__default.useCallback(function(value) {
      cancelAnimationFrame(ref.current);
      ref.current = requestAnimationFrame(function() {
        setState(value);
      });
    }, []);
    useUnmount$1(function() {
      cancelAnimationFrame(ref.current);
    });
    return [state, setRafState];
  }
  var initState = {
    screenX: NaN,
    screenY: NaN,
    clientX: NaN,
    clientY: NaN,
    pageX: NaN,
    pageY: NaN,
    elementX: NaN,
    elementY: NaN,
    elementH: NaN,
    elementW: NaN,
    elementPosX: NaN,
    elementPosY: NaN
  };
  const useMouse = function(target) {
    var _a2 = __read(useRafState(initState), 2), state = _a2[0], setState = _a2[1];
    useEventListener("mousemove", function(event) {
      var screenX = event.screenX, screenY = event.screenY, clientX = event.clientX, clientY = event.clientY, pageX = event.pageX, pageY = event.pageY;
      var newState = {
        screenX,
        screenY,
        clientX,
        clientY,
        pageX,
        pageY,
        elementX: NaN,
        elementY: NaN,
        elementH: NaN,
        elementW: NaN,
        elementPosX: NaN,
        elementPosY: NaN
      };
      var targetElement = getTargetElement(target);
      if (targetElement) {
        var _a3 = targetElement.getBoundingClientRect(), left = _a3.left, top_1 = _a3.top, width = _a3.width, height = _a3.height;
        newState.elementPosX = left + window.pageXOffset;
        newState.elementPosY = top_1 + window.pageYOffset;
        newState.elementX = pageX - newState.elementPosX;
        newState.elementY = pageY - newState.elementPosY;
        newState.elementW = width;
        newState.elementH = height;
      }
      setState(newState);
    }, {
      target: function() {
        return document;
      }
    });
    return state;
  };
  var defaultShouldUpdate = function(a2, b2) {
    return !Object.is(a2, b2);
  };
  function usePrevious$1(state, shouldUpdate) {
    if (shouldUpdate === void 0) {
      shouldUpdate = defaultShouldUpdate;
    }
    var prevRef = React__default.useRef();
    var curRef = React__default.useRef();
    if (shouldUpdate(curRef.current, state)) {
      prevRef.current = curRef.current;
      curRef.current = state;
    }
    return prevRef.current;
  }
  var useUnmountedRef = function() {
    var unmountedRef = React__default.useRef(false);
    React__default.useEffect(function() {
      unmountedRef.current = false;
      return function() {
        unmountedRef.current = true;
      };
    }, []);
    return unmountedRef;
  };
  const useUnmountedRef$1 = useUnmountedRef;
  const useUpdateLayoutEffect = createUpdateEffect(React__default.useLayoutEffect);
  const modalMask$1 = "_modal-mask_1wljt_1";
  const modal$1 = "_modal_1wljt_1";
  const modalHeader$1 = "_modal-header_1wljt_25";
  const modalBody$1 = "_modal-body_1wljt_33";
  const modalTitle = "_modal-title_1wljt_39";
  const btnClose = "_btn-close_1wljt_47";
  const BaseModalClass = {
    modalMask: modalMask$1,
    modal: modal$1,
    modalHeader: modalHeader$1,
    modalBody: modalBody$1,
    modalTitle,
    btnClose
  };
  let showedCount = 0;
  const modalShowCheck = () => {
    showedCount++;
    document.body.style.overflow = "hidden";
  };
  const modalHideCheck = () => {
    showedCount--;
    if (showedCount < 0)
      showedCount = 0;
    if (showedCount === 0) {
      document.body.style.overflow = "";
    }
  };
  function BaseModal({
    show,
    onHide: onHide2,
    children,
    styleModalMask,
    clsModalMask,
    cssModalMask,
    styleModal,
    clsModal,
    cssModal,
    width,
    hideWhenMaskOnClick = false,
    hideWhenEsc = false
  }) {
    React__default.useLayoutEffect(() => {
      if (show) {
        modalShowCheck();
      } else {
        modalHideCheck();
      }
    }, [show]);
    const wrapperRef = React__default.useRef(null);
    const isDarkMode = useIsDarkMode();
    const {
      bg,
      c: c2
    } = React__default.useMemo(() => {
      const bg2 = window.getComputedStyle(document.body).backgroundColor;
      const c22 = window.getComputedStyle(document.body).color;
      return {
        bg: bg2,
        c: c22
      };
    }, [isDarkMode]);
    const wrapperStyle = React__default.useMemo(() => {
      return isDarkMode ? {
        "--bg": bg,
        "--c": c2,
        "backgroundColor": bg,
        "color": c2
      } : (
        // 白色不用特殊处理
        {}
      );
    }, [bg, c2, isDarkMode]);
    const containerId = React__default.useId();
    const container = React__default.useMemo(() => {
      const div = document.createElement("div");
      div.classList.add(APP_NAME_ROOT_CLASSNAME);
      div.setAttribute("data-id", "base-modal-" + containerId);
      document.body.appendChild(div);
      return div;
    }, []);
    const onMaskClick = useMemoizedFn((e2) => {
      var _a2;
      const target = e2.target;
      if ((_a2 = wrapperRef.current) == null ? void 0 : _a2.contains(target))
        return;
      if (target.closest('.ant-tooltip-inner[role="tooltip"]'))
        return;
      if (target.closest('.ant-popover-inner[role="tooltip"]'))
        return;
      if (hideWhenMaskOnClick) {
        onHide2();
      }
    });
    useKeyPress("esc", (e2) => {
      if (!show)
        return;
      if (hideWhenEsc) {
        e2.preventDefault();
        e2.stopImmediatePropagation();
        setTimeout(onHide2);
      }
    });
    if (!show) {
      return null;
    }
    return require$$0.createPortal(/* @__PURE__ */ jsx("div", {
      style: styleModalMask,
      className: cx(BaseModalClass.modalMask, clsModalMask),
      css: cssModalMask,
      onClick: onMaskClick,
      children: /* @__PURE__ */ jsx("div", {
        style: {
          ...wrapperStyle,
          width,
          ...styleModal
        },
        className: cx(BaseModalClass.modal, clsModal),
        css: cssModal,
        ref: wrapperRef,
        children
      })
    }), container);
  }
  const ModalClose = (props) => {
    return /* @__PURE__ */ jsx(IconPark, {
      ...props,
      name: "Close",
      size: 18,
      style: {
        cursor: "pointer",
        marginLeft: 10,
        ...props.style
      }
    });
  };
  function mitt(n2) {
    return { all: n2 = n2 || /* @__PURE__ */ new Map(), on: function(t2, e2) {
      var i2 = n2.get(t2);
      i2 ? i2.push(e2) : n2.set(t2, [e2]);
    }, off: function(t2, e2) {
      var i2 = n2.get(t2);
      i2 && (e2 ? i2.splice(i2.indexOf(e2) >>> 0, 1) : n2.set(t2, []));
    }, emit: function(t2, e2) {
      var i2 = n2.get(t2);
      i2 && i2.slice().map(function(n3) {
        n3(e2);
      }), (i2 = n2.get("*")) && i2.slice().map(function(n3) {
        n3(t2, e2);
      });
    } };
  }
  let TimeoutError$2 = class TimeoutError extends Error {
    constructor(message2) {
      super(message2);
      this.name = "TimeoutError";
    }
  };
  let AbortError$1 = class AbortError extends Error {
    constructor(message2) {
      super();
      this.name = "AbortError";
      this.message = message2;
    }
  };
  const getDOMException = (errorMessage) => globalThis.DOMException === void 0 ? new AbortError$1(errorMessage) : new DOMException(errorMessage);
  const getAbortedReason = (signal) => {
    const reason = signal.reason === void 0 ? getDOMException("This operation was aborted.") : signal.reason;
    return reason instanceof Error ? reason : getDOMException(reason);
  };
  function pTimeout(promise, options) {
    const {
      milliseconds,
      fallback,
      message: message2,
      customTimers = {
        setTimeout,
        clearTimeout
      }
    } = options;
    let timer;
    const wrappedPromise = new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || Math.sign(milliseconds) !== 1) {
        throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
      }
      if (options.signal) {
        const {
          signal
        } = options;
        if (signal.aborted) {
          reject(getAbortedReason(signal));
        }
        signal.addEventListener("abort", () => {
          reject(getAbortedReason(signal));
        });
      }
      if (milliseconds === Number.POSITIVE_INFINITY) {
        promise.then(resolve, reject);
        return;
      }
      const timeoutError = new TimeoutError$2();
      timer = customTimers.setTimeout.call(void 0, () => {
        if (fallback) {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        if (message2 === false) {
          resolve();
        } else if (message2 instanceof Error) {
          reject(message2);
        } else {
          timeoutError.message = message2 ?? `Promise timed out after ${milliseconds} milliseconds`;
          reject(timeoutError);
        }
      }, milliseconds);
      (async () => {
        try {
          resolve(await promise);
        } catch (error) {
          reject(error);
        }
      })();
    });
    const cancelablePromise = wrappedPromise.finally(() => {
      cancelablePromise.clear();
    });
    cancelablePromise.clear = () => {
      customTimers.clearTimeout.call(void 0, timer);
      timer = void 0;
    };
    return cancelablePromise;
  }
  const normalizeEmitter = (emitter2) => {
    const addListener = emitter2.on || emitter2.addListener || emitter2.addEventListener;
    const removeListener = emitter2.off || emitter2.removeListener || emitter2.removeEventListener;
    if (!addListener || !removeListener) {
      throw new TypeError("Emitter is not compatible");
    }
    return {
      addListener: addListener.bind(emitter2),
      removeListener: removeListener.bind(emitter2)
    };
  };
  function pEventMultiple(emitter2, event, options) {
    let cancel;
    const returnValue = new Promise((resolve, reject) => {
      var _a2;
      options = {
        rejectionEvents: ["error"],
        multiArgs: false,
        resolveImmediately: false,
        ...options
      };
      if (!(options.count >= 0 && (options.count === Number.POSITIVE_INFINITY || Number.isInteger(options.count)))) {
        throw new TypeError("The `count` option should be at least 0 or more");
      }
      (_a2 = options.signal) == null ? void 0 : _a2.throwIfAborted();
      const events2 = [event].flat();
      const items = [];
      const {
        addListener,
        removeListener
      } = normalizeEmitter(emitter2);
      const onItem = (...arguments_) => {
        const value = options.multiArgs ? arguments_ : arguments_[0];
        if (options.filter && !options.filter(value)) {
          return;
        }
        items.push(value);
        if (options.count === items.length) {
          cancel();
          resolve(items);
        }
      };
      const rejectHandler = (error) => {
        cancel();
        reject(error);
      };
      cancel = () => {
        for (const event2 of events2) {
          removeListener(event2, onItem);
        }
        for (const rejectionEvent of options.rejectionEvents) {
          removeListener(rejectionEvent, rejectHandler);
        }
      };
      for (const event2 of events2) {
        addListener(event2, onItem);
      }
      for (const rejectionEvent of options.rejectionEvents) {
        addListener(rejectionEvent, rejectHandler);
      }
      if (options.signal) {
        options.signal.addEventListener("abort", () => {
          rejectHandler(options.signal.reason);
        }, {
          once: true
        });
      }
      if (options.resolveImmediately) {
        resolve(items);
      }
    });
    returnValue.cancel = cancel;
    if (typeof options.timeout === "number") {
      const timeout = pTimeout(returnValue, {
        milliseconds: options.timeout
      });
      timeout.cancel = cancel;
      return timeout;
    }
    return returnValue;
  }
  function pEvent(emitter2, event, options) {
    if (typeof options === "function") {
      options = {
        filter: options
      };
    }
    options = {
      ...options,
      count: 1,
      resolveImmediately: false
    };
    const arrayPromise = pEventMultiple(emitter2, event, options);
    const promise = arrayPromise.then((array) => array[0]);
    promise.cancel = arrayPromise.cancel;
    return promise;
  }
  var __defProp2 = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp2 = (obj, key2, value) => key2 in obj ? __defProp2(obj, key2, {
    enumerable: true,
    configurable: true,
    writable: true,
    value
  }) : obj[key2] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 || (b2 = {}))
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp2(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp2(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  /**
   * @license QR Code generator library (TypeScript)
   * Copyright (c) Project Nayuki.
   * SPDX-License-Identifier: MIT
   */
  var qrcodegen;
  ((qrcodegen2) => {
    const _QrCode = class {
      constructor(version, errorCorrectionLevel, dataCodewords, msk) {
        this.version = version;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.modules = [];
        this.isFunction = [];
        if (version < _QrCode.MIN_VERSION || version > _QrCode.MAX_VERSION)
          throw new RangeError("Version value out of range");
        if (msk < -1 || msk > 7)
          throw new RangeError("Mask value out of range");
        this.size = version * 4 + 17;
        let row2 = [];
        for (let i2 = 0; i2 < this.size; i2++)
          row2.push(false);
        for (let i2 = 0; i2 < this.size; i2++) {
          this.modules.push(row2.slice());
          this.isFunction.push(row2.slice());
        }
        this.drawFunctionPatterns();
        const allCodewords = this.addEccAndInterleave(dataCodewords);
        this.drawCodewords(allCodewords);
        if (msk == -1) {
          let minPenalty = 1e9;
          for (let i2 = 0; i2 < 8; i2++) {
            this.applyMask(i2);
            this.drawFormatBits(i2);
            const penalty = this.getPenaltyScore();
            if (penalty < minPenalty) {
              msk = i2;
              minPenalty = penalty;
            }
            this.applyMask(i2);
          }
        }
        assert(0 <= msk && msk <= 7);
        this.mask = msk;
        this.applyMask(msk);
        this.drawFormatBits(msk);
        this.isFunction = [];
      }
      static encodeText(text, ecl) {
        const segs = qrcodegen2.QrSegment.makeSegments(text);
        return _QrCode.encodeSegments(segs, ecl);
      }
      static encodeBinary(data, ecl) {
        const seg = qrcodegen2.QrSegment.makeBytes(data);
        return _QrCode.encodeSegments([seg], ecl);
      }
      static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
        if (!(_QrCode.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode.MAX_VERSION) || mask < -1 || mask > 7)
          throw new RangeError("Invalid value");
        let version;
        let dataUsedBits;
        for (version = minVersion; ; version++) {
          const dataCapacityBits2 = _QrCode.getNumDataCodewords(version, ecl) * 8;
          const usedBits = QrSegment.getTotalBits(segs, version);
          if (usedBits <= dataCapacityBits2) {
            dataUsedBits = usedBits;
            break;
          }
          if (version >= maxVersion)
            throw new RangeError("Data too long");
        }
        for (const newEcl of [_QrCode.Ecc.MEDIUM, _QrCode.Ecc.QUARTILE, _QrCode.Ecc.HIGH]) {
          if (boostEcl && dataUsedBits <= _QrCode.getNumDataCodewords(version, newEcl) * 8)
            ecl = newEcl;
        }
        let bb = [];
        for (const seg of segs) {
          appendBits(seg.mode.modeBits, 4, bb);
          appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
          for (const b2 of seg.getData())
            bb.push(b2);
        }
        assert(bb.length == dataUsedBits);
        const dataCapacityBits = _QrCode.getNumDataCodewords(version, ecl) * 8;
        assert(bb.length <= dataCapacityBits);
        appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
        appendBits(0, (8 - bb.length % 8) % 8, bb);
        assert(bb.length % 8 == 0);
        for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
          appendBits(padByte, 8, bb);
        let dataCodewords = [];
        while (dataCodewords.length * 8 < bb.length)
          dataCodewords.push(0);
        bb.forEach((b2, i2) => dataCodewords[i2 >>> 3] |= b2 << 7 - (i2 & 7));
        return new _QrCode(version, ecl, dataCodewords, mask);
      }
      getModule(x2, y2) {
        return 0 <= x2 && x2 < this.size && 0 <= y2 && y2 < this.size && this.modules[y2][x2];
      }
      getModules() {
        return this.modules;
      }
      drawFunctionPatterns() {
        for (let i2 = 0; i2 < this.size; i2++) {
          this.setFunctionModule(6, i2, i2 % 2 == 0);
          this.setFunctionModule(i2, 6, i2 % 2 == 0);
        }
        this.drawFinderPattern(3, 3);
        this.drawFinderPattern(this.size - 4, 3);
        this.drawFinderPattern(3, this.size - 4);
        const alignPatPos = this.getAlignmentPatternPositions();
        const numAlign = alignPatPos.length;
        for (let i2 = 0; i2 < numAlign; i2++) {
          for (let j = 0; j < numAlign; j++) {
            if (!(i2 == 0 && j == 0 || i2 == 0 && j == numAlign - 1 || i2 == numAlign - 1 && j == 0))
              this.drawAlignmentPattern(alignPatPos[i2], alignPatPos[j]);
          }
        }
        this.drawFormatBits(0);
        this.drawVersion();
      }
      drawFormatBits(mask) {
        const data = this.errorCorrectionLevel.formatBits << 3 | mask;
        let rem = data;
        for (let i2 = 0; i2 < 10; i2++)
          rem = rem << 1 ^ (rem >>> 9) * 1335;
        const bits = (data << 10 | rem) ^ 21522;
        assert(bits >>> 15 == 0);
        for (let i2 = 0; i2 <= 5; i2++)
          this.setFunctionModule(8, i2, getBit(bits, i2));
        this.setFunctionModule(8, 7, getBit(bits, 6));
        this.setFunctionModule(8, 8, getBit(bits, 7));
        this.setFunctionModule(7, 8, getBit(bits, 8));
        for (let i2 = 9; i2 < 15; i2++)
          this.setFunctionModule(14 - i2, 8, getBit(bits, i2));
        for (let i2 = 0; i2 < 8; i2++)
          this.setFunctionModule(this.size - 1 - i2, 8, getBit(bits, i2));
        for (let i2 = 8; i2 < 15; i2++)
          this.setFunctionModule(8, this.size - 15 + i2, getBit(bits, i2));
        this.setFunctionModule(8, this.size - 8, true);
      }
      drawVersion() {
        if (this.version < 7)
          return;
        let rem = this.version;
        for (let i2 = 0; i2 < 12; i2++)
          rem = rem << 1 ^ (rem >>> 11) * 7973;
        const bits = this.version << 12 | rem;
        assert(bits >>> 18 == 0);
        for (let i2 = 0; i2 < 18; i2++) {
          const color = getBit(bits, i2);
          const a2 = this.size - 11 + i2 % 3;
          const b2 = Math.floor(i2 / 3);
          this.setFunctionModule(a2, b2, color);
          this.setFunctionModule(b2, a2, color);
        }
      }
      drawFinderPattern(x2, y2) {
        for (let dy = -4; dy <= 4; dy++) {
          for (let dx = -4; dx <= 4; dx++) {
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            const xx = x2 + dx;
            const yy = y2 + dy;
            if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
              this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
          }
        }
      }
      drawAlignmentPattern(x2, y2) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++)
            this.setFunctionModule(x2 + dx, y2 + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
        }
      }
      setFunctionModule(x2, y2, isDark) {
        this.modules[y2][x2] = isDark;
        this.isFunction[y2][x2] = true;
      }
      addEccAndInterleave(data) {
        const ver = this.version;
        const ecl = this.errorCorrectionLevel;
        if (data.length != _QrCode.getNumDataCodewords(ver, ecl))
          throw new RangeError("Invalid argument");
        const numBlocks = _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
        const blockEccLen = _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
        const rawCodewords = Math.floor(_QrCode.getNumRawDataModules(ver) / 8);
        const numShortBlocks = numBlocks - rawCodewords % numBlocks;
        const shortBlockLen = Math.floor(rawCodewords / numBlocks);
        let blocks = [];
        const rsDiv = _QrCode.reedSolomonComputeDivisor(blockEccLen);
        for (let i2 = 0, k2 = 0; i2 < numBlocks; i2++) {
          let dat = data.slice(k2, k2 + shortBlockLen - blockEccLen + (i2 < numShortBlocks ? 0 : 1));
          k2 += dat.length;
          const ecc = _QrCode.reedSolomonComputeRemainder(dat, rsDiv);
          if (i2 < numShortBlocks)
            dat.push(0);
          blocks.push(dat.concat(ecc));
        }
        let result = [];
        for (let i2 = 0; i2 < blocks[0].length; i2++) {
          blocks.forEach((block, j) => {
            if (i2 != shortBlockLen - blockEccLen || j >= numShortBlocks)
              result.push(block[i2]);
          });
        }
        assert(result.length == rawCodewords);
        return result;
      }
      drawCodewords(data) {
        if (data.length != Math.floor(_QrCode.getNumRawDataModules(this.version) / 8))
          throw new RangeError("Invalid argument");
        let i2 = 0;
        for (let right = this.size - 1; right >= 1; right -= 2) {
          if (right == 6)
            right = 5;
          for (let vert = 0; vert < this.size; vert++) {
            for (let j = 0; j < 2; j++) {
              const x2 = right - j;
              const upward = (right + 1 & 2) == 0;
              const y2 = upward ? this.size - 1 - vert : vert;
              if (!this.isFunction[y2][x2] && i2 < data.length * 8) {
                this.modules[y2][x2] = getBit(data[i2 >>> 3], 7 - (i2 & 7));
                i2++;
              }
            }
          }
        }
        assert(i2 == data.length * 8);
      }
      applyMask(mask) {
        if (mask < 0 || mask > 7)
          throw new RangeError("Mask value out of range");
        for (let y2 = 0; y2 < this.size; y2++) {
          for (let x2 = 0; x2 < this.size; x2++) {
            let invert;
            switch (mask) {
              case 0:
                invert = (x2 + y2) % 2 == 0;
                break;
              case 1:
                invert = y2 % 2 == 0;
                break;
              case 2:
                invert = x2 % 3 == 0;
                break;
              case 3:
                invert = (x2 + y2) % 3 == 0;
                break;
              case 4:
                invert = (Math.floor(x2 / 3) + Math.floor(y2 / 2)) % 2 == 0;
                break;
              case 5:
                invert = x2 * y2 % 2 + x2 * y2 % 3 == 0;
                break;
              case 6:
                invert = (x2 * y2 % 2 + x2 * y2 % 3) % 2 == 0;
                break;
              case 7:
                invert = ((x2 + y2) % 2 + x2 * y2 % 3) % 2 == 0;
                break;
              default:
                throw new Error("Unreachable");
            }
            if (!this.isFunction[y2][x2] && invert)
              this.modules[y2][x2] = !this.modules[y2][x2];
          }
        }
      }
      getPenaltyScore() {
        let result = 0;
        for (let y2 = 0; y2 < this.size; y2++) {
          let runColor = false;
          let runX = 0;
          let runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let x2 = 0; x2 < this.size; x2++) {
            if (this.modules[y2][x2] == runColor) {
              runX++;
              if (runX == 5)
                result += _QrCode.PENALTY_N1;
              else if (runX > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runX, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
              runColor = this.modules[y2][x2];
              runX = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode.PENALTY_N3;
        }
        for (let x2 = 0; x2 < this.size; x2++) {
          let runColor = false;
          let runY = 0;
          let runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let y2 = 0; y2 < this.size; y2++) {
            if (this.modules[y2][x2] == runColor) {
              runY++;
              if (runY == 5)
                result += _QrCode.PENALTY_N1;
              else if (runY > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runY, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
              runColor = this.modules[y2][x2];
              runY = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode.PENALTY_N3;
        }
        for (let y2 = 0; y2 < this.size - 1; y2++) {
          for (let x2 = 0; x2 < this.size - 1; x2++) {
            const color = this.modules[y2][x2];
            if (color == this.modules[y2][x2 + 1] && color == this.modules[y2 + 1][x2] && color == this.modules[y2 + 1][x2 + 1])
              result += _QrCode.PENALTY_N2;
          }
        }
        let dark = 0;
        for (const row2 of this.modules)
          dark = row2.reduce((sum, color) => sum + (color ? 1 : 0), dark);
        const total = this.size * this.size;
        const k2 = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
        assert(0 <= k2 && k2 <= 9);
        result += k2 * _QrCode.PENALTY_N4;
        assert(0 <= result && result <= 2568888);
        return result;
      }
      getAlignmentPatternPositions() {
        if (this.version == 1)
          return [];
        else {
          const numAlign = Math.floor(this.version / 7) + 2;
          const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
          let result = [6];
          for (let pos = this.size - 7; result.length < numAlign; pos -= step)
            result.splice(1, 0, pos);
          return result;
        }
      }
      static getNumRawDataModules(ver) {
        if (ver < _QrCode.MIN_VERSION || ver > _QrCode.MAX_VERSION)
          throw new RangeError("Version number out of range");
        let result = (16 * ver + 128) * ver + 64;
        if (ver >= 2) {
          const numAlign = Math.floor(ver / 7) + 2;
          result -= (25 * numAlign - 10) * numAlign - 55;
          if (ver >= 7)
            result -= 36;
        }
        assert(208 <= result && result <= 29648);
        return result;
      }
      static getNumDataCodewords(ver, ecl) {
        return Math.floor(_QrCode.getNumRawDataModules(ver) / 8) - _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      }
      static reedSolomonComputeDivisor(degree) {
        if (degree < 1 || degree > 255)
          throw new RangeError("Degree out of range");
        let result = [];
        for (let i2 = 0; i2 < degree - 1; i2++)
          result.push(0);
        result.push(1);
        let root2 = 1;
        for (let i2 = 0; i2 < degree; i2++) {
          for (let j = 0; j < result.length; j++) {
            result[j] = _QrCode.reedSolomonMultiply(result[j], root2);
            if (j + 1 < result.length)
              result[j] ^= result[j + 1];
          }
          root2 = _QrCode.reedSolomonMultiply(root2, 2);
        }
        return result;
      }
      static reedSolomonComputeRemainder(data, divisor) {
        let result = divisor.map((_) => 0);
        for (const b2 of data) {
          const factor = b2 ^ result.shift();
          result.push(0);
          divisor.forEach((coef, i2) => result[i2] ^= _QrCode.reedSolomonMultiply(coef, factor));
        }
        return result;
      }
      static reedSolomonMultiply(x2, y2) {
        if (x2 >>> 8 != 0 || y2 >>> 8 != 0)
          throw new RangeError("Byte out of range");
        let z2 = 0;
        for (let i2 = 7; i2 >= 0; i2--) {
          z2 = z2 << 1 ^ (z2 >>> 7) * 285;
          z2 ^= (y2 >>> i2 & 1) * x2;
        }
        assert(z2 >>> 8 == 0);
        return z2;
      }
      finderPenaltyCountPatterns(runHistory) {
        const n2 = runHistory[1];
        assert(n2 <= this.size * 3);
        const core = n2 > 0 && runHistory[2] == n2 && runHistory[3] == n2 * 3 && runHistory[4] == n2 && runHistory[5] == n2;
        return (core && runHistory[0] >= n2 * 4 && runHistory[6] >= n2 ? 1 : 0) + (core && runHistory[6] >= n2 * 4 && runHistory[0] >= n2 ? 1 : 0);
      }
      finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
        if (currentRunColor) {
          this.finderPenaltyAddHistory(currentRunLength, runHistory);
          currentRunLength = 0;
        }
        currentRunLength += this.size;
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        return this.finderPenaltyCountPatterns(runHistory);
      }
      finderPenaltyAddHistory(currentRunLength, runHistory) {
        if (runHistory[0] == 0)
          currentRunLength += this.size;
        runHistory.pop();
        runHistory.unshift(currentRunLength);
      }
    };
    let QrCode = _QrCode;
    QrCode.MIN_VERSION = 1;
    QrCode.MAX_VERSION = 40;
    QrCode.PENALTY_N1 = 3;
    QrCode.PENALTY_N2 = 3;
    QrCode.PENALTY_N3 = 40;
    QrCode.PENALTY_N4 = 10;
    QrCode.ECC_CODEWORDS_PER_BLOCK = [[-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
    QrCode.NUM_ERROR_CORRECTION_BLOCKS = [[-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];
    qrcodegen2.QrCode = QrCode;
    function appendBits(val, len, bb) {
      if (len < 0 || len > 31 || val >>> len != 0)
        throw new RangeError("Value out of range");
      for (let i2 = len - 1; i2 >= 0; i2--)
        bb.push(val >>> i2 & 1);
    }
    function getBit(x2, i2) {
      return (x2 >>> i2 & 1) != 0;
    }
    function assert(cond) {
      if (!cond)
        throw new Error("Assertion error");
    }
    const _QrSegment = class {
      constructor(mode, numChars, bitData) {
        this.mode = mode;
        this.numChars = numChars;
        this.bitData = bitData;
        if (numChars < 0)
          throw new RangeError("Invalid argument");
        this.bitData = bitData.slice();
      }
      static makeBytes(data) {
        let bb = [];
        for (const b2 of data)
          appendBits(b2, 8, bb);
        return new _QrSegment(_QrSegment.Mode.BYTE, data.length, bb);
      }
      static makeNumeric(digits) {
        if (!_QrSegment.isNumeric(digits))
          throw new RangeError("String contains non-numeric characters");
        let bb = [];
        for (let i2 = 0; i2 < digits.length; ) {
          const n2 = Math.min(digits.length - i2, 3);
          appendBits(parseInt(digits.substr(i2, n2), 10), n2 * 3 + 1, bb);
          i2 += n2;
        }
        return new _QrSegment(_QrSegment.Mode.NUMERIC, digits.length, bb);
      }
      static makeAlphanumeric(text) {
        if (!_QrSegment.isAlphanumeric(text))
          throw new RangeError("String contains unencodable characters in alphanumeric mode");
        let bb = [];
        let i2;
        for (i2 = 0; i2 + 2 <= text.length; i2 += 2) {
          let temp = _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i2)) * 45;
          temp += _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i2 + 1));
          appendBits(temp, 11, bb);
        }
        if (i2 < text.length)
          appendBits(_QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i2)), 6, bb);
        return new _QrSegment(_QrSegment.Mode.ALPHANUMERIC, text.length, bb);
      }
      static makeSegments(text) {
        if (text == "")
          return [];
        else if (_QrSegment.isNumeric(text))
          return [_QrSegment.makeNumeric(text)];
        else if (_QrSegment.isAlphanumeric(text))
          return [_QrSegment.makeAlphanumeric(text)];
        else
          return [_QrSegment.makeBytes(_QrSegment.toUtf8ByteArray(text))];
      }
      static makeEci(assignVal) {
        let bb = [];
        if (assignVal < 0)
          throw new RangeError("ECI assignment value out of range");
        else if (assignVal < 1 << 7)
          appendBits(assignVal, 8, bb);
        else if (assignVal < 1 << 14) {
          appendBits(2, 2, bb);
          appendBits(assignVal, 14, bb);
        } else if (assignVal < 1e6) {
          appendBits(6, 3, bb);
          appendBits(assignVal, 21, bb);
        } else
          throw new RangeError("ECI assignment value out of range");
        return new _QrSegment(_QrSegment.Mode.ECI, 0, bb);
      }
      static isNumeric(text) {
        return _QrSegment.NUMERIC_REGEX.test(text);
      }
      static isAlphanumeric(text) {
        return _QrSegment.ALPHANUMERIC_REGEX.test(text);
      }
      getData() {
        return this.bitData.slice();
      }
      static getTotalBits(segs, version) {
        let result = 0;
        for (const seg of segs) {
          const ccbits = seg.mode.numCharCountBits(version);
          if (seg.numChars >= 1 << ccbits)
            return Infinity;
          result += 4 + ccbits + seg.bitData.length;
        }
        return result;
      }
      static toUtf8ByteArray(str) {
        str = encodeURI(str);
        let result = [];
        for (let i2 = 0; i2 < str.length; i2++) {
          if (str.charAt(i2) != "%")
            result.push(str.charCodeAt(i2));
          else {
            result.push(parseInt(str.substr(i2 + 1, 2), 16));
            i2 += 2;
          }
        }
        return result;
      }
    };
    let QrSegment = _QrSegment;
    QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
    QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
    QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
    qrcodegen2.QrSegment = QrSegment;
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrCode2) => {
      const _Ecc = class {
        constructor(ordinal, formatBits) {
          this.ordinal = ordinal;
          this.formatBits = formatBits;
        }
      };
      let Ecc = _Ecc;
      Ecc.LOW = new _Ecc(0, 1);
      Ecc.MEDIUM = new _Ecc(1, 0);
      Ecc.QUARTILE = new _Ecc(2, 3);
      Ecc.HIGH = new _Ecc(3, 2);
      QrCode2.Ecc = Ecc;
    })(qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrSegment2) => {
      const _Mode = class {
        constructor(modeBits, numBitsCharCount) {
          this.modeBits = modeBits;
          this.numBitsCharCount = numBitsCharCount;
        }
        numCharCountBits(ver) {
          return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
        }
      };
      let Mode = _Mode;
      Mode.NUMERIC = new _Mode(1, [10, 12, 14]);
      Mode.ALPHANUMERIC = new _Mode(2, [9, 11, 13]);
      Mode.BYTE = new _Mode(4, [8, 16, 16]);
      Mode.KANJI = new _Mode(8, [8, 10, 12]);
      Mode.ECI = new _Mode(7, [0, 0, 0]);
      QrSegment2.Mode = Mode;
    })(qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
  })(qrcodegen || (qrcodegen = {}));
  var qrcodegen_default = qrcodegen;
  /**
   * @license qrcode.react
   * Copyright (c) Paul O'Shannessy
   * SPDX-License-Identifier: ISC
   */
  var ERROR_LEVEL_MAP = {
    L: qrcodegen_default.QrCode.Ecc.LOW,
    M: qrcodegen_default.QrCode.Ecc.MEDIUM,
    Q: qrcodegen_default.QrCode.Ecc.QUARTILE,
    H: qrcodegen_default.QrCode.Ecc.HIGH
  };
  var DEFAULT_SIZE = 128;
  var DEFAULT_LEVEL = "L";
  var DEFAULT_BGCOLOR = "#FFFFFF";
  var DEFAULT_FGCOLOR = "#000000";
  var DEFAULT_INCLUDEMARGIN = false;
  var MARGIN_SIZE = 4;
  var DEFAULT_IMG_SCALE = 0.1;
  function generatePath(modules, margin = 0) {
    const ops = [];
    modules.forEach(function(row2, y2) {
      let start = null;
      row2.forEach(function(cell, x2) {
        if (!cell && start !== null) {
          ops.push(`M${start + margin} ${y2 + margin}h${x2 - start}v1H${start + margin}z`);
          start = null;
          return;
        }
        if (x2 === row2.length - 1) {
          if (!cell) {
            return;
          }
          if (start === null) {
            ops.push(`M${x2 + margin},${y2 + margin} h1v1H${x2 + margin}z`);
          } else {
            ops.push(`M${start + margin},${y2 + margin} h${x2 + 1 - start}v1H${start + margin}z`);
          }
          return;
        }
        if (cell && start === null) {
          start = x2;
        }
      });
    });
    return ops.join("");
  }
  function excavateModules(modules, excavation) {
    return modules.slice().map((row2, y2) => {
      if (y2 < excavation.y || y2 >= excavation.y + excavation.h) {
        return row2;
      }
      return row2.map((cell, x2) => {
        if (x2 < excavation.x || x2 >= excavation.x + excavation.w) {
          return cell;
        }
        return false;
      });
    });
  }
  function getImageSettings(cells, size, includeMargin, imageSettings) {
    if (imageSettings == null) {
      return null;
    }
    const margin = includeMargin ? MARGIN_SIZE : 0;
    const numCells = cells.length + margin * 2;
    const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE);
    const scale = numCells / size;
    const w2 = (imageSettings.width || defaultSize) * scale;
    const h2 = (imageSettings.height || defaultSize) * scale;
    const x2 = imageSettings.x == null ? cells.length / 2 - w2 / 2 : imageSettings.x * scale;
    const y2 = imageSettings.y == null ? cells.length / 2 - h2 / 2 : imageSettings.y * scale;
    let excavation = null;
    if (imageSettings.excavate) {
      let floorX = Math.floor(x2);
      let floorY = Math.floor(y2);
      let ceilW = Math.ceil(w2 + x2 - floorX);
      let ceilH = Math.ceil(h2 + y2 - floorY);
      excavation = {
        x: floorX,
        y: floorY,
        w: ceilW,
        h: ceilH
      };
    }
    return {
      x: x2,
      y: y2,
      h: h2,
      w: w2,
      excavation
    };
  }
  (function() {
    try {
      new Path2D().addPath(new Path2D());
    } catch (e2) {
      return false;
    }
    return true;
  })();
  function QRCodeSVG(props) {
    const _a2 = props, {
      value,
      size = DEFAULT_SIZE,
      level = DEFAULT_LEVEL,
      bgColor = DEFAULT_BGCOLOR,
      fgColor = DEFAULT_FGCOLOR,
      includeMargin = DEFAULT_INCLUDEMARGIN,
      imageSettings
    } = _a2, otherProps = __objRest(_a2, ["value", "size", "level", "bgColor", "fgColor", "includeMargin", "imageSettings"]);
    let cells = qrcodegen_default.QrCode.encodeText(value, ERROR_LEVEL_MAP[level]).getModules();
    const margin = includeMargin ? MARGIN_SIZE : 0;
    const numCells = cells.length + margin * 2;
    const calculatedImageSettings = getImageSettings(cells, size, includeMargin, imageSettings);
    let image = null;
    if (imageSettings != null && calculatedImageSettings != null) {
      if (calculatedImageSettings.excavation != null) {
        cells = excavateModules(cells, calculatedImageSettings.excavation);
      }
      image = /* @__PURE__ */ React__default.createElement("image", {
        xlinkHref: imageSettings.src,
        height: calculatedImageSettings.h,
        width: calculatedImageSettings.w,
        x: calculatedImageSettings.x + margin,
        y: calculatedImageSettings.y + margin,
        preserveAspectRatio: "none"
      });
    }
    const fgPath = generatePath(cells, margin);
    return /* @__PURE__ */ React__default.createElement("svg", __spreadValues({
      height: size,
      width: size,
      viewBox: `0 0 ${numCells} ${numCells}`
    }, otherProps), /* @__PURE__ */ React__default.createElement("path", {
      fill: bgColor,
      d: `M0,0 h${numCells}v${numCells}H0z`,
      shapeRendering: "crispEdges"
    }), /* @__PURE__ */ React__default.createElement("path", {
      fill: fgColor,
      d: fgPath,
      shapeRendering: "crispEdges"
    }), image);
  }
  const newSignedForm = (params) => {
    const sign = appSign(params, TVKeyInfo.appkey, TVKeyInfo.appsec);
    return new URLSearchParams({
      ...params,
      sign
    });
  };
  async function getQrCodeInfo() {
    const res = await request.post(
      "https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code",
      newSignedForm({
        appkey: TVKeyInfo.appkey,
        local_id: "0",
        ts: "0"
      })
      // sign: 'e134154ed6add881d28fbdf68653cd9c',
    );
    const json = res.data;
    if (!isWebApiSuccess(json)) {
      toast((json == null ? void 0 : json.message) || "获取 auth_code 失败");
      return;
    }
    return json.data;
  }
  async function poll(auth_code) {
    const res = await request.post("https://passport.bilibili.com/x/passport-tv-login/qrcode/poll", newSignedForm({
      appkey: TVKeyInfo.appkey,
      auth_code,
      local_id: "0",
      ts: "0"
    }));
    const json = res.data;
    const msgMap = {
      "0": "成功",
      "-3": "API校验密匙错误",
      "-400": "请求错误",
      "-404": "啥都木有",
      "86038": "二维码已失效",
      "86039": "二维码尚未确认",
      "86090": "二维码已扫码未确认"
    };
    if (!isWebApiSuccess(json)) {
      const code = json.code.toString();
      const message2 = json.message || msgMap[code] || "未知错误";
      if (code === "86038") {
        return {
          success: false,
          message: message2,
          action: "refresh"
        };
      }
      if (code === "86039" || code === "86090") {
        return {
          success: false,
          message: message2,
          action: "wait"
        };
      }
      return {
        success: false,
        message: message2,
        action: void 0
      };
    }
    const accessKey = json.data.access_token;
    const accessKeyExpireAt = Date.now() + json.data.expires_in * 1e3;
    return {
      success: true,
      message: "获取成功",
      accessKey,
      accessKeyExpireAt
    };
  }
  const initialValue = {
    show: false,
    qrcode: "",
    auth_code: "",
    message: ""
  };
  const store = proxy({
    ...initialValue
  });
  const qrcodeStore = store;
  function updateStore(data) {
    renderOnce();
    Object.assign(store, data);
  }
  function showQrCodeModal(data) {
    updateStore({
      ...initialValue,
      ...data,
      show: true
    });
  }
  function hideQrCodeModal() {
    emitter.emit("hide");
    updateStore({
      ...initialValue
    });
  }
  const emitter = mitt();
  function whenQrCodeModalHide() {
    return pEvent(emitter, "hide");
  }
  var _ref$b = {
    name: "1dbae5v",
    styles: "font-size:13px;margin-bottom:20px"
  };
  var _ref2$a = {
    name: "1ryaosi",
    styles: "font-size:14px;display:flex;align-items:center;justify-content:center;min-height:25px;margin-bottom:5px"
  };
  var _ref3$4 = {
    name: "1f2tjv5",
    styles: "margin-top:20px;margin-bottom:40px"
  };
  var _ref4$2 = {
    name: "82zbxv",
    styles: "text-align:center;padding-top:15px"
  };
  var _ref5$2 = {
    name: "16s5rj8",
    styles: "width:280px"
  };
  var _ref6$2 = {
    name: "9vstlm",
    styles: "backdrop-filter:blur(10px)"
  };
  function TvQrCodeAuth() {
    const {
      qrcode,
      show,
      message: message2
    } = useSnapshot(store);
    const onHide2 = hideQrCodeModal;
    const dark = useIsDarkMode();
    return /* @__PURE__ */ jsxs(BaseModal, {
      show,
      onHide: onHide2,
      hideWhenMaskOnClick: false,
      hideWhenEsc: false,
      cssModalMask: _ref6$2,
      cssModal: _ref5$2,
      children: [/* @__PURE__ */ jsxs("div", {
        className: BaseModalClass.modalHeader,
        children: [/* @__PURE__ */ jsx("div", {
          className: BaseModalClass.modalTitle
        }), /* @__PURE__ */ jsx("div", {
          className: "space",
          style: {
            flex: 1
          }
        }), /* @__PURE__ */ jsx(ModalClose, {
          onClick: onHide2
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: BaseModalClass.modalBody,
        children: /* @__PURE__ */ jsxs("div", {
          className: "wrapper",
          css: _ref4$2,
          children: [/* @__PURE__ */ jsxs("div", {
            className: "qr-wrapper",
            css: _ref3$4,
            children: [/* @__PURE__ */ jsx("div", {
              css: _ref2$a,
              children: message2 || ""
            }), qrcode ? /* @__PURE__ */ jsx(QRCodeSVG, {
              value: qrcode,
              size: 200,
              includeMargin: dark
            }) : /* @__PURE__ */ jsx("div", {
              className: "qrcode-placeholder"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "footnote",
            css: _ref$b,
            children: ["打开「哔哩哔哩」或「bilibili」APP ", /* @__PURE__ */ jsx("br", {}), "扫码获取 access_key"]
          })]
        })
      })]
    });
  }
  const renderOnce = lodash.once(function render() {
    const container = document.createElement("div");
    container.classList.add("modal-tv-qrcode-auth", APP_NAME_ROOT_CLASSNAME);
    document.body.appendChild(container);
    const r2 = createRoot(container);
    r2.render(/* @__PURE__ */ jsx(AntdApp, {
      children: /* @__PURE__ */ jsx(TvQrCodeAuth, {})
    }));
  });
  async function refreshQrCode() {
    const qrinfo = await getQrCodeInfo();
    if (!qrinfo)
      return;
    showQrCodeModal({
      qrcode: qrinfo.url,
      auth_code: qrinfo.auth_code
    });
    return true;
  }
  async function getAccessKeyByQrCode() {
    const next2 = await refreshQrCode();
    if (!next2)
      return;
    let res;
    let pollfor = qrcodeStore.auth_code;
    function shouldBreak() {
      if (!qrcodeStore.show)
        return true;
      if (!qrcodeStore.auth_code)
        return true;
      if (pollfor !== qrcodeStore.auth_code)
        return true;
    }
    while (true) {
      if (shouldBreak())
        return;
      const p1 = delay(1500);
      const p2 = whenQrCodeModalHide();
      await Promise.race([p1, p2]);
      p2.cancel();
      if (shouldBreak())
        return;
      if (shouldBreak())
        return;
      res = await poll(qrcodeStore.auth_code);
      const {
        success,
        accessKey,
        accessKeyExpireAt,
        message: message2,
        action
      } = res;
      if (shouldBreak())
        return;
      updateStore({
        message: message2
      });
      if (success) {
        await delay(1e3);
        hideQrCodeModal();
        return {
          accessKey,
          accessKeyExpireAt
        };
      }
      if (action === "refresh") {
        if (shouldBreak())
          return;
        await delay(2e3);
        if (shouldBreak())
          return;
        await refreshQrCode();
        pollfor = qrcodeStore.auth_code;
        updateStore({
          message: "已刷新二维码"
        });
        continue;
      }
      if (action === "wait") {
        continue;
      }
      if (shouldBreak())
        return;
      updateStore({
        message: message2
      });
      toast(message2);
      return;
    }
  }
  async function getAccessKey() {
    const {
      accessKey,
      accessKeyExpireAt
    } = await getAccessKeyByQrCode() || {};
    if (!accessKey || !accessKeyExpireAt)
      return;
    settings.accessKey = accessKey;
    settings.accessKeyExpireAt = accessKeyExpireAt;
    toast("获取成功");
  }
  function deleteAccessKey() {
    settings.accessKey = "";
    settings.accessKeyExpireAt = 0;
    toast("已删除 access_key");
  }
  const toHttps = (url) => (url || "").replace(/^http:\/\//, "https://");
  function parseDuration(d2) {
    if (!d2)
      return 0;
    const units = [1, 60, 360];
    const splited = d2.split(":").map((s2) => Number(s2)).reverse();
    const total = splited.reduce((total2, cur, index) => {
      return total2 + cur * units[index];
    }, 0);
    return total;
  }
  function formatDuration(d2) {
    d2 || (d2 = 0);
    return dayjs.duration(d2 || 0, "seconds").format(d2 >= 3600 ? "HH:mm:ss" : "mm:ss");
  }
  function formatCount(count) {
    if (!count)
      return "";
    if (count <= 9999) {
      return count.toString();
    }
    count /= 1e4;
    if (count <= 9999) {
      let _c = count.toFixed(1);
      _c = _c.replace(/\.0$/, "");
      return `${_c}万`;
    }
    count /= 1e4;
    if (count <= 9999) {
      let _c = count.toFixed(1);
      _c = _c.replace(/\.0$/, "");
      return `${_c}亿`;
    }
  }
  function parseCount(str) {
    if (!str)
      return void 0;
    if (str === "-")
      return 0;
    if (/^\d+$/.test(str))
      return Number(str);
    if (/^\d+(\.\d+?)?万$/.test(str))
      return Number(str.slice(0, -1)) * 1e4;
    if (/^\d+(\.\d+?)?亿$/.test(str))
      return Number(str.slice(0, -1)) * 1e8;
  }
  const currentYear = dayjs().format("YYYY");
  function formatTimeStamp(unixTs, includeTime = false) {
    if (!unixTs)
      return "";
    const t2 = dayjs.unix(unixTs);
    const extraFormat = includeTime ? " HH:mm" : "";
    if (t2.format("YYYY") === currentYear) {
      return t2.format("M-D" + extraFormat);
    } else {
      return t2.format("YY-M-D" + extraFormat);
    }
  }
  const VideoStateMap = {
    "1": "橙色通过",
    "0": "开放浏览",
    "-1": "待审",
    "-2": "被打回",
    "-3": "网警锁定",
    "-4": "被锁定",
    "-5": "管理员锁定",
    "-6": "修复待审",
    "-7": "暂缓审核",
    "-8": "补档待审",
    "-9": "等待转码",
    "-10": "延迟审核",
    "-11": "视频源待修",
    "-12": "转储失败",
    "-13": "允许评论待审",
    "-14": "临时回收站",
    "-15": "分发中",
    "-16": "转码失败",
    "-20": "创建未提交",
    "-30": "创建已提交",
    "-40": "定时发布",
    "-100": "用户删除"
  };
  function getVideoInvalidReason(state) {
    if (typeof state === "undefined")
      return;
    if (state >= 0)
      return;
    return VideoStateMap[state];
  }
  function proxySet(initialValues) {
    const set = proxy({
      data: Array.from(new Set(initialValues)),
      has(value) {
        return this.data.indexOf(value) !== -1;
      },
      add(value) {
        let hasProxy = false;
        if (typeof value === "object" && value !== null) {
          hasProxy = this.data.indexOf(proxy(value)) !== -1;
        }
        if (this.data.indexOf(value) === -1 && !hasProxy) {
          this.data.push(value);
        }
        return this;
      },
      delete(value) {
        const index = this.data.indexOf(value);
        if (index === -1) {
          return false;
        }
        this.data.splice(index, 1);
        return true;
      },
      clear() {
        this.data.splice(0);
      },
      get size() {
        return this.data.length;
      },
      forEach(cb) {
        this.data.forEach((value) => {
          cb(value, value, this);
        });
      },
      get [Symbol.toStringTag]() {
        return "Set";
      },
      toJSON() {
        return new Set(this.data);
      },
      [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
      },
      values() {
        return this.data.values();
      },
      keys() {
        return this.data.values();
      },
      entries() {
        return new Set(this.data).entries();
      }
    });
    Object.defineProperties(set, {
      data: {
        enumerable: false
      },
      size: {
        enumerable: false
      },
      toJSON: {
        enumerable: false
      }
    });
    Object.seal(set);
    return set;
  }
  function proxyMap(entries) {
    const map = proxy({
      data: Array.from(entries || []),
      has(key2) {
        return this.data.some((p2) => p2[0] === key2);
      },
      set(key2, value) {
        const record = this.data.find((p2) => p2[0] === key2);
        if (record) {
          record[1] = value;
        } else {
          this.data.push([key2, value]);
        }
        return this;
      },
      get(key2) {
        var _a2;
        return (_a2 = this.data.find((p2) => p2[0] === key2)) == null ? void 0 : _a2[1];
      },
      delete(key2) {
        const index = this.data.findIndex((p2) => p2[0] === key2);
        if (index === -1) {
          return false;
        }
        this.data.splice(index, 1);
        return true;
      },
      clear() {
        this.data.splice(0);
      },
      get size() {
        return this.data.length;
      },
      toJSON() {
        return new Map(this.data);
      },
      forEach(cb) {
        this.data.forEach((p2) => {
          cb(p2[1], p2[0], this);
        });
      },
      keys() {
        return this.data.map((p2) => p2[0]).values();
      },
      values() {
        return this.data.map((p2) => p2[1]).values();
      },
      entries() {
        return new Map(this.data).entries();
      },
      get [Symbol.toStringTag]() {
        return "Map";
      },
      [Symbol.iterator]() {
        return this.entries();
      }
    });
    Object.defineProperties(map, {
      data: {
        enumerable: false
      },
      size: {
        enumerable: false
      },
      toJSON: {
        enumerable: false
      }
    });
    Object.seal(map);
    return map;
  }
  class QuickLRU extends Map {
    constructor(options = {}) {
      super();
      __privateAdd(this, _emitEvictions);
      __privateAdd(this, _deleteIfExpired);
      __privateAdd(this, _getOrDeleteIfExpired);
      __privateAdd(this, _getItemValue);
      __privateAdd(this, _peek);
      __privateAdd(this, _set);
      __privateAdd(this, _moveToRecent);
      __privateAdd(this, _entriesAscending);
      __privateAdd(this, _size, 0);
      __privateAdd(this, _cache, /* @__PURE__ */ new Map());
      __privateAdd(this, _oldCache, /* @__PURE__ */ new Map());
      __privateAdd(this, _maxSize, void 0);
      __privateAdd(this, _maxAge, void 0);
      __privateAdd(this, _onEviction, void 0);
      if (!(options.maxSize && options.maxSize > 0)) {
        throw new TypeError("`maxSize` must be a number greater than 0");
      }
      if (typeof options.maxAge === "number" && options.maxAge === 0) {
        throw new TypeError("`maxAge` must be a number greater than 0");
      }
      __privateSet(this, _maxSize, options.maxSize);
      __privateSet(this, _maxAge, options.maxAge || Number.POSITIVE_INFINITY);
      __privateSet(this, _onEviction, options.onEviction);
    }
    // For tests.
    get __oldCache() {
      return __privateGet(this, _oldCache);
    }
    get(key2) {
      if (__privateGet(this, _cache).has(key2)) {
        const item = __privateGet(this, _cache).get(key2);
        return __privateMethod(this, _getItemValue, getItemValue_fn).call(this, key2, item);
      }
      if (__privateGet(this, _oldCache).has(key2)) {
        const item = __privateGet(this, _oldCache).get(key2);
        if (__privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, item) === false) {
          __privateMethod(this, _moveToRecent, moveToRecent_fn).call(this, key2, item);
          return item.value;
        }
      }
    }
    set(key2, value, {
      maxAge = __privateGet(this, _maxAge)
    } = {}) {
      const expiry = typeof maxAge === "number" && maxAge !== Number.POSITIVE_INFINITY ? Date.now() + maxAge : void 0;
      if (__privateGet(this, _cache).has(key2)) {
        __privateGet(this, _cache).set(key2, {
          value,
          expiry
        });
      } else {
        __privateMethod(this, _set, set_fn).call(this, key2, {
          value,
          expiry
        });
      }
      return this;
    }
    has(key2) {
      if (__privateGet(this, _cache).has(key2)) {
        return !__privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, __privateGet(this, _cache).get(key2));
      }
      if (__privateGet(this, _oldCache).has(key2)) {
        return !__privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, __privateGet(this, _oldCache).get(key2));
      }
      return false;
    }
    peek(key2) {
      if (__privateGet(this, _cache).has(key2)) {
        return __privateMethod(this, _peek, peek_fn).call(this, key2, __privateGet(this, _cache));
      }
      if (__privateGet(this, _oldCache).has(key2)) {
        return __privateMethod(this, _peek, peek_fn).call(this, key2, __privateGet(this, _oldCache));
      }
    }
    delete(key2) {
      const deleted = __privateGet(this, _cache).delete(key2);
      if (deleted) {
        __privateWrapper(this, _size)._--;
      }
      return __privateGet(this, _oldCache).delete(key2) || deleted;
    }
    clear() {
      __privateGet(this, _cache).clear();
      __privateGet(this, _oldCache).clear();
      __privateSet(this, _size, 0);
    }
    resize(newSize) {
      if (!(newSize && newSize > 0)) {
        throw new TypeError("`maxSize` must be a number greater than 0");
      }
      const items = [...__privateMethod(this, _entriesAscending, entriesAscending_fn).call(this)];
      const removeCount = items.length - newSize;
      if (removeCount < 0) {
        __privateSet(this, _cache, new Map(items));
        __privateSet(this, _oldCache, /* @__PURE__ */ new Map());
        __privateSet(this, _size, items.length);
      } else {
        if (removeCount > 0) {
          __privateMethod(this, _emitEvictions, emitEvictions_fn).call(this, items.slice(0, removeCount));
        }
        __privateSet(this, _oldCache, new Map(items.slice(removeCount)));
        __privateSet(this, _cache, /* @__PURE__ */ new Map());
        __privateSet(this, _size, 0);
      }
      __privateSet(this, _maxSize, newSize);
    }
    *keys() {
      for (const [key2] of this) {
        yield key2;
      }
    }
    *values() {
      for (const [, value] of this) {
        yield value;
      }
    }
    *[Symbol.iterator]() {
      for (const item of __privateGet(this, _cache)) {
        const [key2, value] = item;
        const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
        if (deleted === false) {
          yield [key2, value.value];
        }
      }
      for (const item of __privateGet(this, _oldCache)) {
        const [key2, value] = item;
        if (!__privateGet(this, _cache).has(key2)) {
          const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
          if (deleted === false) {
            yield [key2, value.value];
          }
        }
      }
    }
    *entriesDescending() {
      let items = [...__privateGet(this, _cache)];
      for (let i2 = items.length - 1; i2 >= 0; --i2) {
        const item = items[i2];
        const [key2, value] = item;
        const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
        if (deleted === false) {
          yield [key2, value.value];
        }
      }
      items = [...__privateGet(this, _oldCache)];
      for (let i2 = items.length - 1; i2 >= 0; --i2) {
        const item = items[i2];
        const [key2, value] = item;
        if (!__privateGet(this, _cache).has(key2)) {
          const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
          if (deleted === false) {
            yield [key2, value.value];
          }
        }
      }
    }
    *entriesAscending() {
      for (const [key2, value] of __privateMethod(this, _entriesAscending, entriesAscending_fn).call(this)) {
        yield [key2, value.value];
      }
    }
    get size() {
      if (!__privateGet(this, _size)) {
        return __privateGet(this, _oldCache).size;
      }
      let oldCacheSize = 0;
      for (const key2 of __privateGet(this, _oldCache).keys()) {
        if (!__privateGet(this, _cache).has(key2)) {
          oldCacheSize++;
        }
      }
      return Math.min(__privateGet(this, _size) + oldCacheSize, __privateGet(this, _maxSize));
    }
    get maxSize() {
      return __privateGet(this, _maxSize);
    }
    entries() {
      return this.entriesAscending();
    }
    forEach(callbackFunction, thisArgument = this) {
      for (const [key2, value] of this.entriesAscending()) {
        callbackFunction.call(thisArgument, value, key2, this);
      }
    }
    get [Symbol.toStringTag]() {
      return JSON.stringify([...this.entriesAscending()]);
    }
  }
  _size = new WeakMap();
  _cache = new WeakMap();
  _oldCache = new WeakMap();
  _maxSize = new WeakMap();
  _maxAge = new WeakMap();
  _onEviction = new WeakMap();
  _emitEvictions = new WeakSet();
  emitEvictions_fn = function(cache2) {
    if (typeof __privateGet(this, _onEviction) !== "function") {
      return;
    }
    for (const [key2, item] of cache2) {
      __privateGet(this, _onEviction).call(this, key2, item.value);
    }
  };
  _deleteIfExpired = new WeakSet();
  deleteIfExpired_fn = function(key2, item) {
    if (typeof item.expiry === "number" && item.expiry <= Date.now()) {
      if (typeof __privateGet(this, _onEviction) === "function") {
        __privateGet(this, _onEviction).call(this, key2, item.value);
      }
      return this.delete(key2);
    }
    return false;
  };
  _getOrDeleteIfExpired = new WeakSet();
  getOrDeleteIfExpired_fn = function(key2, item) {
    const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, item);
    if (deleted === false) {
      return item.value;
    }
  };
  _getItemValue = new WeakSet();
  getItemValue_fn = function(key2, item) {
    return item.expiry ? __privateMethod(this, _getOrDeleteIfExpired, getOrDeleteIfExpired_fn).call(this, key2, item) : item.value;
  };
  _peek = new WeakSet();
  peek_fn = function(key2, cache2) {
    const item = cache2.get(key2);
    return __privateMethod(this, _getItemValue, getItemValue_fn).call(this, key2, item);
  };
  _set = new WeakSet();
  set_fn = function(key2, value) {
    __privateGet(this, _cache).set(key2, value);
    __privateWrapper(this, _size)._++;
    if (__privateGet(this, _size) >= __privateGet(this, _maxSize)) {
      __privateSet(this, _size, 0);
      __privateMethod(this, _emitEvictions, emitEvictions_fn).call(this, __privateGet(this, _oldCache));
      __privateSet(this, _oldCache, __privateGet(this, _cache));
      __privateSet(this, _cache, /* @__PURE__ */ new Map());
    }
  };
  _moveToRecent = new WeakSet();
  moveToRecent_fn = function(key2, item) {
    __privateGet(this, _oldCache).delete(key2);
    __privateMethod(this, _set, set_fn).call(this, key2, item);
  };
  _entriesAscending = new WeakSet();
  entriesAscending_fn = function* () {
    for (const item of __privateGet(this, _oldCache)) {
      const [key2, value] = item;
      if (!__privateGet(this, _cache).has(key2)) {
        const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
        if (deleted === false) {
          yield item;
        }
      }
    }
    for (const item of __privateGet(this, _cache)) {
      const [key2, value] = item;
      const deleted = __privateMethod(this, _deleteIfExpired, deleteIfExpired_fn).call(this, key2, value);
      if (deleted === false) {
        yield item;
      }
    }
  };
  async function videoshot(bvid) {
    const res = await request.get("/x/player/videoshot", {
      params: {
        bvid,
        index: "1"
      }
    });
    const json = res.data;
    return json.data;
  }
  const cache$1 = new QuickLRU({
    maxSize: 1e4
  });
  async function getVideoData(bvid) {
    if (cache$1.has(bvid)) {
      return cache$1.get(bvid);
    }
    const videoshotData = await videoshot(bvid);
    const dmData = [];
    cache$1.set(bvid, {
      videoshotData,
      dmData
    });
    return {
      videoshotData,
      dmData
    };
  }
  function watchLaterFactory(action) {
    return async function watchLaterOp(avid) {
      const form = new URLSearchParams({
        aid: avid,
        csrf: getCsrfToken()
      });
      const res = await request.post("/x/v2/history/toview/" + action, form);
      const json = res.data;
      const success = isWebApiSuccess(json);
      if (!success) {
        toast((json == null ? void 0 : json.message) || "出错了");
      }
      return success;
    };
  }
  const watchLaterAdd = watchLaterFactory("add");
  const watchLaterDel = watchLaterFactory("del");
  const dislikeFactory = (type) => {
    const pathname2 = {
      dislike: "/x/feed/dislike",
      cancel: "/x/feed/dislike/cancel"
    }[type];
    return async function(item, reasonId) {
      const res = await gmrequest.get(HOST_APP + pathname2, {
        params: {
          goto: item.goto,
          id: item.param,
          // mid: item.mid,
          // rid: item.tid,
          // tag_id: item.tag?.tag_id,
          reason_id: reasonId,
          // other stuffs
          build: "1",
          mobi_app: "android",
          idx: (Date.now() / 1e3).toFixed(0)
        }
      });
      const json = res.data;
      const success = isWebApiSuccess(json);
      return success;
    };
  };
  const dislike = dislikeFactory("dislike");
  const cancelDislike = dislikeFactory("cancel");
  const dislikedIds = proxyMap();
  function useDislikedIds() {
    return useSnapshot(dislikedIds);
  }
  function useDislikedReason(id) {
    const map = useDislikedIds();
    if (!id)
      return void 0;
    return map.get(id);
  }
  function delDislikeId(id) {
    dislikedIds.delete(id);
  }
  var _ref$a = {
    name: "iqoq9n",
    styles: "margin-top:20px"
  };
  var _ref2$9 = {
    name: "1crg5pf",
    styles: "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between"
  };
  var _ref3$3 = {
    name: "125di4i",
    styles: "margin-left:5px;font-size:40%"
  };
  function ModalDislike({
    show,
    onHide: onHide2,
    item
  }) {
    const [isRequesting, setIsRequesting] = React__default.useState(false);
    const onDislike = useMemoizedFn(async (reason) => {
      if (!item)
        return;
      let success = false;
      let err;
      try {
        setIsRequesting(true);
        success = await dislike(item, reason.id);
      } catch (e2) {
        err = e2;
      } finally {
        setIsRequesting(false);
      }
      if (err) {
        console.error(err.stack || err);
        return toastRequestFail();
      }
      success ? AntdMessage.success("已标记不想看") : AntdMessage.error(OPERATION_FAIL_MSG);
      if (success) {
        dislikedIds.set(item.param, {
          ...reason
        });
        onHide2();
      }
    });
    const reasons = React__default.useMemo(() => {
      var _a2;
      return ((_a2 = item == null ? void 0 : item.three_point) == null ? void 0 : _a2.dislike_reasons) || [];
    }, [item]);
    const modalBodyRef = React__default.useRef(null);
    const keyPressEnabled = () => !!show && !!item;
    const KEYS = ["1", "2", "3", "4", "5", "6"];
    useKeyPress(KEYS, (e2) => {
      var _a2;
      if (!keyPressEnabled())
        return;
      if (!KEYS.includes(e2.key))
        return;
      const index = Number(e2.key) - 1;
      setActiveIndex(index);
      const btn = (_a2 = modalBodyRef.current) == null ? void 0 : _a2.querySelectorAll(".reason")[index];
      btn == null ? void 0 : btn.click();
    });
    const [activeIndex, setActiveIndex] = React__default.useState(reasons.length - 1);
    useUpdateLayoutEffect(() => {
      setActiveIndex(reasons.length - 1);
    }, [reasons]);
    const increaseIndex = (by) => {
      return () => {
        if (!keyPressEnabled())
          return;
        const newIndex = activeIndex + by;
        if (newIndex < 0 || newIndex > reasons.length - 1)
          return;
        setActiveIndex(newIndex);
      };
    };
    useKeyPress("leftarrow", increaseIndex(-1), {
      exactMatch: true
    });
    useKeyPress("rightarrow", increaseIndex(1), {
      exactMatch: true
    });
    useKeyPress("uparrow", increaseIndex(-2), {
      exactMatch: true
    });
    useKeyPress("downarrow", increaseIndex(2), {
      exactMatch: true
    });
    useKeyPress("enter", (e2) => {
      var _a2;
      if (!keyPressEnabled())
        return;
      if (activeIndex < 0 || activeIndex > reasons.length - 1)
        return;
      e2.preventDefault();
      e2.stopImmediatePropagation();
      const btn = (_a2 = modalBodyRef.current) == null ? void 0 : _a2.querySelector(".reason.active");
      btn == null ? void 0 : btn.click();
    }, {
      exactMatch: true
    });
    const activeReasonName = React__default.useMemo(() => {
      var _a2;
      return ((_a2 = reasons[activeIndex]) == null ? void 0 : _a2.name) || "";
    }, [reasons, activeIndex]);
    return /* @__PURE__ */ jsxs(BaseModal, {
      show,
      onHide: onHide2,
      hideWhenMaskOnClick: true,
      hideWhenEsc: true,
      width: 500,
      children: [/* @__PURE__ */ jsxs("div", {
        className: BaseModalClass.modalHeader,
        children: [/* @__PURE__ */ jsxs("div", {
          className: BaseModalClass.modalTitle,
          children: ["我不想看", /* @__PURE__ */ jsx("span", {
            css: _ref3$3,
            children: "(选择后将减少相似内容推荐)"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "space",
          style: {
            flex: 1
          }
        }), /* @__PURE__ */ jsx(ModalClose, {
          onClick: onHide2
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: BaseModalClass.modalBody,
        ref: modalBodyRef,
        children: [/* @__PURE__ */ jsx("div", {
          className: "reason-list",
          css: _ref2$9,
          children: reasons.map((reason, index) => {
            const active = index === activeIndex;
            return /* @__PURE__ */ jsxs("button", {
              className: cx("reason", {
                active
              }),
              css: [_css.reason, active && _css.reasonActive, "", ""],
              "data-id": reason.id,
              onClick: () => {
                setActiveIndex(index);
                onDislike(reason);
              },
              disabled: isRequesting,
              children: [/* @__PURE__ */ jsx("span", {
                className: "reason-no",
                css: /* @__PURE__ */ css("position:absolute;left:6px;width:20px;height:20px;border-radius:50%;top:", (32 - 20) / 2, "px;display:flex;align-items:center;justify-content:center;background-color:", colorPrimaryValue, ";color:#fff;", ""),
                children: index + 1
              }), reason.name]
            }, reason.id);
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "tips-container",
          css: _ref$a,
          children: [/* @__PURE__ */ jsxs("div", {
            className: "tips",
            css: _css.tips,
            children: [/* @__PURE__ */ jsx(IconPark, {
              name: "Info",
              size: 15,
              style: {
                marginRight: 5
              }
            }), "使用删除键打开弹窗, 数字键选择, Esc 关闭"]
          }), activeReasonName && /* @__PURE__ */ jsxs("div", {
            className: "tips",
            css: _css.tips,
            children: [/* @__PURE__ */ jsx(IconPark, {
              name: "Info",
              size: 15,
              style: {
                marginRight: 5
              }
            }), "已选择「", activeReasonName, "」, 回车键提交"]
          })]
        })]
      })]
    });
  }
  const _css = {
    reason: {
      name: "lu8kba",
      styles: "color:inherit;width:48%;text-align:center;line-height:20px;position:relative;border-radius:4px;border:2px solid #eee;* :where(body.dark) &{border-color:#333;}padding-top:5px;padding-bottom:5px;margin-top:5px;margin-bottom:5px"
    },
    reasonActive: /* @__PURE__ */ css("&.active{border-color:", colorPrimaryValue, ";}", ""),
    tips: {
      name: "s5xdrg",
      styles: "display:flex;align-items:center"
    }
  };
  const currentProps = {
    show: false,
    onHide,
    item: null
  };
  const modalDislikeVisibleState = proxy({
    value: currentProps.show
  });
  const useModalDislikeVisible = function() {
    return useSnapshot(modalDislikeVisibleState).value;
  };
  function onHide() {
    setTimeout(() => {
      updateProps({
        show: false,
        item: null
      });
    });
  }
  function updateProps(newProps) {
    Object.assign(currentProps, newProps);
    modalDislikeVisibleState.value = currentProps.show;
    getRoot().render(/* @__PURE__ */ jsx(ModalDislike, {
      ...currentProps,
      onHide
    }));
  }
  let _root;
  function getRoot() {
    _root || (_root = (() => {
      const container = document.createElement("div");
      container.classList.add("show-dislike-container", APP_NAME_ROOT_CLASSNAME);
      document.body.appendChild(container);
      return createRoot(container);
    })());
    return _root;
  }
  function showModalDislike(item) {
    if ((item == null ? void 0 : item.param) && dislikedIds.has(item.param))
      return;
    updateProps({
      show: true,
      item
    });
  }
  function proxyWithLocalStorage(initialVaue2, storageKey) {
    const allowedKeys = Object.keys(initialVaue2);
    const savedValue = lodash.pick(JSON.parse(localStorage.getItem(storageKey) || "{}"), allowedKeys);
    const p2 = proxy({
      ...initialVaue2,
      ...savedValue
    });
    subscribe$3(p2, () => {
      const val = snapshot(p2);
      localStorage.setItem(storageKey, JSON.stringify(val));
    });
    return p2;
  }
  function FlagSettingItem({
    configKey,
    label,
    extraAction,
    tooltip,
    ...otherProps
  }) {
    const snap = useSettingsSnapshot();
    const checked = !!snap[configKey];
    const onChange = React__default.useCallback((e2) => {
      const val = e2.target.checked;
      updateSettings({
        [configKey]: val
      });
      extraAction == null ? void 0 : extraAction(val);
    }, []);
    let inner = /* @__PURE__ */ jsx("span", {
      style: {
        userSelect: "none"
      },
      children: label || configKey
    });
    if (tooltip)
      inner = /* @__PURE__ */ jsx(antd.Tooltip, {
        title: tooltip,
        overlayStyle: {
          width: "max-content",
          maxWidth: "50vw"
        },
        children: inner
      });
    return /* @__PURE__ */ jsx(antd.Checkbox, {
      ...otherProps,
      checked,
      onChange,
      children: inner
    });
  }
  function HelpInfo({
    tooltip,
    iconProps,
    tooltipProps
  }) {
    return /* @__PURE__ */ jsx(Fragment, {
      children: tooltip && /* @__PURE__ */ jsx(AntdTooltip, {
        ...tooltipProps,
        title: tooltip,
        children: /* @__PURE__ */ jsx(IconPark, {
          name: "Info",
          size: 18,
          ...iconProps,
          style: {
            cursor: "pointer",
            marginLeft: "4px",
            ...iconProps == null ? void 0 : iconProps.style
          }
        })
      })
    });
  }
  const TabConfig = [{
    key: "recommend-app",
    icon: "Iphone",
    label: "推荐",
    desc: "使用 Bilibili App 端推荐 API"
  }, {
    key: "recommend-pc",
    icon: "Computer",
    label: "推荐",
    desc: "使用新版首页顶部推荐 API"
  }, {
    key: "keep-follow-only",
    icon: "Concern",
    label: "已关注",
    desc: "推荐中只保留「已关注」,会很慢"
  }, {
    key: "dynamic-feed",
    icon: "Tumblr",
    iconProps: {
      size: 16
    },
    label: "动态",
    desc: "视频投稿动态",
    swr: true
  }, {
    key: "watchlater",
    icon: "FileCabinet",
    iconProps: {
      size: 15
    },
    label: "稍后再看",
    desc: "你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序",
    swr: true
  }, {
    key: "fav",
    icon: "Star",
    iconProps: {
      size: 15
    },
    label: "收藏",
    desc: "你添加的收藏; 默认随机乱序, 可在设置中关闭乱序"
  }, {
    key: "popular-general",
    icon: "Fire",
    iconProps: {
      size: 16
    },
    label: "综合热门",
    desc: "各个领域中新奇好玩的优质内容都在这里~",
    swr: true
  }, {
    key: "popular-weekly",
    icon: "TrendTwo",
    iconProps: {
      size: 15
    },
    label: "每周必看",
    desc: "每周五晚 18:00 更新"
  }];
  const TabConfigMap = TabConfig.reduce((val, configItem) => {
    return {
      ...val,
      [configItem.key]: configItem
    };
  }, {});
  const TabKeys = TabConfig.map((x2) => x2.key);
  function toastNeedLogin() {
    return toast("你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~");
  }
  const VIDEO_SOURCE_TAB_STORAGE_KEY = `${APP_NAME}-video-source-tab`;
  const videoSourceTabState = proxyWithLocalStorage({
    value: "recommend-app"
  }, VIDEO_SOURCE_TAB_STORAGE_KEY);
  function useCurrentShowingTabKeys() {
    const {
      hidingTabKeys
    } = useSettingsSnapshot();
    return React__default.useMemo(() => TabKeys.filter((key2) => !hidingTabKeys.includes(key2)), [hidingTabKeys]);
  }
  function sortTabKeys(customTabKeysOrder) {
    return TabKeys.slice().sort((a2, b2) => {
      let aIndex = customTabKeysOrder.indexOf(a2);
      let bIndex = customTabKeysOrder.indexOf(b2);
      if (aIndex === -1)
        aIndex = TabKeys.indexOf(a2);
      if (bIndex === -1)
        bIndex = TabKeys.indexOf(b2);
      return aIndex - bIndex;
    });
  }
  function useSortedTabKeys() {
    const {
      customTabKeysOrder
    } = useSettingsSnapshot();
    return React__default.useMemo(() => sortTabKeys(customTabKeysOrder), [customTabKeysOrder]);
  }
  function useCurrentTabConfig() {
    const {
      hidingTabKeys,
      customTabKeysOrder
    } = useSettingsSnapshot();
    const logined = useHasLogined();
    return React__default.useMemo(() => {
      let tabkeys = sortTabKeys(customTabKeysOrder);
      tabkeys = tabkeys.filter((key2) => !hidingTabKeys.includes(key2) || !logined && key2 === "recommend-app");
      return tabkeys.map((k2) => TabConfigMap[k2]);
    }, [hidingTabKeys, customTabKeysOrder, logined]);
  }
  function _getCurrentSourceTab(videoSourceTab, logined) {
    if (!TabKeys.includes(videoSourceTab))
      return "recommend-app";
    if (!logined) {
      if (videoSourceTab === "recommend-app" || videoSourceTab === "recommend-pc") {
        return videoSourceTab;
      } else {
        return "recommend-app";
      }
    }
    return videoSourceTab;
  }
  function useCurrentSourceTab() {
    return _getCurrentSourceTab(useSnapshot(videoSourceTabState).value, useHasLogined());
  }
  function getCurrentSourceTab() {
    return _getCurrentSourceTab(videoSourceTabState.value, getHasLogined());
  }
  const iconCss = {
    name: "1inoxbd",
    styles: "margin-right:4px;margin-top:-1px"
  };
  const radioBtnCss = {
    name: "1dwyqh0",
    styles: "height:26px;line-height:unset;&:has(:focus-visible){outline:none;outline-offset:unset;}>.ant-radio-button+span{height:100%;}"
  };
  const radioBtnStandardCss = {
    name: "s0vnfv",
    styles: "height:32px"
  };
  var _ref$9 = {
    name: "shwixj",
    styles: "display:flex;align-items:center;height:22px"
  };
  var _ref2$8 = {
    name: "1k4kcw8",
    styles: "display:flex;align-items:center;line-height:unset;height:100%"
  };
  function VideoSourceTab({
    onRefresh
  }) {
    const logined = useHasLogined();
    const tab2 = useCurrentSourceTab();
    const {
      styleUseStandardVideoSourceTab
    } = useSettingsSnapshot();
    const currentTabConfig = useCurrentTabConfig();
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(antd.Radio.Group, {
        optionType: "button",
        buttonStyle: "solid",
        size: "middle",
        value: tab2,
        style: {
          overflow: "hidden"
        },
        onFocus: (e2) => {
          const target = e2.target;
          target.blur();
        },
        onChange: (e2) => {
          const newValue = e2.target.value;
          if (newValue !== "recommend-app" && newValue !== "recommend-pc" && !logined) {
            if (!checkLoginStatus()) {
              return toastNeedLogin();
            }
          }
          videoSourceTabState.value = newValue;
          setTimeout(() => {
            onRefresh(true, {
              watchlaterKeepOrder: true
            });
          });
        },
        children: currentTabConfig.map(({
          key: key2,
          label,
          icon,
          iconProps
        }) => /* @__PURE__ */ jsx(antd.Radio.Button, {
          css: [radioBtnCss, styleUseStandardVideoSourceTab && radioBtnStandardCss, "", ""],
          className: "video-source-tab",
          tabIndex: -1,
          value: key2,
          children: /* @__PURE__ */ jsxs("span", {
            css: _ref2$8,
            children: [/* @__PURE__ */ jsx(IconPark, {
              name: icon,
              ...iconProps,
              size: (iconProps == null ? void 0 : iconProps.size) || 18,
              css: iconCss
            }), label]
          })
        }, key2))
      }), /* @__PURE__ */ jsx(HelpInfo, {
        iconProps: {
          name: "Tips",
          size: 16,
          style: {
            marginLeft: 6
          }
        },
        tooltip: /* @__PURE__ */ jsx(Fragment, {
          children: currentTabConfig.map(({
            key: key2,
            label,
            icon,
            iconProps,
            desc
          }) => /* @__PURE__ */ jsxs("div", {
            css: _ref$9,
            children: [/* @__PURE__ */ jsx(IconPark, {
              name: icon,
              ...iconProps,
              size: (iconProps == null ? void 0 : iconProps.size) || 18,
              css: iconCss
            }), label, ": ", desc]
          }, key2))
        })
      })]
    });
  }
  function useMittOn(emitter2, type, handler) {
    const fn = useMemoizedFn(handler);
    React__default.useEffect(() => {
      emitter2.on(type, fn);
      return () => {
        emitter2.off(type, fn);
      };
    }, [emitter2]);
  }
  const flexCenterStyle = {
    name: "1wnowod",
    styles: "display:flex;align-items:center;justify-content:center"
  };
  const antdBtnTextStyle = {
    name: "1h1dezd",
    styles: "display:inline-block;margin-top:2px"
  };
  function useRefInit(init) {
    const ref = React__default.useRef(null);
    ref.current ?? (ref.current = init());
    return ref;
  }
  var src = { exports: {} };
  var worker = function mapOnWorker(arr, fn, workers) {
    return new Promise(function(resolve, reject) {
      var completed = 0;
      var started = 0;
      var running = 0;
      var results = new Array(arr.length).fill(void 0);
      var rejected = false;
      var workerIsUnsing = /* @__PURE__ */ new WeakMap();
      var getWorker = function(index) {
        for (var i2 = 0; i2 < workers.length; i2++) {
          var worker2 = workers[i2];
          if (workerIsUnsing.get(worker2)) {
            continue;
          } else {
            workerIsUnsing.set(worker2, index);
            return worker2;
          }
        }
      };
      function start(index) {
        var cur = arr[index];
        var worker2 = getWorker(index);
        Promise.resolve(fn.call(cur, cur, index, arr, worker2)).then(function(result) {
          workerIsUnsing.delete(worker2);
          running--;
          results[index] = result;
          completed++;
          replenish();
        }).catch(function(err) {
          rejected = true;
          reject(err);
        });
      }
      function replenish() {
        if (rejected)
          return;
        if (completed >= arr.length) {
          return resolve(results);
        }
        while (running < workers.length && started < arr.length) {
          start(started);
          started++;
          running++;
        }
      }
      replenish();
    });
  };
  src.exports = function pmap(arr, fn, concurrency) {
    concurrency = concurrency || Infinity;
    if (typeof concurrency !== "number") {
      throw new TypeError(String(concurrency) + " is not a number");
    }
    return new Promise(function(resolve, reject) {
      var completed = 0;
      var started = 0;
      var running = 0;
      var results = new Array(arr.length).fill(void 0);
      var rejected = false;
      function start(index) {
        var cur = arr[index];
        Promise.resolve(fn.call(cur, cur, index, arr)).then(function(result) {
          running--;
          completed++;
          results[index] = result;
          replenish();
        }).catch(function(err) {
          rejected = true;
          reject(err);
        });
      }
      function replenish() {
        if (rejected)
          return;
        if (completed >= arr.length) {
          return resolve(results);
        }
        while (running < concurrency && started < arr.length) {
          start(started);
          running++;
          started++;
        }
      }
      replenish();
    });
  };
  var pmapWorker = worker;
  src.exports.pmapWorker = pmapWorker;
  var srcExports = src.exports;
  const pmap2 = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
  class QueueStrategy {
    constructor(ps = 20) {
      // full-list = returnQueue + bufferQueue + more
      __publicField(this, "returnQueue", []);
      __publicField(this, "bufferQueue", []);
      __publicField(this, "ps");
      this.ps = ps;
    }
    sliceFromQueue() {
      if (this.bufferQueue.length) {
        const sliced = this.bufferQueue.slice(0, this.ps);
        this.bufferQueue = this.bufferQueue.slice(this.ps);
        return this.doReturnItems(sliced);
      }
    }
    // add to returnQueue
    doReturnItems(items) {
      this.returnQueue = this.returnQueue.concat(items || []);
      return items;
    }
    // restore from returnQueue
    restore() {
      this.bufferQueue = [...this.returnQueue, ...this.bufferQueue];
      this.returnQueue = [];
    }
  }
  function formatFavFolderUrl(id) {
    const uid = getUid();
    return `https://space.bilibili.com/${uid}/favlist?fid=${id}`;
  }
  const _FavRecService = class _FavRecService {
    constructor() {
      __publicField(this, "useShuffle");
      __publicField(this, "addSeparator");
      __publicField(this, "total", 0);
      __publicField(this, "allFolderServices", []);
      // before exclude
      __publicField(this, "folderServices", []);
      // after exclude
      // full-list = qs.returnQueue + qs.bufferQueue + folderServices.more
      __publicField(this, "qs", new QueueStrategy(_FavRecService.PAGE_SIZE));
      __publicField(this, "foldersLoaded", false);
      this.useShuffle = settings.shuffleForFav;
      this.addSeparator = settings.addSeparatorForFav;
    }
    get folderHasMore() {
      return this.folderServices.some((s2) => s2.hasMore);
    }
    get hasMore() {
      return this.qs.bufferQueue.length > 0 || this.folderHasMore;
    }
    get usageInfo() {
      if (!this.foldersLoaded)
        return;
      return /* @__PURE__ */ jsx(FavUsageInfo, {
        allFavFolderServices: this.allFolderServices
      });
    }
    async loadMore() {
      if (!this.foldersLoaded)
        await this.getAllFolders();
      if (!this.hasMore)
        return;
      if (!this.useShuffle) {
        if (this.qs.bufferQueue.length) {
          return this.qs.sliceFromQueue();
        }
        const service = this.folderServices.find((s2) => s2.hasMore);
        if (!service)
          return;
        const items = await service.loadMore();
        return this.qs.doReturnItems(service.page === 1 ? [this.addSeparator && {
          api: ApiType.separator,
          uniqId: `fav-folder-${service.entry.id}`,
          content: /* @__PURE__ */ jsxs(Fragment, {
            children: ["收藏夹:", " ", /* @__PURE__ */ jsx("a", {
              target: "_blank",
              href: formatFavFolderUrl(service.entry.id),
              children: service.entry.title
            })]
          })
        }, ...items || []].filter(Boolean) : items);
      }
      if (this.qs.bufferQueue.length < _FavRecService.PAGE_SIZE) {
        while (this.folderHasMore && this.qs.bufferQueue.length < 100) {
          const restServices = this.folderServices.filter((s2) => s2.hasMore);
          const pickedServices = lodash.shuffle(restServices).slice(0, 5);
          const fetched = (await pmap2(pickedServices, async (s2) => await s2.loadMore() || [], 2)).flat();
          this.qs.bufferQueue = [...this.qs.bufferQueue, ...fetched];
        }
        this.qs.bufferQueue = lodash.shuffle(this.qs.bufferQueue);
      }
      return this.qs.sliceFromQueue();
    }
    async getAllFolders() {
      const folders = await apiFavFolderListAll();
      this.foldersLoaded = true;
      this.allFolderServices = folders.map((f2) => new FavFolderService(f2));
      this.folderServices = this.allFolderServices.filter((s2) => !settings.excludeFavFolderIds.includes(s2.entry.id.toString()));
      this.total = this.folderServices.reduce((count, f2) => count + f2.entry.media_count, 0);
    }
  };
  __publicField(_FavRecService, "PAGE_SIZE", 20);
  let FavRecService = _FavRecService;
  async function apiFavFolderListAll() {
    const res = await request.get("/x/v3/fav/folder/created/list-all", {
      params: {
        up_mid: getUid()
      }
    });
    const json = res.data;
    const folders = json.data.list;
    return folders;
  }
  class FavFolderService {
    constructor(entry) {
      __publicField(this, "entry");
      __publicField(this, "hasMore");
      __publicField(this, "info");
      __publicField(this, "page", 0);
      this.entry = entry;
      this.hasMore = entry.media_count > 0;
    }
    // pages loaded
    async loadMore() {
      if (!this.hasMore)
        return;
      const res = await request.get("/x/v3/fav/resource/list", {
        params: {
          media_id: this.entry.id,
          pn: this.page + 1,
          // start from 1
          ps: 20,
          keyword: "",
          order: "mtime",
          // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
          type: "0",
          // unkown
          tid: "0",
          // 分区
          platform: "web"
        }
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG);
        return;
      }
      this.page++;
      this.hasMore = json.data.has_more;
      this.info = json.data.info;
      let items = json.data.medias;
      items = items.filter((item) => {
        if (item.title === "已失效视频")
          return false;
        return true;
      });
      return items.map((item) => {
        var _a2;
        return {
          ...item,
          folder: this.info,
          api: ApiType.fav,
          uniqId: `fav-${(_a2 = this.info) == null ? void 0 : _a2.id}-${item.bvid}`
        };
      });
    }
  }
  var _ref$8 = {
    name: "1uu99zq",
    styles: "margin-left:15px;cursor:pointer;font-size:12px"
  };
  function FavUsageInfo({
    allFavFolderServices
  }) {
    const {
      excludeFavFolderIds,
      shuffleForFav
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = React__default.useState(false);
    const handleChange = useMemoizedFn((newTargetKeys, direction, moveKeys) => {
      setExcludeFavFolderIdsChanged(true);
      updateSettings({
        excludeFavFolderIds: newTargetKeys
      });
    });
    const foldersCount = React__default.useMemo(() => allFavFolderServices.filter((x2) => !excludeFavFolderIds.includes(x2.entry.id.toString())).length, [allFavFolderServices, excludeFavFolderIds]);
    const videosCount = React__default.useMemo(() => {
      return allFavFolderServices.filter((s2) => !excludeFavFolderIds.includes(s2.entry.id.toString())).reduce((count, s2) => count + s2.entry.media_count, 0);
    }, [allFavFolderServices, excludeFavFolderIds]);
    const onPopupOpenChange = useMemoizedFn((open) => {
      if (open) {
        setExcludeFavFolderIdsChanged(false);
      } else {
        if (excludeFavFolderIdsChanged) {
          onRefresh == null ? void 0 : onRefresh();
        }
      }
    });
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(antd.Popover, {
        trigger: "click",
        placement: "bottom",
        onOpenChange: onPopupOpenChange,
        getPopupContainer: (el) => el.parentElement || document.body,
        content: /* @__PURE__ */ jsx(Fragment, {
          children: /* @__PURE__ */ jsx(antd.Transfer, {
            dataSource: allFavFolderServices,
            rowKey: (row2) => row2.entry.id.toString(),
            titles: ["收藏夹", "忽略"],
            targetKeys: excludeFavFolderIds,
            onChange: handleChange,
            render: (item) => item.entry.title,
            oneWay: true,
            style: {
              marginBottom: 10
            }
          })
        }),
        children: /* @__PURE__ */ jsxs(antd.Tag, {
          color: "success",
          css: _ref$8,
          children: ["收藏夹(", foldersCount, ") 收藏(", videosCount, ")"]
        })
      }), /* @__PURE__ */ jsx(antd.Switch, {
        style: {
          marginLeft: 15
        },
        checkedChildren: "随机顺序",
        unCheckedChildren: "默认顺序",
        checked: shuffleForFav,
        onChange: async (checked) => {
          updateSettings({
            shuffleForFav: checked
          });
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }
      })]
    });
  }
  const _PcRecService = class _PcRecService {
    constructor() {
      __publicField(this, "page", 0);
      __publicField(this, "hasMore", true);
    }
    loadMore() {
      return this.getRecommendTimes(2);
    }
    async getRecommend(signal = void 0) {
      var _a2, _b2;
      const curpage = ++this.page;
      const res = await request.get("/x/web-interface/wbi/index/top/rcmd", {
        signal,
        params: {
          fresh_type: 3,
          version: 1,
          ps: _PcRecService.PAGE_SIZE,
          // >14 errors
          fresh_idx: curpage,
          fresh_idx_1h: curpage,
          homepage_ver: 1
        }
      });
      const json = res.data;
      if (!((_a2 = json.data) == null ? void 0 : _a2.item)) {
        toast(json.message || "API 请求没有返回结果");
      }
      const items = ((_b2 = json.data) == null ? void 0 : _b2.item) || [];
      return items;
    }
    async getRecommendTimes(times, signal = void 0) {
      let list = [];
      const parallel = async () => {
        list = (await Promise.all(new Array(times).fill(0).map(() => this.getRecommend(signal)))).flat();
      };
      await parallel();
      list = lodash.uniqBy(list, (item) => item.id);
      list.forEach((item) => {
        var _a2, _b2;
        if (((_a2 = item.rcmd_reason) == null ? void 0 : _a2.reason_type) === 1) {
          (_b2 = item.rcmd_reason).content || (_b2.content = "已关注");
        }
      });
      return list.map((item) => {
        return {
          ...item,
          uniqId: item.id + "-" + crypto.randomUUID(),
          api: "pc"
        };
      });
    }
  };
  __publicField(_PcRecService, "PAGE_SIZE", 14);
  let PcRecService = _PcRecService;
  async function modifyRelations(upMid, act) {
    const uid = getUid();
    const csrf = getCsrfToken();
    const params = new URLSearchParams({
      fid: upMid,
      act: String(act),
      re_src: "11",
      gaia_source: "web_main",
      spmid: "333.999.0.0",
      extend_content: JSON.stringify({
        entity: "user",
        entity_id: uid,
        fp: d()
      }),
      csrf
    });
    const res = await request.post("/x/relation/modify", params);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || "未知错误");
    }
    return success;
  }
  function d() {
    let t2;
    let e2;
    const i2 = (
      // @ts-ignore
      (null === (t2 = window.reportObserver) || void 0 === t2 || null === (e2 = t2.cache) || void 0 === e2 ? void 0 : e2.fpriskMsg) || {}
    );
    let n2 = "empty";
    return i2 && (n2 = i2.webdriver + "" + i2.screenResolution + "" + i2.platform + "" + i2.hardwareConcurrency + "" + i2.deviceMemory + "" + i2.colorDepth + "" + i2.indexedDb + "" + i2.language + "" + i2.openDatabase + "" + i2.touchSupport + "" + i2.userAgent), decodeURIComponent(n2);
  }
  const debug$6 = baseDebug.extend("service:user:relations:blacklist");
  const blacklistAdd = blacklistActionFactory("follow");
  const blacklistRemove = blacklistActionFactory("remove");
  const UserBlacklistService = {
    add: blacklistAdd,
    remove: blacklistRemove
  };
  const STORAGE_KEY = `${APP_NAME}-blacklist-mids`;
  const initialVaue = (localStorage.getItem(STORAGE_KEY) || "").split(",");
  const blacklistIds = proxySet(initialVaue);
  subscribe$3(blacklistIds, (val) => {
    localStorage.setItem(STORAGE_KEY, Array.from(snapshot(blacklistIds)).join(","));
  });
  function useInBlacklist(upMid) {
    const set = useSnapshot(blacklistIds);
    return upMid && set.has(upMid);
  }
  function blacklistActionFactory(action) {
    const act = action === "follow" ? 5 : 6;
    return async function blacklistAction(upMid) {
      const success = await modifyRelations(upMid, act);
      if (success) {
        if (action === "follow") {
          blacklistIds.add(upMid);
        } else if (action === "remove") {
          blacklistIds.delete(upMid);
        }
      }
      return success;
    };
  }
  async function getUserBlacklist() {
    const ps = 20;
    const getPage = async (pn) => {
      const res = await request.get("/x/relation/blacks", {
        params: {
          re_version: 0,
          ps,
          pn
        }
      });
      const json = res.data;
      if (!isWebApiSuccess(json))
        return;
      const total2 = json.data.total;
      const mids2 = json.data.list.map((x2) => x2.mid);
      return {
        total: total2,
        mids: mids2
      };
    };
    const ret = await getPage(1);
    if (!ret)
      return;
    const {
      total,
      mids = []
    } = ret;
    let blackMids = mids;
    if (total) {
      const maxPn = Math.ceil(total / ps);
      for (let pn = 2; pn <= maxPn; pn++) {
        const {
          mids: mids2 = []
        } = await getPage(pn) || {};
        blackMids = blackMids.concat(mids2);
      }
    }
    return blackMids;
  }
  (async () => {
    if (!IN_BILIBILI_HOMEPAGE)
      return;
    await whenIdle();
    const ids2 = await getUserBlacklist();
    if (ids2) {
      blacklistIds.clear();
      ids2.forEach((x2) => {
        blacklistIds.add(x2.toString());
      });
    }
    debug$6("user blocklist fetched: %o", ids2);
    return ids2;
  })();
  class PopularGeneralService {
    constructor() {
      __publicField(this, "hasMore", true);
      __publicField(this, "page", 0);
      // pages loaded
      // shuffle: boolean
      __publicField(this, "anonymous");
      this.anonymous = settings.anonymousForPopularGeneral;
    }
    async loadMore() {
      if (!this.hasMore)
        return;
      const res = await request.get("/x/web-interface/popular", {
        params: {
          ps: 20,
          pn: this.page + 1
        },
        withCredentials: !this.anonymous
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        return toast(json.message || REQUEST_FAIL_MSG), void 0;
      }
      this.page++;
      this.hasMore = !json.data.no_more;
      let items = (json.data.list || []).map((item) => {
        return {
          ...item,
          api: ApiType.popularGeneral,
          uniqId: item.bvid
        };
      });
      items = items.filter((item) => !blacklistIds.has(item.owner.mid.toString()));
      return items;
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx(PopularGeneralUsageInfo, {});
    }
  }
  function PopularGeneralUsageInfo() {
    const {
      anonymousForPopularGeneral
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    return /* @__PURE__ */ jsx(Fragment, {
      children: /* @__PURE__ */ jsx(antd.Switch, {
        style: {
          margin: "0 10px"
        },
        checked: anonymousForPopularGeneral,
        onChange: async (val) => {
          updateSettings({
            anonymousForPopularGeneral: val
          });
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        },
        checkedChildren: "匿名访问",
        unCheckedChildren: "登录访问"
      })
    });
  }
  let episodes = [];
  let cacheKey = "";
  function genCacheKey() {
    const now = dayjs();
    return [now.format("YYYYMMDD"), now.hour() < 18 ? "lt-18" : "gte-18"].join("_");
  }
  async function getEpisodeList() {
    const useCache = episodes.length && cacheKey && cacheKey === genCacheKey();
    if (useCache)
      return episodes;
    const res = await request.get("/x/web-interface/popular/series/list");
    const json = res.data;
    const list = json.data.list;
    episodes = list;
    cacheKey = genCacheKey();
    return episodes;
  }
  const _PopularWeeklyService = class _PopularWeeklyService {
    constructor() {
      __publicField(this, "episodesLoaded", false);
      __publicField(this, "episodes", []);
      __publicField(this, "id");
      __publicField(this, "useShuffle");
      // full-list = returnedItems + bufferQueue + more
      __publicField(this, "qs", new QueueStrategy(_PopularWeeklyService.PAGE_SIZE));
      this.id = _PopularWeeklyService.id++;
      this.useShuffle = settings.shuffleForPopularWeekly;
    }
    get hasMore() {
      if (!this.episodesLoaded)
        return true;
      return !!this.qs.bufferQueue.length || !!this.episodes.length;
    }
    async loadMore() {
      if (!this.episodesLoaded) {
        this.episodes = await getEpisodeList();
        this.episodesLoaded = true;
        if (this.useShuffle)
          this.episodes = lodash.shuffle(this.episodes);
      }
      if (!this.hasMore)
        return;
      if (!this.useShuffle) {
        if (this.qs.bufferQueue.length)
          return this.qs.sliceFromQueue();
        const ep = this.episodes[0];
        const epNum = ep.number;
        const items = await fetchWeeklyItems(epNum);
        this.qs.bufferQueue.push({
          api: ApiType.separator,
          uniqId: `popular-weekly-${epNum}`,
          content: /* @__PURE__ */ jsx("a", {
            target: "_blank",
            href: `https://www.bilibili.com/v/popular/weekly?num=${epNum}`,
            children: ep.name
          })
        }, ...items);
        this.episodes = this.episodes.slice(1);
        return this.qs.sliceFromQueue();
      }
      const prefetchPage = 5;
      while (this.qs.bufferQueue.length < _PopularWeeklyService.PAGE_SIZE * prefetchPage && this.episodes.length) {
        this.episodes = lodash.shuffle(this.episodes);
        const episodes2 = this.episodes.slice(0, prefetchPage);
        this.episodes = this.episodes.slice(prefetchPage);
        const fetched = await pmap2(episodes2.map((x2) => x2.number), (episodeNum) => fetchWeeklyItems(episodeNum), 2);
        this.qs.bufferQueue = lodash.shuffle([...this.qs.bufferQueue, ...fetched.flat()]);
      }
      return this.qs.sliceFromQueue();
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx(PopularWeeklyUsageInfo, {});
    }
  };
  __publicField(_PopularWeeklyService, "id", 0);
  __publicField(_PopularWeeklyService, "PAGE_SIZE", 20);
  let PopularWeeklyService = _PopularWeeklyService;
  const cache = {};
  async function fetchWeeklyItems(episodeNum) {
    var _a2;
    if (!((_a2 = cache[episodeNum]) == null ? void 0 : _a2.length)) {
      const res = await request.get("/x/web-interface/popular/series/one", {
        params: {
          number: episodeNum
        }
      });
      const json = res.data;
      const items2 = (json.data.list || []).map((item) => {
        return {
          ...item,
          api: ApiType.popularWeekly,
          uniqId: item.bvid
        };
      });
      cache[episodeNum] = items2;
    }
    let items = cache[episodeNum];
    items = items.filter((x2) => !blacklistIds.has(x2.owner.mid.toString()));
    return items;
  }
  function PopularWeeklyUsageInfo() {
    const {
      shuffleForPopularWeekly
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    return /* @__PURE__ */ jsx(Fragment, {
      children: /* @__PURE__ */ jsx(antd.Switch, {
        style: {
          marginLeft: "10px"
        },
        checked: shuffleForPopularWeekly,
        onChange: async (val) => {
          updateSettings({
            shuffleForPopularWeekly: val
          });
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        },
        checkedChildren: "随机顺序",
        unCheckedChildren: "默认顺序"
      })
    });
  }
  const watchLaterState = proxy({
    updatedAt: 0,
    bvidSet: proxySet()
  });
  function useWatchLaterState(bvid) {
    return useSnapshot(watchLaterState).bvidSet.has(bvid);
  }
  if (getHasLogined()) {
    setTimeout(() => {
      new WatchLaterRecService().loadMore();
    });
  }
  const _WatchLaterRecService = class _WatchLaterRecService {
    constructor(keepOrder) {
      __publicField(this, "qs", new QueueStrategy(_WatchLaterRecService.PAGE_SIZE));
      __publicField(this, "useShuffle");
      __publicField(this, "addSeparator");
      __publicField(this, "loaded", false);
      __publicField(this, "count", 0);
      __publicField(this, "keepOrder");
      this.keepOrder = keepOrder ?? false;
      this.useShuffle = settings.shuffleForWatchLater;
      this.addSeparator = settings.addSeparatorForWatchLater;
    }
    async fetch() {
      const res = await request.get("/x/v2/history/toview/web");
      const json = res.data;
      const items = json.data.list.map((item) => {
        return {
          ...item,
          api: ApiType.watchlater,
          uniqId: `watchlater-${item.bvid}`
        };
      });
      if (Date.now() > watchLaterState.updatedAt) {
        watchLaterState.updatedAt = Date.now();
        watchLaterState.bvidSet = proxySet(items.map((i2) => i2.bvid));
      }
      const gate = dayjs().subtract(2, "days").unix();
      const firstNotTodayAddedIndex = items.findIndex((item) => item.add_at < gate);
      let itemsWithSeparator = items;
      if (firstNotTodayAddedIndex !== -1) {
        const recent = items.slice(0, firstNotTodayAddedIndex);
        let earlier = items.slice(firstNotTodayAddedIndex);
        if (this.keepOrder && _WatchLaterRecService.LAST_BVID_ARR.length) {
          earlier = earlier.map((item) => ({
            item,
            // if not found, -1, front-most
            index: _WatchLaterRecService.LAST_BVID_ARR.findIndex((bvid) => item.bvid === bvid)
          })).sort((a2, b2) => a2.index - b2.index).map((x2) => x2.item);
        } else if (this.useShuffle) {
          earlier = lodash.shuffle(earlier);
        }
        itemsWithSeparator = [!!recent.length && this.addSeparator && {
          api: ApiType.separator,
          uniqId: "watchlater-recent",
          content: "近期"
        }, ...recent, !!earlier.length && this.addSeparator && {
          api: ApiType.separator,
          uniqId: "watchlater-earlier",
          content: "更早"
        }, ...earlier].filter(Boolean);
      }
      this.count = json.data.count;
      _WatchLaterRecService.LAST_BVID_ARR = itemsWithSeparator.map((item) => item.api === ApiType.watchlater && item.bvid).filter(Boolean);
      return itemsWithSeparator;
    }
    get usageInfo() {
      if (!this.loaded)
        return;
      const {
        count
      } = this;
      return /* @__PURE__ */ jsx(WatchLaterUsageInfo, {
        count
      });
    }
    get hasMore() {
      if (!this.loaded)
        return true;
      return !!this.qs.bufferQueue.length;
    }
    async loadMore() {
      if (!this.hasMore)
        return;
      if (!this.loaded) {
        const items = await this.fetch();
        this.qs.bufferQueue.push(...items);
        this.loaded = true;
      }
      return this.qs.sliceFromQueue();
    }
  };
  __publicField(_WatchLaterRecService, "PAGE_SIZE", 20);
  __publicField(_WatchLaterRecService, "LAST_BVID_ARR", []);
  let WatchLaterRecService = _WatchLaterRecService;
  function WatchLaterUsageInfo({
    count
  }) {
    const color = count <= 90 ? "success" : count < 100 ? "warning" : "error";
    const title = `${color !== "success" ? "快满了~ " : ""}已使用 ${count} / 100`;
    const {
      shuffleForWatchLater
    } = useSettingsSnapshot();
    const onRefresh = useOnRefreshContext();
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs(antd.Tag, {
        color,
        style: {
          marginLeft: 20,
          marginRight: 0,
          marginTop: 1,
          cursor: "pointer"
        },
        title,
        onClick: () => {
          toast(`稍后再看: ${title}`);
        },
        children: [count, " / 100"]
      }), /* @__PURE__ */ jsx(antd.Switch, {
        style: {
          marginLeft: 15
        },
        checkedChildren: "随机顺序",
        unCheckedChildren: "添加顺序",
        checked: shuffleForWatchLater,
        onChange: async (checked) => {
          updateSettings({
            shuffleForWatchLater: checked
          });
          await delay(100);
          onRefresh == null ? void 0 : onRefresh();
        }
      })]
    });
  }
  const OnRefreshContext = React__default.createContext(void 0);
  function useOnRefreshContext() {
    return React__default.useContext(OnRefreshContext);
  }
  const serviceFactories = {
    "dynamic-feed": () => new DynamicFeedRecService(dynamicFeedFilterStore.upMid),
    "watchlater": (options) => new WatchLaterRecService(options == null ? void 0 : options.watchlaterKeepOrder),
    "fav": () => new FavRecService(),
    "popular-general": () => new PopularGeneralService(),
    "popular-weekly": () => new PopularWeeklyService()
  };
  function getIService(serviceMap, tab2) {
    return serviceMap[tab2];
  }
  function useRefresh({
    debug: debug2,
    // tab,
    recreateService,
    fetcher,
    preAction,
    postAction,
    // RecGrid 定制
    onScrollToTop,
    setUpperRefreshing
  }) {
    const tab2 = getCurrentSourceTab();
    const itemsCache = useRefInit(() => ({}));
    const itemsHasCache = useRefInit(() => ({}));
    const [hasMore, setHasMore] = React__default.useState(true);
    const [items, setItems] = React__default.useState([]);
    React__default.useEffect(() => {
      try {
        ;
        unsafeWindow[`${APP_KEY_PREFIX}_gridItems`] = items;
      } catch (e2) {
      }
    }, [items]);
    const [serviceMap, setServiceMap] = React__default.useState(() => {
      return Object.fromEntries(Object.entries(serviceFactories).map(([key2, factory]) => [key2, factory(void 0)]));
    });
    const [pcRecService, setPcRecService] = React__default.useState(() => new PcRecService());
    const [refreshing, setRefreshing] = React__default.useState(false);
    const [refreshedAt, setRefreshedAt, getRefreshedAt] = useGetState(() => Date.now());
    const [refreshFor, setRefreshFor] = React__default.useState(tab2);
    const [refreshAbortController, setRefreshAbortController] = React__default.useState(() => new AbortController());
    const [swr, setSwr] = React__default.useState(false);
    const [error, setError] = React__default.useState(void 0);
    const refresh = useMemoizedFn(async (reuse = false, options) => {
      const start = performance.now();
      if (refreshing) {
        if (tab2 === refreshFor) {
          debug2("refresh(): [start] [refreshing] prevent same tab(%s) refresh()", tab2);
          return;
        } else {
          debug2("refresh(): [start] [refreshing] switchTab %s -> %s, abort existing", refreshFor, tab2);
          refreshAbortController.abort();
        }
      } else {
        debug2("refresh(): [start] tab = %s", tab2);
      }
      await (onScrollToTop == null ? void 0 : onScrollToTop());
      const updateRefreshing = (val) => {
        setRefreshing(val);
        setUpperRefreshing == null ? void 0 : setUpperRefreshing(val);
      };
      updateRefreshing(true);
      setRefreshedAt(Date.now());
      setRefreshFor(tab2);
      setItems([]);
      setError(void 0);
      setHasMore(true);
      await (preAction == null ? void 0 : preAction());
      let _items = [];
      let err;
      const doFetch = async () => {
        try {
          _items = await fetcher(fetcherOptions);
        } catch (e2) {
          err = e2;
        }
      };
      const shouldReuse = reuse && !!itemsHasCache.current[tab2];
      const swr2 = shouldReuse && (!!TabConfigMap[tab2].swr || tab2 === "fav" && !serviceMap.fav.useShuffle && !settings.shuffleForFav || tab2 === "popular-weekly" && !serviceMap["popular-weekly"].useShuffle && !settings.shuffleForPopularWeekly);
      setSwr(shouldReuse);
      let useGridCache = true;
      if ((tab2 === "fav" || tab2 === "popular-weekly") && !swr2) {
        useGridCache = false;
      }
      const _pcRecService = recreateService ? new PcRecService() : pcRecService;
      if (recreateService) {
        setPcRecService(_pcRecService);
      }
      const newServiceMap = {
        ...serviceMap
      };
      const recreateFor = (tab22) => {
        newServiceMap[tab22] = serviceFactories[tab22](options);
        setServiceMap(newServiceMap);
      };
      if (tab2 === "dynamic-feed") {
        recreateFor(tab2);
      }
      if (tab2 === "watchlater") {
        recreateFor(tab2);
      }
      if (tab2 === "fav") {
        if (shouldReuse) {
          if (swr2) {
            recreateFor(tab2);
          } else {
            serviceMap.fav.qs.restore();
          }
        } else {
          recreateFor(tab2);
        }
      }
      if (tab2 === "popular-general") {
        recreateFor(tab2);
      }
      if (tab2 === "popular-weekly") {
        if (shouldReuse) {
          if (swr2) {
            recreateFor(tab2);
          } else {
            serviceMap["popular-weekly"].qs.restore();
          }
        } else {
          recreateFor(tab2);
        }
      }
      const _abortController = new AbortController();
      const _signal = _abortController.signal;
      setRefreshAbortController(_abortController);
      const fetcherOptions = {
        tab: tab2,
        abortSignal: _signal,
        serviceMap: newServiceMap,
        pcRecService: _pcRecService
      };
      debug2("refresh(): shouldReuse=%s swr=%s useGridCache=%s", shouldReuse, swr2, useGridCache);
      if (shouldReuse) {
        if (swr2) {
          _items = itemsCache.current[tab2] || [];
          setItems(_items);
          await doFetch();
        } else if (!useGridCache) {
          itemsCache.current[tab2] = [];
          await doFetch();
        } else {
          _items = itemsCache.current[tab2] || [];
        }
      } else {
        itemsCache.current[tab2] = [];
        await doFetch();
      }
      if (_signal.aborted) {
        debug2("refresh(): [legacy] skip setItems/err for aborted, legacy tab = %s", tab2);
        return;
      }
      if (err) {
        updateRefreshing(false);
        console.error(err);
        setError(err);
        return;
      }
      if (_items.length) {
        itemsHasCache.current[tab2] = true;
        if (TabConfigMap[tab2].swr || tab2 === "fav" || tab2 === "popular-weekly") {
          itemsCache.current[tab2] = _items.slice(0, 30);
        } else {
          itemsCache.current[tab2] = _items;
        }
      }
      await whenIdle({
        timeout: 400
      });
      if (_signal.aborted) {
        debug2("refresh(): [legacy] skip setItems-postAction etc for aborted, legacy tab = %s", tab2);
        return;
      }
      setItems(_items);
      const service = getIService(newServiceMap, tab2);
      if (service)
        setHasMore(service.hasMore);
      await nextTick();
      await (postAction == null ? void 0 : postAction());
      const cost = performance.now() - start;
      debug2("refresh(): [success] cost %s ms", cost.toFixed(0));
      updateRefreshing(false);
    });
    return {
      items,
      itemsCache,
      setItems,
      error,
      refreshedAt,
      setRefreshedAt,
      getRefreshedAt,
      refreshing,
      setRefreshing,
      refreshFor,
      setRefreshFor,
      refreshAbortController,
      setRefreshAbortController,
      hasMore,
      setHasMore,
      swr,
      setSwr,
      pcRecService,
      serviceMap,
      setPcRecService,
      setServiceMap,
      refresh
    };
  }
  async function getRecentUpdateUpList() {
    const res = await request.get("/x/polymer/web-dynamic/v1/portal");
    const json = res.data;
    const list = (json == null ? void 0 : json.data.up_list) || [];
    return list;
  }
  class DynamicFeedRecService {
    constructor(upMid) {
      __publicField(this, "offset", "");
      __publicField(this, "page", 0);
      // pages loaded
      __publicField(this, "hasMore", true);
      __publicField(this, "upMid");
      this.upMid = upMid;
    }
    async loadMore(signal = void 0) {
      if (!this.hasMore) {
        return;
      }
      const params = {
        timezone_offset: "-480",
        type: "video",
        features: "itemOpusStyle",
        page: this.page + 1
        // ++this.page, starts from 1
      };
      if (this.offset) {
        params.offset = this.offset;
      }
      if (this.upMid) {
        params.host_mid = this.upMid;
      }
      const res = await request.get("/x/polymer/web-dynamic/v1/feed/all", {
        signal,
        params
      });
      const json = res.data;
      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG);
        return;
      }
      this.page++;
      this.hasMore = json.data.has_more;
      this.offset = json.data.offset;
      const arr = json.data.items;
      const items = arr.filter((x2) => x2.type === "DYNAMIC_TYPE_AV").map((item) => {
        return {
          ...item,
          api: ApiType.dynamic,
          uniqId: item.id_str || crypto.randomUUID()
        };
      });
      return items;
    }
    get usageInfo() {
      return /* @__PURE__ */ jsx(DynamicFeedUsageInfo, {});
    }
  }
  __publicField(DynamicFeedRecService, "PAGE_SIZE", 15);
  const hash = location.hash;
  let upMidInitial = void 0;
  let upNameInitial = void 0;
  if (hash.includes("?")) {
    const queryInHash = location.hash.slice(location.hash.indexOf("?"));
    const searchParams = new URLSearchParams(queryInHash);
    if (searchParams.get("dyn-mid")) {
      upMidInitial = Number(searchParams.get("dyn-mid"));
      upNameInitial = searchParams.get("dyn-mid") ?? void 0;
    }
  }
  const dynamicFeedFilterStore = proxy({
    upMid: upMidInitial,
    upName: upNameInitial,
    upList: [],
    upListUpdatedAt: 0
  });
  setTimeout(() => {
    if (!IN_BILIBILI_HOMEPAGE)
      return;
    if (!dynamicFeedFilterStore.upList.length) {
      requestIdleCallback(() => {
        updateUpList();
      });
    }
  }, ms$1("5s"));
  async function updateUpList(force = false) {
    const cacheHit = !force && dynamicFeedFilterStore.upList.length && dynamicFeedFilterStore.upListUpdatedAt && dynamicFeedFilterStore.upListUpdatedAt - Date.now() < ms$1("5min");
    if (cacheHit)
      return;
    const list = await getRecentUpdateUpList();
    dynamicFeedFilterStore.upList = list;
    dynamicFeedFilterStore.upListUpdatedAt = Date.now();
  }
  function dynamicFeedFilterSelectUp(payload) {
    Object.assign(dynamicFeedFilterStore, payload);
    if (payload.upMid) {
      const item = dynamicFeedFilterStore.upList.find((x2) => x2.mid === payload.upMid);
      if (item)
        item.has_update = false;
    }
  }
  var _ref$7 = {
    name: "dhit8z",
    styles: "margin-left:15px"
  };
  var _ref2$7 = {
    name: "1mkc8b8",
    styles: "display:block;max-width:130px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden"
  };
  function DynamicFeedUsageInfo() {
    const onRefresh = useOnRefreshContext();
    const {
      upName,
      upList
    } = useSnapshot(dynamicFeedFilterStore);
    useMount$1(() => {
      updateUpList();
    });
    const onSelect = useMemoizedFn(async (payload) => {
      dynamicFeedFilterSelectUp(payload);
      await delay(100);
      onRefresh == null ? void 0 : onRefresh();
    });
    const onClear = useMemoizedFn(() => {
      onSelect({
        upMid: void 0,
        upName: void 0
      });
    });
    const menuItems = React__default.useMemo(() => {
      const itemAll = {
        key: "all",
        icon: /* @__PURE__ */ jsx(antd.Avatar, {
          size: "small",
          children: "全"
        }),
        label: "全部",
        onClick: onClear
      };
      const items = upList.map((up) => {
        let avatar = /* @__PURE__ */ jsx(antd.Avatar, {
          size: "small",
          src: up.face
        });
        if (up.has_update) {
          avatar = /* @__PURE__ */ jsx(antd.Badge, {
            dot: true,
            children: avatar
          });
        }
        return {
          key: up.mid,
          icon: avatar,
          // label: up.uname,
          label: /* @__PURE__ */ jsx("span", {
            title: up.uname,
            css: _ref2$7,
            children: up.uname
          }),
          onClick() {
            onSelect({
              upMid: up.mid,
              upName: up.uname
            });
          }
        };
      });
      return [itemAll, ...items];
    }, [upList, upList.map((x2) => !!x2.has_update)]);
    return /* @__PURE__ */ jsx("div", {
      css: _ref$7,
      children: /* @__PURE__ */ jsxs(antd.Space, {
        children: [/* @__PURE__ */ jsx(antd.Dropdown, {
          placement: "bottomLeft",
          menu: {
            items: menuItems,
            style: {
              maxHeight: "50vh",
              overflowY: "scroll"
            }
          },
          children: /* @__PURE__ */ jsx(antd.Button, {
            children: upName ? `UP: ${upName}` : "全部"
          })
        }), !!upName && /* @__PURE__ */ jsxs(antd.Button, {
          onClick: onClear,
          css: [flexCenterStyle, "", ""],
          children: [/* @__PURE__ */ jsx(IconPark, {
            name: "Return",
            size: 14,
            style: {
              marginRight: 5
            }
          }), /* @__PURE__ */ jsx("span", {
            css: antdBtnTextStyle,
            children: "清除"
          })]
        })]
      })
    });
  }
  const UserFavService = {
    removeFav,
    addFav,
    getVideoFavState
  };
  async function removeFav(folderId, resource) {
    const form = new URLSearchParams({
      resources: resource,
      media_id: folderId.toString(),
      platform: "web",
      csrf: getCsrfToken()
    });
    const res = await request.post("/x/v3/fav/resource/batch-del", form);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast(json.message || OPERATION_FAIL_MSG);
    }
    return success;
  }
  async function getVideoFavState(avid) {
    if (!getHasLogined())
      return;
    const res = await request.get("/x/v3/fav/folder/created/list-all", {
      params: {
        up_mid: getUid(),
        type: 2,
        rid: avid
      }
    });
    const json = res.data;
    const favFolders = json.data.list.filter((folder) => folder.fav_state > 0);
    const favFolderNames = favFolders.map((f2) => f2.title);
    const favFolderUrls = favFolders.map((f2) => formatFavFolderUrl(f2.id));
    return {
      favFolders,
      favFolderNames,
      favFolderUrls
    };
  }
  async function favDeal({
    avid,
    add_media_ids = "",
    del_media_ids = ""
  }) {
    const form = new URLSearchParams({
      rid: avid.toString(),
      type: "2",
      add_media_ids,
      del_media_ids,
      platform: "web",
      eab_x: "2",
      ramval: "0",
      ga: "1",
      gaia_source: "web_normal",
      csrf: getCsrfToken()
    });
    const res = await request.post("/x/v3/fav/resource/deal", form);
    const json = res.data;
    const success = isWebApiSuccess(json);
    if (!success) {
      toast((json == null ? void 0 : json.message) || "fav deal api fail");
    }
    return success;
  }
  let defaultFavFolderId = 0;
  let defaultFavFolderName = "";
  async function addFav(avid) {
    if (!defaultFavFolderId || !defaultFavFolderName) {
      const folders = await apiFavFolderListAll();
      defaultFavFolderId = folders[0].id;
      defaultFavFolderName = folders[0].title;
    }
    return await favDeal({
      avid,
      add_media_ids: defaultFavFolderId.toString()
    });
  }
  const follow = followActionFactory("follow");
  const unfollow = followActionFactory("unfollow");
  const UserfollowService = {
    follow,
    unfollow
  };
  function followActionFactory(action) {
    const act = action === "follow" ? 1 : 2;
    return async function followAction(upMid) {
      const success = await modifyRelations(upMid, act);
      return success;
    };
  }
  const biliVideoCard = "_bili-video-card_1ox5o_1";
  const previewCardWrapper = "_preview-card-wrapper_1ox5o_8";
  const previewCardInner = "_preview-card-inner_1ox5o_21";
  const btnDislike = "_btn-dislike_1ox5o_26";
  const btnDislikeIcon = "_btn-dislike-icon_1ox5o_41";
  const btnDislikeTip = "_btn-dislike-tip_1ox5o_48";
  const watchLater = "_watch-later_1ox5o_64";
  const watchLaterIcon = "_watch-later-icon_1ox5o_79";
  const watchLaterTip = "_watch-later-tip_1ox5o_86";
  const badge = "_badge_1ox5o_102";
  const recommendReason = "_recommend-reason_1ox5o_112";
  const bangumiDesc = "_bangumi-desc_1ox5o_128";
  const dislikedWrapper = "_disliked-wrapper_1ox5o_132";
  const dislikeContentCover = "_dislike-content-cover_1ox5o_146";
  const dislikeContentCoverInner = "_dislike-content-cover-inner_1ox5o_152";
  const dislikeIcon = "_dislike-icon_1ox5o_163";
  const dislikeReason = "_dislike-reason_1ox5o_166";
  const dislikeDesc = "_dislike-desc_1ox5o_170";
  const dislikeContentAction = "_dislike-content-action_1ox5o_174";
  const skeletonActive = "_skeleton-active_1ox5o_206";
  const antSkeletonLoading = "_ant-skeleton-loading_1ox5o_1";
  const styles$2 = {
    biliVideoCard,
    previewCardWrapper,
    previewCardInner,
    btnDislike,
    btnDislikeIcon,
    btnDislikeTip,
    watchLater,
    watchLaterIcon,
    watchLaterTip,
    badge,
    recommendReason,
    bangumiDesc,
    dislikedWrapper,
    dislikeContentCover,
    dislikeContentCoverInner,
    dislikeIcon,
    dislikeReason,
    dislikeDesc,
    dislikeContentAction,
    skeletonActive,
    antSkeletonLoading
  };
  function fallbackWhenNan(...args) {
    for (const num of args) {
      if (isNaN(num))
        continue;
      return num;
    }
    return 0;
  }
  function PreviewImage({
    className,
    videoDuration,
    pvideo,
    mouseEnterRelativeX,
    previewAnimationProgress
  }) {
    const ref = React__default.useRef(null);
    const cursorState = useMouse(ref);
    const [size, setSize] = React__default.useState(() => ({
      width: 0,
      height: 0
    }));
    useMount$1(() => {
      var _a2;
      const rect = (_a2 = ref.current) == null ? void 0 : _a2.getBoundingClientRect();
      if (!rect)
        return;
      setSize({
        width: rect.width,
        height: rect.height
      });
    });
    let progress = 0;
    if (typeof previewAnimationProgress === "number") {
      progress = previewAnimationProgress;
    } else {
      const relativeX = fallbackWhenNan(cursorState.elementX, mouseEnterRelativeX || 0);
      if (size.width && relativeX && !isNaN(relativeX)) {
        progress = relativeX / size.width;
        if (progress < 0)
          progress = 0;
        if (progress > 1)
          progress = 1;
      }
    }
    const innerProps = {
      videoDuration,
      pvideo,
      elWidth: size.width,
      elHeight: size.height,
      progress
    };
    return /* @__PURE__ */ jsx("div", {
      ref,
      className: cx(styles$2.previewCardWrapper, className),
      children: !!(pvideo && size.width && size.height && progress) && /* @__PURE__ */ jsx(PreviewImageInner, {
        ...innerProps
      })
    });
  }
  function PreviewImageInner({
    videoDuration,
    pvideo,
    elWidth,
    elHeight,
    progress
  }) {
    var _a2;
    const t2 = Math.floor((videoDuration || 0) * progress);
    let index = React__default.useMemo(() => {
      const arr = (pvideo == null ? void 0 : pvideo.index) || [];
      let index2 = findIndex(arr, t2);
      if (index2 !== -1) {
        return index2;
      }
      if (t2 > arr[arr.length - 1]) {
        index2 = Math.floor(arr.length * progress) - 1;
        if (index2 < 0)
          index2 = 0;
        return index2;
      }
      return 0;
    }, [pvideo, t2]);
    const {
      img_x_len: colCount,
      img_y_len: rowCount,
      img_x_size: w2,
      img_y_size: h2
    } = pvideo;
    const countPerPreview = rowCount * colCount;
    index = index + 1;
    const snapshotIndex = Math.floor(index / countPerPreview);
    const indexInSnapshot = index - snapshotIndex * countPerPreview;
    const snapshotUrl = ((_a2 = pvideo.image) == null ? void 0 : _a2[snapshotIndex]) || "";
    const indexRow = Math.floor(indexInSnapshot / colCount) + 1;
    const indexCol = indexInSnapshot - (indexRow - 1) * colCount;
    const newImgWidth = elWidth * colCount;
    const newImgHeight = elHeight * rowCount;
    const startY = (indexRow - 1) * elHeight;
    const startX = (indexCol - 1) * elWidth;
    return /* @__PURE__ */ jsx("div", {
      className: styles$2.previewCardInner,
      style: {
        backgroundColor: "black",
        // 防止加载过程中闪屏
        backgroundImage: `url(${snapshotUrl})`,
        backgroundPosition: `-${startX}px -${startY}px`,
        backgroundSize: `${newImgWidth}px ${newImgHeight}px`
      },
      children: /* @__PURE__ */ jsx(SimplePregressBar, {
        progress
      })
    });
  }
  function SimplePregressBar({
    progress
  }) {
    return /* @__PURE__ */ jsx("div", {
      className: "track",
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: "#eee",
        width: "100%",
        height: 2
      },
      children: /* @__PURE__ */ jsx("div", {
        className: "bar",
        style: {
          backgroundColor: colorPrimaryValue,
          height: "100%",
          width: `${progress * 100}%`
        }
      })
    });
  }
  function findIndex(arr, target) {
    let l2 = 0;
    let r2 = arr.length - 1;
    let possible = -1;
    while (l2 <= r2) {
      const mid = Math.floor((l2 + r2) / 2);
      const mv = arr[mid];
      if (target === mv) {
        return mid;
      }
      if (mv < target) {
        l2 = mid + 1;
        possible = mid;
      } else {
        r2 = mid - 1;
      }
    }
    if (possible === -1)
      return -1;
    const v2 = arr[possible];
    const v1 = arr[possible + 1] ?? 0;
    if (v2 < target && target < v1) {
      return possible;
    } else {
      return -1;
    }
  }
  const AppRecIconSvgNameMap = {
    play: "#widget-video-play-count",
    // or #widget-play-count
    danmaku: "#widget-video-danmaku",
    like: "#widget-agree",
    bangumiFollow: "#widget-followed",
    favorite: "#widget-favorite",
    coin: "#widget-coin"
  };
  const AppRecIconMap = {
    1: "play",
    2: "like",
    // 没出现过, 猜的
    3: "danmaku",
    4: "bangumiFollow",
    // 追番
    20: "like"
    // 动态点赞
  };
  const AppRecIconScaleMap = {
    bangumiFollow: 1.3,
    favorite: 0.9
  };
  function getField(id) {
    return AppRecIconMap[id] || AppRecIconMap[1];
  }
  const borderRadiusIdentifier = "--video-card-border-radius";
  const borderRadiusValue = `var(${borderRadiusIdentifier})`;
  const borderRadiusStyle = {
    borderRadius: borderRadiusValue
  };
  const STAT_NUMBER_FALLBACK = "0";
  const PLAYER_SCREEN_MODE = "player-screen-mode";
  var PlayerScreenMode = /* @__PURE__ */ ((PlayerScreenMode2) => {
    PlayerScreenMode2["Normal"] = "normal";
    PlayerScreenMode2["Wide"] = "wide";
    PlayerScreenMode2["WebFullscreen"] = "web";
    PlayerScreenMode2["Fullscreen"] = "full";
    return PlayerScreenMode2;
  })(PlayerScreenMode || {});
  var _BvCode = class _BvCode2 {
    static av2bv(av) {
      const x_ = (av ^ this.XOR) + this.ADD;
      const r2 = ["B", "V", "1", , , "4", , "1", , "7"];
      for (let i2 = 0; i2 < 6; i2++) {
        r2[this.S[i2]] = this.TABEL[Math.floor(x_ / 58 ** i2) % 58];
      }
      return r2.join("");
    }
    static bv2av(bv) {
      let r2 = 0;
      for (let i2 = 0; i2 < 6; i2++) {
        r2 += this.TR[bv[this.S[i2]]] * 58 ** i2;
      }
      return r2 - this.ADD ^ this.XOR;
    }
  };
  _BvCode.TABEL = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
  _BvCode.TR = {};
  _BvCode.S = [11, 10, 3, 8, 4, 6];
  _BvCode.XOR = 177451812;
  _BvCode.ADD = 8728348608;
  (() => {
    const len = _BvCode.TABEL.length;
    for (let i2 = 0; i2 < len; i2++) {
      _BvCode.TR[_BvCode.TABEL[i2]] = i2;
    }
  })();
  var BvCode = _BvCode;
  BvCode.av2bv.bind(BvCode);
  BvCode.bv2av.bind(BvCode);
  function lookinto(item, opts) {
    if (item.api === "pc")
      return opts.pc(item);
    if (item.api === "app")
      return opts.app(item);
    if (item.api === "dynamic")
      return opts.dynamic(item);
    if (item.api === "watchlater")
      return opts.watchlater(item);
    if (item.api === "fav")
      return opts.fav(item);
    if (item.api === "popular-general")
      return opts["popular-general"](item);
    if (item.api === "popular-weekly")
      return opts["popular-weekly"](item);
    throw new Error(`unknown api type`);
  }
  function normalizeCardData(item) {
    const ret = lookinto(item, {
      "pc": apiPcAdapter,
      "app": apiAppAdapter,
      "dynamic": apiDynamicAdapter,
      "watchlater": apiWatchLaterAdapter,
      "fav": apiFavAdapter,
      "popular-general": apiPopularGeneralAdapter,
      "popular-weekly": apiPopularWeeklyAdapter
    });
    if (ret.authorFace)
      ret.authorFace = toHttps(ret.authorFace);
    ret.cover = toHttps(ret.cover);
    return ret;
  }
  function apiAppAdapter(item) {
    return item.device === "android" ? apiAndroidAppAdapter(item) : apiIpadAppAdapter(item);
  }
  function apiAndroidAppAdapter(item) {
    var _a2, _b2, _c;
    const extractCountFor = (target) => {
      const {
        cover_left_icon_1,
        cover_left_text_1,
        cover_left_icon_2,
        cover_left_text_2
      } = item;
      if (cover_left_icon_1 && AppRecIconMap[cover_left_icon_1] === target) {
        return parseCount(cover_left_text_1);
      }
      if (cover_left_icon_2 && AppRecIconMap[cover_left_icon_2] === target) {
        return parseCount(cover_left_text_2);
      }
    };
    const avid = item.param;
    const bvid = BvCode.av2bv(Number(item.param));
    const href = (() => {
      var _a3;
      if (item.uri.startsWith("http://") || item.uri.startsWith("https://")) {
        return item.uri;
      }
      if (item.goto === "av") {
        return `/video/${bvid}/`;
      }
      if (item.goto === "bangumi") {
        console.warn(`[${APP_NAME}]: bangumi uri should not starts with 'bilibili://': %s`, item.uri);
        return item.uri;
      }
      if (item.goto === "picture") {
        const id = (_a3 = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)) == null ? void 0 : _a3[1];
        if (id)
          return `/read/cv${id}`;
        return item.uri;
      }
      return item.uri;
    })();
    return {
      // video
      avid,
      bvid,
      goto: item.goto,
      href,
      title: item.title,
      cover: item.cover,
      pubts: void 0,
      pubdateDisplay: void 0,
      duration: ((_a2 = item.player_args) == null ? void 0 : _a2.duration) || 0,
      durationStr: formatDuration((_b2 = item.player_args) == null ? void 0 : _b2.duration),
      recommendReason: item.rcmd_reason,
      // stat
      play: extractCountFor("play"),
      like: void 0,
      coin: void 0,
      danmaku: extractCountFor("danmaku"),
      favorite: void 0,
      bangumiFollow: extractCountFor("bangumiFollow"),
      // e.g 2023-09-17
      // cover_left_1_content_description: "156点赞"
      // cover_left_icon_1: 20
      // cover_left_text_1: "156"
      statItems: [item.cover_left_text_1 && {
        field: getField(item.cover_left_icon_1),
        value: item.cover_left_text_1
      }, item.cover_left_text_2 && {
        field: getField(item.cover_left_icon_2),
        value: item.cover_left_text_2
      }].filter(Boolean),
      // author
      authorName: item.args.up_name,
      authorFace: void 0,
      authorMid: String(item.args.up_id),
      appBadge: item.badge,
      appBadgeDesc: ((_c = item.desc_button) == null ? void 0 : _c.text) || item.desc || ""
    };
  }
  function apiIpadAppAdapter(item) {
    var _a2, _b2;
    const extractCountFor = (target) => {
      const {
        cover_left_text_1,
        cover_left_text_2,
        cover_left_text_3
      } = item;
      const arr = [cover_left_text_1, cover_left_text_2, cover_left_text_3].filter(Boolean);
      if (target === "play") {
        const text = arr.find((text2) => /观看|播放$/.test(text2));
        if (!text)
          return;
        const rest = text.replace(/观看|播放$/, "");
        return parseCount(rest);
      }
      if (target === "danmaku") {
        const text = arr.find((text2) => /弹幕$/.test(text2));
        if (!text)
          return;
        const rest = text.replace(/弹幕$/, "");
        return parseCount(rest);
      }
      if (target === "bangumiFollow") {
        const text = arr.find((text2) => /追[剧番]$/.test(text2));
        if (!text)
          return;
        const rest = text.replace(/追[剧番]$/, "");
        return parseCount(rest);
      }
    };
    const avid = item.param;
    const bvid = item.bvid || BvCode.av2bv(Number(item.param));
    const href = (() => {
      var _a3;
      if (item.uri.startsWith("http://") || item.uri.startsWith("https://")) {
        return item.uri;
      }
      if (item.goto === "av") {
        return `/video/${bvid}/`;
      }
      if (item.goto === "bangumi") {
        console.warn(`[${APP_NAME}]: bangumi uri should not starts with 'bilibili://': %s`, item.uri);
        return item.uri;
      }
      if (item.goto === "picture") {
        const id = (_a3 = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)) == null ? void 0 : _a3[1];
        if (id)
          return `/read/cv${id}`;
        return item.uri;
      }
      return item.uri;
    })();
    const play = extractCountFor("play");
    const like = void 0;
    const coin = void 0;
    const danmaku = extractCountFor("danmaku");
    const favorite = void 0;
    const bangumiFollow = extractCountFor("bangumiFollow");
    const statItems = [{
      field: "play",
      value: formatCount(play) || STAT_NUMBER_FALLBACK
    }, typeof danmaku === "number" ? {
      field: "danmaku",
      value: formatCount(danmaku) || STAT_NUMBER_FALLBACK
    } : {
      field: "bangumiFollow",
      value: formatCount(bangumiFollow) || STAT_NUMBER_FALLBACK
    }];
    return {
      // video
      avid,
      bvid,
      goto: item.goto,
      href,
      title: item.title,
      desc: item.desc,
      cover: item.cover,
      pubts: void 0,
      pubdateDisplay: void 0,
      duration: ((_a2 = item.player_args) == null ? void 0 : _a2.duration) || 0,
      durationStr: formatDuration((_b2 = item.player_args) == null ? void 0 : _b2.duration),
      recommendReason: item.bottom_rcmd_reason || item.top_rcmd_reason,
      // TODO: top_rcmd_reason
      // stat
      play,
      like,
      coin,
      danmaku,
      favorite,
      bangumiFollow,
      statItems,
      // author
      authorName: item.args.up_name,
      authorFace: item.avatar.cover,
      authorMid: String(item.args.up_id || ""),
      appBadge: item.cover_badge,
      appBadgeDesc: item.desc
    };
  }
  function apiPcAdapter(item) {
    var _a2;
    return {
      // video
      avid: String(item.id),
      bvid: item.bvid,
      goto: item.goto,
      href: item.goto === "av" ? `/video/${item.bvid}/` : item.uri,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: (_a2 = item.rcmd_reason) == null ? void 0 : _a2.content,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [{
        field: "play",
        value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK
      }, {
        field: "like",
        value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiDynamicAdapter(item) {
    const v2 = item.modules.module_dynamic.major.archive;
    const author = item.modules.module_author;
    const oneDayAgo = dayjs().subtract(2, "days").unix();
    const pubdateDisplay = (() => {
      const ts = author.pub_ts;
      if (ts > oneDayAgo) {
        return author.pub_time;
      } else {
        return formatTimeStamp(ts);
      }
    })();
    return {
      // video
      avid: v2.aid,
      bvid: v2.bvid,
      goto: "av",
      href: `/video/${v2.bvid}/`,
      title: v2.title,
      cover: v2.cover,
      pubts: author.pub_ts,
      pubdateDisplay,
      duration: parseDuration(v2.duration_text) || 0,
      durationStr: v2.duration_text,
      recommendReason: v2.badge.text,
      // stat
      play: parseCount(v2.stat.play),
      danmaku: parseCount(v2.stat.danmaku),
      like: void 0,
      coin: void 0,
      favorite: void 0,
      // author
      authorName: author.name,
      authorFace: author.face,
      authorMid: author.mid.toString()
    };
  }
  function apiWatchLaterAdapter(item) {
    const invalidReason = getVideoInvalidReason(item.state);
    const title = `${item.viewed ? "【已观看】· " : ""}${item.title}`;
    const titleRender = invalidReason ? /* @__PURE__ */ jsx(AntdTooltip, {
      title: /* @__PURE__ */ jsxs(Fragment, {
        children: ["视频已失效, 原因: ", invalidReason]
      }),
      align: {
        offset: [0, -5]
      },
      placement: "topLeft",
      children: /* @__PURE__ */ jsxs("del", {
        children: [item.viewed ? "【已观看】· " : "", item.title, "`"]
      })
    }) : void 0;
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: item.uri,
      title,
      titleRender,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      pubdateDisplayTitle: `${formatTimeStamp(item.pubdate, true)} 发布, ${formatTimeStamp(item.add_at, true)} 添加稍后再看`,
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: `${formatTimeStamp(item.add_at)} · 稍后再看`,
      invalidReason,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [
        {
          field: "play",
          value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK
        },
        {
          field: "like",
          value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK
        },
        // { field: 'coin', value: formatCount(item.stat.coin) || STAT_NUMBER_FALLBACK },
        {
          field: "favorite",
          value: formatCount(item.stat.favorite) || STAT_NUMBER_FALLBACK
        }
      ],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiFavAdapter(item) {
    return {
      // video
      avid: String(item.id),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: `【${item.folder.title}】· ${item.title}`,
      titleRender: /* @__PURE__ */ jsxs(Fragment, {
        children: ["【", /* @__PURE__ */ jsx(IconPark, {
          name: "Star",
          size: 16,
          theme: "two-tone",
          fill: ["currentColor", colorPrimaryValue],
          style: {
            display: "inline-block",
            verticalAlign: "middle",
            marginLeft: 10,
            marginRight: 4,
            marginTop: -4
          }
        }), item.folder.title, "】· ", item.title]
      }),
      cover: item.cover,
      pubts: item.pubtime,
      pubdateDisplay: formatTimeStamp(item.pubtime),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: `${formatTimeStamp(item.fav_time)} · 收藏`,
      // stat
      play: item.cnt_info.play,
      like: void 0,
      coin: void 0,
      danmaku: item.cnt_info.danmaku,
      favorite: item.cnt_info.collect,
      statItems: [{
        field: "play",
        value: formatCount(item.cnt_info.play) || STAT_NUMBER_FALLBACK
      }, {
        field: "danmaku",
        value: formatCount(item.cnt_info.danmaku) || STAT_NUMBER_FALLBACK
      }, {
        field: "favorite",
        value: formatCount(item.cnt_info.collect) || STAT_NUMBER_FALLBACK
      }],
      // author
      authorName: item.upper.name,
      authorFace: item.upper.face,
      authorMid: String(item.upper.mid)
    };
  }
  function apiPopularGeneralAdapter(item) {
    var _a2;
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: (_a2 = item.rcmd_reason) == null ? void 0 : _a2.content,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [{
        field: "play",
        value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK
      }, {
        field: "like",
        value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK
      }, {
        field: "danmaku",
        value: formatCount(item.stat.danmaku) || STAT_NUMBER_FALLBACK
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function apiPopularWeeklyAdapter(item) {
    return {
      // video
      avid: String(item.aid),
      bvid: item.bvid,
      goto: "av",
      href: `/video/${item.bvid}/`,
      title: item.title,
      cover: item.pic,
      pubts: item.pubdate,
      pubdateDisplay: formatTimeStamp(item.pubdate),
      duration: item.duration,
      durationStr: formatDuration(item.duration),
      recommendReason: item.rcmd_reason,
      // stat
      play: item.stat.view,
      like: item.stat.like,
      coin: void 0,
      danmaku: item.stat.danmaku,
      favorite: void 0,
      statItems: [{
        field: "play",
        value: formatCount(item.stat.view) || STAT_NUMBER_FALLBACK
      }, {
        field: "like",
        value: formatCount(item.stat.like) || STAT_NUMBER_FALLBACK
      }, {
        field: "danmaku",
        value: formatCount(item.stat.danmaku) || STAT_NUMBER_FALLBACK
      }],
      // author
      authorName: item.owner.name,
      authorFace: item.owner.face,
      authorMid: String(item.owner.mid)
    };
  }
  function usePreviewAnimation({
    bvid,
    title,
    autoPreviewWhenHover,
    active,
    tryFetchVideoData,
    videoPreviewWrapperRef
  }) {
    const DEBUG_ANIMATION = false;
    const [previewAnimationProgress, setPreviewAnimationProgress] = useRafState(void 0);
    const [mouseMoved, setMouseMoved] = React__default.useState(false);
    const isHovering = React__default.useRef(false);
    const startByHover = React__default.useRef(false);
    useEventListener("mouseenter", (e2) => {
      isHovering.current = true;
      if (autoPreviewWhenHover && !idRef.current) {
        onStartPreviewAnimation(true);
      }
    }, {
      target: videoPreviewWrapperRef
    });
    useEventListener("mouseleave", (e2) => {
      isHovering.current = false;
    }, {
      target: videoPreviewWrapperRef
    });
    useEventListener("mousemove", (e2) => {
      setMouseMoved(true);
      if (!autoPreviewWhenHover) {
        stopAnimation();
      }
    }, {
      target: videoPreviewWrapperRef
    });
    const unmounted = useUnmountedRef$1();
    const idRef = React__default.useRef(void 0);
    const shouldStopAnimation = useMemoizedFn(() => {
      if (unmounted.current)
        return true;
      if (autoPreviewWhenHover) {
        if (startByHover.current) {
          if (!isHovering.current)
            return true;
        } else {
          if (!active)
            return true;
        }
      } else {
        if (!active)
          return true;
        if (mouseMoved)
          return true;
      }
      return false;
    });
    const stopAnimation = useMemoizedFn((isClear = false) => {
      if (!isClear && DEBUG_ANIMATION) {
        console.log(`[${APP_NAME}]: [animation] stopAnimation: %o`, {
          autoPreviewWhenHover,
          unmounted: unmounted.current,
          isHovering: isHovering.current,
          active,
          mouseMoved
        });
      }
      if (idRef.current)
        cancelAnimationFrame(idRef.current);
      idRef.current = void 0;
      setPreviewAnimationProgress(void 0);
      setAnimationPaused(false);
    });
    const [animationPaused, setAnimationPaused, getAnimationPaused] = useGetState(false);
    const resumeAnimationInner = React__default.useRef();
    const onHotkeyPreviewAnimation = useMemoizedFn(() => {
      var _a2;
      if (!idRef.current) {
        onStartPreviewAnimation();
        return;
      }
      setAnimationPaused((val) => !val);
      if (animationPaused) {
        (_a2 = resumeAnimationInner.current) == null ? void 0 : _a2.call(resumeAnimationInner, previewAnimationProgress || 0);
      }
    });
    const getProgress = useMemoizedFn(() => {
      return previewAnimationProgress || 0;
    });
    const onStartPreviewAnimation = useMemoizedFn((_startByHover = false) => {
      startByHover.current = _startByHover;
      setMouseMoved(false);
      setAnimationPaused(false);
      tryFetchVideoData();
      stopAnimation(true);
      setPreviewAnimationProgress((val) => typeof val === "undefined" ? 0 : val);
      const runDuration = 8e3;
      const updateProgressInterval = () => typeof settings.autoPreviewUpdateInterval === "number" ? settings.autoPreviewUpdateInterval : 400;
      let start = performance.now();
      let lastUpdateAt = 0;
      resumeAnimationInner.current = () => {
        start = performance.now() - getProgress() * runDuration;
      };
      function frame(t2) {
        if (shouldStopAnimation()) {
          stopAnimation();
          return;
        }
        const update = () => {
          const elapsed = performance.now() - start;
          const p2 = Math.min(elapsed % runDuration / runDuration, 1);
          setPreviewAnimationProgress(p2);
        };
        if (!getAnimationPaused()) {
          if (updateProgressInterval()) {
            if (!lastUpdateAt || performance.now() - lastUpdateAt >= updateProgressInterval()) {
              lastUpdateAt = performance.now();
              update();
            }
          } else {
            update();
          }
        }
        idRef.current = requestAnimationFrame(frame);
      }
      idRef.current = requestAnimationFrame(frame);
    });
    return {
      onHotkeyPreviewAnimation,
      onStartPreviewAnimation,
      previewAnimationProgress
    };
  }
  const debug$5 = baseDebug.extend("components:VideoCard");
  function copyContent(content) {
    GM.setClipboard(content);
    AntdMessage.success(`已复制: ${content}`);
  }
  const defaultEmitter = mitt();
  const VideoCard = React__default.memo(function VideoCard2({ style, className, item, loading, active, onRemoveCurrent, onMoveToFirst, onRefresh, emitter: emitter2, ...restProps }) {
    loading = loading ?? !item;
    const dislikedReason = useDislikedReason((item == null ? void 0 : item.api) === "app" && item.param);
    const cardData = React__default.useMemo(() => item && normalizeCardData(item), [item]);
    const blacklisted = useInBlacklist(cardData == null ? void 0 : cardData.authorMid);
    return /* @__PURE__ */ jsx("div", { style, className: cx("bili-video-card", styles$2.biliVideoCard, className), ...restProps, children: loading ? /* @__PURE__ */ jsx(SkeletonCard, { loading }) : item && cardData && (dislikedReason ? /* @__PURE__ */ jsx(DislikedCard, { item, emitter: emitter2, dislikedReason }) : blacklisted ? /* @__PURE__ */ jsx(BlacklistCard, { cardData }) : /* @__PURE__ */ jsx(VideoCardInner, { item, cardData, active, emitter: emitter2, onRemoveCurrent, onMoveToFirst, onRefresh })) });
  });
  var _ref8$1 = { name: "16dof6j", styles: "flex:1;margin-left:10px" };
  var _ref9$1 = { name: "1po2nvr", styles: "width:32px;height:32px;border-radius:50%" };
  const SkeletonCard = React__default.memo(function SkeletonCard2({ loading }) {
    const { styleFancy } = useSettingsSnapshot();
    return /* @__PURE__ */ jsxs("div", { className: cx("bili-video-card__skeleton", { hide: !loading, [styles$2.skeletonActive]: loading }), children: [/* @__PURE__ */ jsx("div", { className: "bili-video-card__skeleton--cover", style: borderRadiusStyle }), !styleFancy && /* @__PURE__ */ jsx("div", { className: "bili-video-card__skeleton--info", children: /* @__PURE__ */ jsxs("div", { className: "bili-video-card__skeleton--right", children: [/* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--text" }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--text short" }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--light" })] }) }), styleFancy && /* @__PURE__ */ jsxs("div", { className: "bili-video-card__skeleton--info", children: [/* @__PURE__ */ jsx("div", { className: "bili-video-card__skeleton--avatar", css: _ref9$1 }), /* @__PURE__ */ jsxs("div", { className: "bili-video-card__skeleton--right", css: _ref8$1, children: [/* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--text" }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--text short" }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--light" }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__skeleton--text tiny" })] })] })] });
  });
  const DislikedCard = React__default.memo(function DislikedCard2({ dislikedReason, item, emitter: emitter2 = defaultEmitter }) {
    const onCancelDislike = useMemoizedFn(async () => {
      if (!(dislikedReason == null ? void 0 : dislikedReason.id))
        return;
      let success = false;
      let err;
      try {
        success = await cancelDislike(item, dislikedReason.id);
      } catch (e2) {
        err = e2;
      }
      if (err) {
        console.error(err.stack || err);
        return toastRequestFail();
      }
      success ? AntdMessage.success("已撤销") : AntdMessage.error(OPERATION_FAIL_MSG);
      if (success) {
        delDislikeId(item.param);
      }
    });
    useMittOn(emitter2, "cancel-dislike", onCancelDislike);
    return /* @__PURE__ */ jsxs("div", { className: cx(styles$2.dislikedWrapper), children: [/* @__PURE__ */ jsx("div", { className: styles$2.dislikeContentCover, children: /* @__PURE__ */ jsxs("div", { className: styles$2.dislikeContentCoverInner, children: [/* @__PURE__ */ jsx(IconPark, { name: "DistraughtFace", size: 32, className: styles$2.dislikeIcon }), /* @__PURE__ */ jsx("div", { className: styles$2.dislikeReason, children: dislikedReason == null ? void 0 : dislikedReason.name }), /* @__PURE__ */ jsx("div", { className: styles$2.dislikeDesc, children: (dislikedReason == null ? void 0 : dislikedReason.toast) || "将减少此类内容推荐" })] }) }), /* @__PURE__ */ jsx("div", { className: styles$2.dislikeContentAction, children: /* @__PURE__ */ jsxs("button", { onClick: onCancelDislike, children: [/* @__PURE__ */ jsx(IconPark, { name: "Return", size: "16", style: { marginRight: 4, marginTop: -2 } }), "撤销"] }) })] });
  });
  const BlacklistCard = React__default.memo(function BlacklistCard2({ cardData }) {
    const { authorMid, authorFace, authorName } = cardData;
    const onCancel = useMemoizedFn(async () => {
      if (!authorMid)
        return;
      const success = await UserBlacklistService.remove(authorMid);
      if (success)
        AntdMessage.success(`已移出黑名单: ${authorName}`);
    });
    return /* @__PURE__ */ jsxs("div", { className: cx(styles$2.dislikedWrapper), children: [/* @__PURE__ */ jsx("div", { className: styles$2.dislikeContentCover, children: /* @__PURE__ */ jsxs("div", { className: styles$2.dislikeContentCoverInner, children: [/* @__PURE__ */ jsx(IconPark, { name: "PeopleDelete", size: 32, className: styles$2.dislikeIcon }), /* @__PURE__ */ jsx("div", { className: styles$2.dislikeReason, children: "已拉黑" }), /* @__PURE__ */ jsxs("div", { className: styles$2.dislikeDesc, children: ["UP: ", authorName] })] }) }), /* @__PURE__ */ jsx("div", { className: styles$2.dislikeContentAction, children: /* @__PURE__ */ jsxs("button", { onClick: onCancel, children: [/* @__PURE__ */ jsx(IconPark, { name: "Return", size: "16", style: { marginRight: 4, marginTop: -2 } }), "撤销"] }) })] });
  });
  var _ref$6 = { name: "putlsr", styles: "margin-top:4px;padding-left:0;max-width:100%" };
  var _ref2$6 = { name: "s5xdrg", styles: "display:flex;align-items:center" };
  var _ref3$2 = { name: "zmsypw", styles: "margin-top:4px;color:var(--text3);font-size:var(--subtitle-font-size)" };
  var _ref4$1 = { name: "1ic5zs4", styles: "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;word-break:break-all;line-break:anywhere;color:var(--text1);font-size:var(--title-font-size);line-height:var(--title-line-height)" };
  var _ref5$1 = { name: "t6djnl", styles: "flex:1;margin-left:10px;overflow:hidden" };
  var _ref6$1 = { name: "1t32qz5", styles: "display:flex;margin-top:15px" };
  var _ref7$1 = { name: "11ginrh", styles: "background-color:unset;position:static" };
  const VideoCardInner = React__default.memo(function VideoCardInner2({ item, cardData, active = false, onRemoveCurrent, onMoveToFirst, onRefresh, emitter: emitter2 = defaultEmitter }) {
    var _a2, _b2;
    item.api === "pc";
    const isApp = item.api === "app";
    item.api === "dynamic";
    item.api === "watchlater";
    item.api === "fav";
    const { styleFancy } = useSettingsSnapshot();
    let {
      // video
      avid,
      bvid,
      goto,
      href,
      title,
      titleRender,
      desc,
      cover,
      pubdateDisplay,
      pubdateDisplayTitle,
      duration: duration2,
      durationStr,
      recommendReason: recommendReason2,
      invalidReason,
      // stat
      play,
      like,
      coin,
      danmaku,
      favorite,
      bangumiFollow,
      statItems,
      // author
      authorName,
      authorFace,
      authorMid,
      // adpater specific
      appBadge,
      appBadgeDesc
    } = cardData;
    const isNormalVideo = goto === "av";
    if (!["av", "bangumi", "picture"].includes(goto)) {
      console.warn(`[${APP_NAME}]: none (av,bangumi,picture) goto type %s`, goto, item);
    }
    const [videoData, setVideoData] = React__default.useState(null);
    const isFetchingVideoData = React__default.useRef(false);
    const tryFetchVideoData = useMemoizedFn(async () => {
      if (videoData)
        return;
      if (isFetchingVideoData.current)
        return;
      try {
        isFetchingVideoData.current = true;
        setVideoData(await getVideoData(bvid));
      } finally {
        isFetchingVideoData.current = false;
      }
    });
    const videoPreviewWrapperRef = React__default.useRef(null);
    const [mouseEnterRelativeX, setMouseEnterRelativeX] = React__default.useState(void 0);
    useEventListener("mouseenter", (e2) => {
      var _a3;
      const rect = (_a3 = videoPreviewWrapperRef.current) == null ? void 0 : _a3.getBoundingClientRect();
      if (!rect)
        return;
      const { x: x2 } = rect;
      const relativeX = e2.pageX - window.pageXOffset - x2;
      setMouseEnterRelativeX(relativeX);
    }, { target: videoPreviewWrapperRef });
    const isHovering = useHover(videoPreviewWrapperRef);
    const { autoPreviewWhenHover } = useSettingsSnapshot();
    const { onStartPreviewAnimation, onHotkeyPreviewAnimation, previewAnimationProgress } = usePreviewAnimation({ bvid, title, autoPreviewWhenHover, active, tryFetchVideoData, videoPreviewWrapperRef });
    useUpdateEffect(() => {
      if (!active)
        return;
      try {
        ;
        unsafeWindow[`${APP_KEY_PREFIX}_activeItem`] = item;
      } catch (e2) {
        console.warn("set unsafeWindow activeItem error");
        console.warn(e2.stack || e2);
      }
      if (settings.autoPreviewWhenKeyboardSelect) {
        onStartPreviewAnimation();
      }
    }, [active]);
    const watchLaterRef = React__default.useRef(null);
    const isWatchLaterHovering = useHover(watchLaterRef);
    const watchLaterAdded = useWatchLaterState(bvid);
    const watchLaterAddedPrevious = usePrevious$1(watchLaterAdd);
    const { accessKey } = useSettingsSnapshot();
    const authed = Boolean(accessKey);
    React__default.useEffect(() => {
      if (isHovering)
        tryFetchVideoData();
    }, [isHovering]);
    const hasWatchLaterEntry = item.api !== "app" || item.api === "app" && item.goto === "av";
    const requestingWatchLaterApi = React__default.useRef(false);
    const onToggleWatchLater = useMemoizedFn(async (e2, usingAction) => {
      e2 == null ? void 0 : e2.preventDefault();
      e2 == null ? void 0 : e2.stopPropagation();
      usingAction ?? (usingAction = watchLaterAdded ? watchLaterDel : watchLaterAdd);
      if (usingAction !== watchLaterAdd && usingAction !== watchLaterDel) {
        throw new Error("unexpected usingAction provided");
      }
      if (requestingWatchLaterApi.current)
        return { success: false };
      requestingWatchLaterApi.current = true;
      let success = false;
      try {
        success = await usingAction(avid);
      } finally {
        requestingWatchLaterApi.current = false;
      }
      const targetState = usingAction === watchLaterAdd ? true : false;
      if (success) {
        if (targetState) {
          watchLaterState.bvidSet.add(bvid);
        } else {
          watchLaterState.bvidSet.delete(bvid);
        }
        if (item.api === "watchlater") {
          if (!targetState) {
            await delay(100);
            onRemoveCurrent == null ? void 0 : onRemoveCurrent(item, cardData);
          }
        } else {
          AntdMessage.success(`已${targetState ? "添加" : "移除"}稍后再看`);
        }
      }
      return { success, targetState };
    });
    const btnDislikeRef = React__default.useRef(null);
    const isBtnDislikeHovering = useHover(btnDislikeRef);
    const onTriggerDislike = useMemoizedFn((e2) => {
      e2 == null ? void 0 : e2.preventDefault();
      e2 == null ? void 0 : e2.stopPropagation();
      if (!hasDislikeEntry) {
        if (item.api !== "app") {
          return AntdMessage.error("当前视频不支持提交「我不想看」");
        }
        if (!authed) {
          return AntdMessage.error("请先获取 access_key");
        }
        return;
      }
      showModalDislike(item);
    });
    const playStr = React__default.useMemo(() => formatCount(play), [play]);
    React__default.useMemo(() => formatCount(like), [like]);
    const danmakuStr = React__default.useMemo(() => formatCount(danmaku), [danmaku]);
    React__default.useMemo(() => formatCount(favorite), [favorite]);
    const makeStatItem = ({ text, iconSvgName, iconSvgScale }) => {
      return /* @__PURE__ */ jsxs("span", { className: "bili-video-card__stats--item", children: [/* @__PURE__ */ jsx("svg", { className: "bili-video-card__stats--icon", style: { transform: iconSvgScale ? `scale(${iconSvgScale})` : void 0 }, children: /* @__PURE__ */ jsx("use", { href: iconSvgName }) }), /* @__PURE__ */ jsx("span", { className: "bili-video-card__stats--text", style: { lineHeight: "calc(var(--icon-size) + 1px)" }, children: text })] });
    };
    const [favFolderNames, setFavFolderNames] = React__default.useState(void 0);
    const [favFolderUrls, setFavFolderUrls] = React__default.useState(void 0);
    const updateFavFolderNames = useMemoizedFn(async () => {
      if (item.api !== "watchlater")
        return;
      const result = await UserFavService.getVideoFavState(avid);
      if (result) {
        const { favFolderNames: favFolderNames2, favFolderUrls: favFolderUrls2 } = result;
        setFavFolderNames(favFolderNames2);
        setFavFolderUrls(favFolderUrls2);
      }
    });
    const onOpen = useMemoizedFn(() => {
      window.open(href, "_blank");
    });
    const onOpenInPopup = useMemoizedFn(() => {
      var _a3;
      let popupWidth = 1e3;
      let popupHeight = Math.ceil(popupWidth / 16 * 9);
      if (item.api === ApiType.app && ((_a3 = item.uri) == null ? void 0 : _a3.startsWith("bilibili://"))) {
        const searchParams = new URL(item.uri).searchParams;
        const playerWidth = Number(searchParams.get("player_width") || 0);
        const playerHeight = Number(searchParams.get("player_height") || 0);
        if (playerWidth && playerHeight && !isNaN(playerWidth) && !isNaN(playerHeight)) {
          if (playerWidth < playerHeight) {
            popupWidth = 720;
            popupHeight = Math.floor(popupWidth / 9 * 16);
          }
        }
      }
      const left = (window.innerWidth - popupWidth) / 2;
      const top = (window.innerHeight - popupHeight) / 2 - 50;
      const features = ["popup=true", `width=${popupWidth}`, `height=${popupHeight}`, `left=${left}`, `top=${top}`].join(",");
      const u2 = new URL(href, location.href);
      u2.searchParams.append(PLAYER_SCREEN_MODE, PlayerScreenMode.WebFullscreen);
      const newHref = u2.href;
      debug$5("openInPopup: features -> %s", features);
      window.open(newHref, "_blank", features);
    });
    const handleVideoLinkClick = useMemoizedFn((e2) => {
      if (settings.openVideoInPopupWhenClick) {
        e2.preventDefault();
        onOpenInPopup();
        return;
      }
      if (settings.openVideoAutoFullscreen) {
        e2.preventDefault();
        const u2 = new URL(href, location.href);
        u2.searchParams.set(PLAYER_SCREEN_MODE, PlayerScreenMode.Fullscreen);
        const newHref = u2.href;
        window.open(newHref, "_blank");
        return;
      }
    });
    const onOpenInBackground = useMemoizedFn(() => {
      const fullHref = new URL(href, location.href).href;
      GM.openInTab(fullHref, { active: false, insert: true });
    });
    useMittOn(emitter2, "open", onOpen);
    useMittOn(emitter2, "toggle-watch-later", () => onToggleWatchLater());
    useMittOn(emitter2, "trigger-dislike", () => onTriggerDislike());
    useMittOn(emitter2, "start-preview-animation", onStartPreviewAnimation);
    useMittOn(emitter2, "hotkey-preview-animation", onHotkeyPreviewAnimation);
    const hasDislikeEntry = isApp && authed && !!((_b2 = (_a2 = item.three_point) == null ? void 0 : _a2.dislike_reasons) == null ? void 0 : _b2.length);
    const onCopyLink = useMemoizedFn(() => {
      let content = href;
      if (href.startsWith("/")) {
        content = new URL(href, location.href).href;
      }
      copyContent(content);
    });
    const onOpenInIINA = useMemoizedFn(() => {
      let usingHref = href;
      if (item.api === "watchlater")
        usingHref = `/video/${item.bvid}`;
      const fullHref = new URL(usingHref, location.href).href;
      const iinaUrl = `iina://open?url=${encodeURIComponent(fullHref)}`;
      window.open(iinaUrl, "_self");
    });
    const tab2 = useCurrentSourceTab();
    const hasBlacklistEntry = tab2 === "recommend-app" || tab2 === "recommend-pc" || tab2 === "popular-general" || tab2 === "popular-weekly";
    const onBlacklistUp = useMemoizedFn(async () => {
      if (!authorMid)
        return AntdMessage.error("UP mid 为空!");
      const success = await UserBlacklistService.add(authorMid);
      if (success) {
        AntdMessage.success(`已加入黑名单: ${authorName}`);
      }
    });
    const hasUnfollowEntry = item.api === "dynamic" || (item.api === "app" || item.api === "pc") && recommendReason2 === "已关注";
    const onUnfollowUp = useMemoizedFn(async () => {
      if (!authorMid)
        return;
      const success = await UserfollowService.unfollow(authorMid);
      if (success) {
        AntdMessage.success("已取消关注");
      }
    });
    const hasDynamicFeedFilterSelectUpEntry = isNormalVideo && !!authorMid && !!authorName && !!onRefresh;
    const onDynamicFeedFilterSelectUp = useMemoizedFn(async () => {
      if (!authorMid || !authorName)
        return;
      dynamicFeedFilterSelectUp({ upMid: Number(authorMid), upName: authorName });
      videoSourceTabState.value = "dynamic-feed";
      await delay(100);
      await (onRefresh == null ? void 0 : onRefresh());
    });
    const contextMenus = React__default.useMemo(() => {
      const watchLaterLabel = watchLaterAdded ? "移除稍后再看" : "稍后再看";
      return [{ key: "open-link", label: "打开", icon: /* @__PURE__ */ jsx(IconPark, { name: "EfferentFour", size: 15 }), onClick: onOpen }, { key: "open-link-in-popup", label: "小窗打开", icon: /* @__PURE__ */ jsx(IconPark, { name: "EfferentFour", size: 15 }), onClick: onOpenInPopup }, { key: "open-link-in-background", label: "后台打开", icon: /* @__PURE__ */ jsx(IconPark, { name: "Split", size: 15 }), onClick: onOpenInBackground }, { type: "divider" }, { key: "copy-link", label: "复制视频链接", icon: /* @__PURE__ */ jsx(IconPark, { name: "Copy", size: 15 }), onClick: onCopyLink }, { key: "copy-bvid", label: "复制 BVID", icon: /* @__PURE__ */ jsx(IconPark, { name: "Copy", size: 15 }), onClick() {
        copyContent(bvid);
      } }, { type: "divider" }, hasDislikeEntry && { key: "dislike", label: "我不想看", icon: /* @__PURE__ */ jsx(IconPark, { name: "DislikeTwo", size: 15 }), onClick() {
        onTriggerDislike();
      } }, hasDynamicFeedFilterSelectUpEntry && { key: "dymamic-feed-filter-select-up", label: "查看 UP 的动态", icon: /* @__PURE__ */ jsx(IconPark, { name: "PeopleSearch", size: 15 }), onClick: onDynamicFeedFilterSelectUp }, hasUnfollowEntry && { key: "unfollow-up", label: "取消关注", icon: /* @__PURE__ */ jsx(IconPark, { name: "PeopleMinus", size: 15 }), onClick: onUnfollowUp }, hasBlacklistEntry && { key: "blacklist-up", label: "将 UP 加入黑名单", icon: /* @__PURE__ */ jsx(IconPark, { name: "PeopleDelete", size: 15 }), onClick: onBlacklistUp }, item.api === "watchlater" && { key: "add-fav", icon: /* @__PURE__ */ jsx(IconPark, { name: "Star", size: 15, ...(favFolderNames == null ? void 0 : favFolderNames.length) ? { theme: "two-tone", fill: ["currentColor", colorPrimaryValue] } : void 0 }), label: (favFolderNames == null ? void 0 : favFolderNames.length) ? `已收藏 ${favFolderNames.map((n2) => `「${n2}」`).join("")}` : "快速收藏", async onClick() {
        const hasFaved = Boolean(favFolderNames == null ? void 0 : favFolderNames.length);
        if (hasFaved) {
          favFolderUrls == null ? void 0 : favFolderUrls.forEach((u2) => {
            window.open(u2, "_blank");
          });
        } else {
          const success = await UserFavService.addFav(avid);
          if (success) {
            AntdMessage.success(`已加入收藏夹「${defaultFavFolderName}」`);
          }
        }
      } }, hasWatchLaterEntry && { key: "watchlater", label: watchLaterLabel, icon: /* @__PURE__ */ jsx(IconPark, { name: watchLaterAdded ? "Delete" : "FileCabinet", size: 15 }), onClick() {
        onToggleWatchLater();
      } }, item.api === "watchlater" && watchLaterAdded && { key: "watchlater-readd", label: "重新添加稍候再看 (移到最前)", icon: /* @__PURE__ */ jsx(IconPark, { name: "AddTwo", size: 15 }), async onClick() {
        const { success } = await onToggleWatchLater(void 0, watchLaterAdd);
        if (!success)
          return;
        onMoveToFirst == null ? void 0 : onMoveToFirst(item, cardData);
      } }, ...item.api === "fav" ? [{ type: "divider" }, { key: "open-fav-folder", label: "浏览收藏夹", icon: /* @__PURE__ */ jsx(IconPark, { name: "EfferentFour", size: 15 }), onClick() {
        const { id } = item.folder;
        const url = formatFavFolderUrl(id);
        window.open(url, "_blank");
      } }, { key: "remove-fav", label: "移除收藏", icon: /* @__PURE__ */ jsx(IconPark, { name: "Delete", size: 15 }), async onClick() {
        if (item.api !== "fav")
          return;
        const success = await UserFavService.removeFav(item.folder.id, `${item.id}:${item.type}`);
        if (success) {
          onRemoveCurrent == null ? void 0 : onRemoveCurrent(item, cardData);
        }
      } }] : [], ...isMac ? [{ type: "divider" }, { key: "open-in-iina", label: "在 IINA 中打开", icon: /* @__PURE__ */ jsx(IconPark, { name: "PlayTwo", size: 15 }), onClick: onOpenInIINA }] : []].filter(Boolean);
    }, [item, hasWatchLaterEntry, watchLaterAdded, hasDislikeEntry, hasUnfollowEntry, hasBlacklistEntry, hasDynamicFeedFilterSelectUpEntry, favFolderNames, favFolderUrls]);
    const onContextMenuOpenChange = useMemoizedFn((open) => {
      if (!open)
        return;
      updateFavFolderNames();
    });
    const authorHref = authorMid ? `https://space.bilibili.com/${authorMid}` : href;
    desc || (desc = `${authorName}${pubdateDisplay ? ` · ${pubdateDisplay}` : ""}`);
    const descTitle = authorName && pubdateDisplayTitle ? `${authorName} · ${pubdateDisplayTitle}` : desc;
    return /* @__PURE__ */ jsxs("div", { "data-bvid": bvid || "", className: "bili-video-card__wrap __scale-wrap", css: _ref7$1, children: [/* @__PURE__ */ jsx(antd.Dropdown, { menu: { items: contextMenus }, trigger: ["contextMenu"], onOpenChange: onContextMenuOpenChange, children: /* @__PURE__ */ jsx("a", { href, target: "_blank", onClick: handleVideoLinkClick, children: /* @__PURE__ */ jsxs("div", { className: "bili-video-card__image __scale-player-wrap", ref: videoPreviewWrapperRef, style: { ...borderRadiusStyle, aspectRatio: "16 / 9" }, children: [/* @__PURE__ */ jsxs("div", { className: "bili-video-card__image--wrap", style: { borderRadius: "inherit" }, children: [/* @__PURE__ */ jsxs("picture", { className: "v-img bili-video-card__cover", style: { borderRadius: "inherit", overflow: "hidden" }, children: [!isSafari && /* @__PURE__ */ jsx("source", { srcSet: `${cover}@672w_378h_1c_!web-home-common-cover.avif`, type: "image/avif" }), /* @__PURE__ */ jsx("source", { srcSet: `${cover}@672w_378h_1c_!web-home-common-cover.webp`, type: "image/webp" }), /* @__PURE__ */ jsx("img", { src: `${cover}@672w_378h_1c_!web-home-common-cover`, loading: "eager" })] }), (isHovering || typeof previewAnimationProgress === "number") && /* @__PURE__ */ jsx(PreviewImage, { videoDuration: duration2, pvideo: videoData == null ? void 0 : videoData.videoshotData, mouseEnterRelativeX, previewAnimationProgress }), hasWatchLaterEntry && /* @__PURE__ */ jsxs("div", { className: `${styles$2.watchLater}`, style: { display: isHovering || active ? "flex" : "none" }, ref: watchLaterRef, onClick: onToggleWatchLater, children: [watchLaterAdded ? /* @__PURE__ */ jsx("svg", { className: styles$2.watchLaterIcon, viewBox: "0 0 200 200", children: /* @__PURE__ */ jsx(framerMotion.motion.path, { d: "M25,100 l48,48 a 8.5,8.5 0 0 0 10,0 l90,-90", strokeWidth: "20", stroke: "currentColor", fill: "transparent", strokeLinecap: "round", ...!watchLaterAddedPrevious ? { initial: { pathLength: 0 }, animate: { pathLength: 1 } } : void 0 }) }) : /* @__PURE__ */ jsx("svg", { className: styles$2.watchLaterIcon, children: /* @__PURE__ */ jsx("use", { href: "#widget-watch-later" }) }), /* @__PURE__ */ jsx("span", { className: styles$2.watchLaterTip, style: { display: isWatchLaterHovering ? "block" : "none" }, children: watchLaterAdded ? "移除稍后再看" : "稍后再看" })] }), hasDislikeEntry && /* @__PURE__ */ jsxs("div", { ref: btnDislikeRef, className: styles$2.btnDislike, onClick: onTriggerDislike, style: { display: isHovering ? "flex" : "none" }, children: [/* @__PURE__ */ jsx("svg", { className: styles$2.btnDislikeIcon, children: /* @__PURE__ */ jsx("use", { href: "#widget-close" }) }), /* @__PURE__ */ jsx("span", { className: styles$2.btnDislikeTip, style: { display: isBtnDislikeHovering ? "block" : "none" }, children: "我不想看" })] })] }), /* @__PURE__ */ jsx("div", { className: "bili-video-card__mask", style: { borderRadius: "inherit", overflow: "hidden" }, children: /* @__PURE__ */ jsxs("div", { className: "bili-video-card__stats", children: [/* @__PURE__ */ jsx("div", { className: "bili-video-card__stats--left", children: (statItems == null ? void 0 : statItems.length) ? /* @__PURE__ */ jsx(Fragment, { children: statItems.map(({ field, value }) => /* @__PURE__ */ jsx(React__default.Fragment, { children: makeStatItem({ text: value, iconSvgName: AppRecIconSvgNameMap[field], iconSvgScale: AppRecIconScaleMap[field] }) }, field)) }) : /* @__PURE__ */ jsxs(Fragment, { children: [makeStatItem({ text: playStr || STAT_NUMBER_FALLBACK, iconSvgName: AppRecIconSvgNameMap.play }), makeStatItem({ text: danmakuStr || STAT_NUMBER_FALLBACK, iconSvgName: AppRecIconSvgNameMap.danmaku })] }) }), /* @__PURE__ */ jsx("span", { className: "bili-video-card__stats__duration", children: isNormalVideo && durationStr })] }) })] }) }) }), !styleFancy && /* @__PURE__ */ jsx("div", { className: "bili-video-card__info __scale-disable", children: /* @__PURE__ */ jsxs("div", { className: "bili-video-card__info--right", children: [/* @__PURE__ */ jsx("a", { href, target: "_blank", "data-mod": "partition_recommend", "data-idx": "content", "data-ext": "click", onClick: handleVideoLinkClick, children: /* @__PURE__ */ jsx("h3", { className: "bili-video-card__info--tit", title, children: titleRender ?? title }) }), /* @__PURE__ */ jsx("p", { className: "bili-video-card__info--bottom", children: isNormalVideo ? /* @__PURE__ */ jsxs("a", { className: "bili-video-card__info--owner", href: authorHref, target: "_blank", title: descTitle, children: [recommendReason2 ? /* @__PURE__ */ jsx("span", { className: styles$2.recommendReason, children: recommendReason2 }) : /* @__PURE__ */ jsx("svg", { className: "bili-video-card__info--owner__up", children: /* @__PURE__ */ jsx("use", { href: "#widget-up" }) }), /* @__PURE__ */ jsx("span", { className: "bili-video-card__info--author", children: desc })] }) : appBadge || appBadgeDesc ? /* @__PURE__ */ jsxs("a", { className: "bili-video-card__info--owner", href, target: "_blank", children: [/* @__PURE__ */ jsx("span", { className: styles$2.badge, children: appBadge || "" }), /* @__PURE__ */ jsx("span", { className: styles$2.bangumiDesc, children: appBadgeDesc || "" })] }) : null })] }) }), styleFancy && /* @__PURE__ */ jsxs("div", { css: _ref6$1, children: [/* @__PURE__ */ jsx("a", { href: authorHref, target: "_blank", onClick: handleVideoLinkClick, children: authorFace ? /* @__PURE__ */ jsx(antd.Avatar, { src: authorFace }) : /* @__PURE__ */ jsx(antd.Avatar, { children: (authorName == null ? void 0 : authorName[0]) || (appBadgeDesc == null ? void 0 : appBadgeDesc[0]) || "" }) }), /* @__PURE__ */ jsxs("div", { css: _ref5$1, children: [/* @__PURE__ */ jsx("a", { href, target: "_blank", children: /* @__PURE__ */ jsx("h3", { title, css: _ref4$1, children: titleRender ?? title }) }), /* @__PURE__ */ jsx("div", { css: _ref3$2, children: isNormalVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", { css: _ref2$6, children: /* @__PURE__ */ jsx("a", { className: "bili-video-card__info--owner", href: authorHref, target: "_blank", title: descTitle, children: /* @__PURE__ */ jsx("span", { className: "bili-video-card__info--author", children: desc }) }) }), !!recommendReason2 && /* @__PURE__ */ jsx("div", { className: styles$2.recommendReason, css: _ref$6, children: recommendReason2 })] }) : appBadge || appBadgeDesc ? /* @__PURE__ */ jsxs("a", { className: "bili-video-card__info--owner", href, target: "_blank", children: [!!appBadge && /* @__PURE__ */ jsx("span", { className: styles$2.badge, children: appBadge }), !!appBadgeDesc && /* @__PURE__ */ jsx("span", { className: styles$2.bangumiDesc, children: appBadgeDesc })] }) : null })] })] })] });
  });
  const videoGrid = "_video-grid_wfxpc_7";
  const videoGridNewHomepage = "_video-grid-new-homepage_wfxpc_17";
  const limitTwoLines = "_limit-two-lines_wfxpc_20";
  const videoGridInternalTesting = "_video-grid-internal-testing_wfxpc_52";
  const videoGridContainer = "_video-grid-container_wfxpc_88";
  const videoGridFancy = "_video-grid-fancy_wfxpc_93";
  const narrowMode$1 = "_narrow-mode_wfxpc_134";
  function useShortcut({
    enabled,
    refresh,
    minIndex = 0,
    maxIndex,
    containerRef,
    getScrollerRect,
    changeScrollY,
    videoCardEmitters
  }) {
    const [activeIndex, setActiveIndex] = React__default.useState(void 0);
    const isEnabled = useMemoizedFn(() => {
      if (!enabled)
        return false;
      if (shouldDisableShortcut())
        return false;
      return true;
    });
    const activeIndexIsValid = useMemoizedFn(() => {
      var _a2;
      if (typeof activeIndex !== "number")
        return false;
      if (!containerRef.current)
        return false;
      const scrollerRect = getScrollerRect();
      const rect = (_a2 = containerRef.current.querySelector(`.${CardClassNames.card}.${CardClassNames.cardActive}`)) == null ? void 0 : _a2.getBoundingClientRect();
      if (!scrollerRect || !rect)
        return false;
      if (rect.top - scrollerRect.top < -(scrollerRect.height + rect.height)) {
        return false;
      }
      if (rect.top - scrollerRect.top > scrollerRect.height * 2 + rect.height) {
        return false;
      }
      return true;
    });
    function getStep(direction) {
      const card = getCardAt(activeIndex);
      const activeLeft = card.getBoundingClientRect().left;
      const isLeftSame = (left) => Math.abs(activeLeft - left) < 1;
      {
        const col = getColumnCount(containerRef.current);
        const step2 = direction === "down" ? col : -col;
        const newCard = getCardAt(activeIndex + step2);
        if (newCard) {
          const left = newCard.getBoundingClientRect().left;
          if (isLeftSame(left)) {
            return step2;
          }
        }
      }
      let step = 0;
      let cur = card;
      const next2 = () => direction === "down" ? cur.nextElementSibling : cur.previousElementSibling;
      while (next2()) {
        cur = next2();
        if (!cur.classList.contains(CardClassNames.card))
          continue;
        direction === "down" ? step++ : step--;
        const left = cur.getBoundingClientRect().left;
        if (isLeftSame(left)) {
          return step;
        }
      }
      return 0;
    }
    const addActiveIndex = (step) => (e2) => {
      if (!isEnabled())
        return;
      e2 == null ? void 0 : e2.preventDefault();
      let newActiveIndex;
      if (activeIndexIsValid()) {
        const _step = typeof step === "number" ? step : getStep(step);
        newActiveIndex = activeIndex + _step;
      } else {
        newActiveIndex = getInitialIndex();
      }
      if (newActiveIndex < minIndex) {
        makeVisible(minIndex);
        return;
      }
      if (newActiveIndex > maxIndex) {
        makeVisible(maxIndex);
        return;
      }
      setActiveIndex(newActiveIndex);
      makeVisible(newActiveIndex);
    };
    useKeyPress("leftarrow", addActiveIndex(-1), {
      exactMatch: true
    });
    useKeyPress("rightarrow", addActiveIndex(1), {
      exactMatch: true
    });
    useKeyPress("tab", addActiveIndex(1), {
      exactMatch: true
    });
    useKeyPress("shift.tab", addActiveIndex(-1), {
      exactMatch: true
    });
    useKeyPress("uparrow", addActiveIndex("up"), {
      exactMatch: true
    });
    useKeyPress("downarrow", addActiveIndex("down"), {
      exactMatch: true
    });
    const clearActiveIndex = () => {
      if (!isEnabled())
        return;
      setActiveIndex(void 0);
    };
    const getActiveEmitter = () => {
      if (!isEnabled() || typeof activeIndex !== "number")
        return;
      return videoCardEmitters[activeIndex];
    };
    useKeyPress("esc", clearActiveIndex);
    useKeyPress("enter", () => {
      var _a2;
      if (!isEnabled() || typeof activeIndex !== "number")
        return;
      (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("open");
    });
    useKeyPress("backspace", () => {
      var _a2;
      if (!isEnabled() || typeof activeIndex !== "number")
        return;
      (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("trigger-dislike");
    });
    useKeyPress(["s", "w"], () => {
      var _a2;
      if (!isEnabled() || typeof activeIndex !== "number")
        return;
      (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("toggle-watch-later");
    }, {
      exactMatch: true
    });
    useKeyPress(["period", "p"], () => {
      var _a2;
      if (!isEnabled() || typeof activeIndex !== "number")
        return;
      (_a2 = getActiveEmitter()) == null ? void 0 : _a2.emit("hotkey-preview-animation");
    }, {
      exactMatch: true
    });
    function getInitialIndex() {
      const scrollerRect = getScrollerRect();
      if (!scrollerRect)
        return 0;
      const cards = getCards();
      for (let i2 = 0; i2 < cards.length; i2++) {
        const card = cards[i2];
        const rect = card.getBoundingClientRect();
        if (rect.top >= scrollerRect.top) {
          return i2;
        }
      }
      return 0;
    }
    const CARDS_SELECTOR = `.${CardClassNames.card}`;
    function getCards() {
      var _a2;
      return [...((_a2 = containerRef.current) == null ? void 0 : _a2.querySelectorAll(CARDS_SELECTOR)) || []];
    }
    function getCardAt(index) {
      return getCards()[index];
    }
    function makeVisible(index) {
      var _a2;
      const card = getCardAt(index);
      (_a2 = card == null ? void 0 : card.scrollIntoViewIfNeeded) == null ? void 0 : _a2.call(card, false);
      const scrollerRect = getScrollerRect();
      const rect = card.getBoundingClientRect();
      if (!scrollerRect || !rect)
        return;
      if (rect.top <= scrollerRect.top) {
        const offset = -(scrollerRect.top - rect.top + 10);
        changeScrollY == null ? void 0 : changeScrollY({
          offset
        });
        return;
      }
      if (scrollerRect.bottom - rect.bottom < 10) {
        const offset = 10 - (scrollerRect.bottom - rect.bottom);
        changeScrollY == null ? void 0 : changeScrollY({
          offset
        });
        return;
      }
    }
    return {
      activeIndex,
      clearActiveIndex
    };
  }
  const countCache1 = /* @__PURE__ */ new Map();
  const countCache2 = /* @__PURE__ */ new Map();
  function getColumnCount(container, mayHaveNarrowMode = true) {
    if (mayHaveNarrowMode && settings.useNarrowMode)
      return 2;
    const countCache = settings.styleFancy ? countCache1 : countCache2;
    let count = countCache.get(Math.trunc(window.innerWidth));
    if (count) {
      return count;
    }
    container || (container = document.querySelector(`.${videoGrid}`));
    if (!container)
      return 0;
    const style = window.getComputedStyle(container);
    if (style.display !== "grid")
      return 0;
    count = style.gridTemplateColumns.split(" ").length;
    countCache.set(window.innerWidth, count);
    return count;
  }
  function anyFilterEnabled(tab2) {
    return tab2 === "keep-follow-only" || settings.filterEnabled && (settings.filterMinDurationEnabled || settings.filterMinPlayCountEnabled || settings.filterOutGotoTypePicture);
  }
  function filterRecItems(items, tab2) {
    if (!anyFilterEnabled(tab2)) {
      return items;
    }
    return items.filter((item) => {
      if (item.api === ApiType.separator)
        return true;
      const {
        play,
        duration: duration2,
        recommendReason: recommendReason2,
        goto
      } = normalizeCardData(item);
      const isFollowed = recommendReason2 === "已关注" || (recommendReason2 == null ? void 0 : recommendReason2.includes("关注"));
      if (tab2 === "keep-follow-only") {
        if (!isFollowed)
          return false;
      }
      const isVideo = goto === "av";
      const isPicture = goto === "picture";
      if (isVideo)
        return filterVideo();
      if (isPicture)
        return filterPicture();
      return true;
      function filterVideo() {
        if (isFollowed && !settings.enableFilterForFollowedVideo)
          return true;
        if (settings.filterMinPlayCountEnabled && settings.filterMinPlayCount && typeof play === "number" && play < settings.filterMinPlayCount) {
          return false;
        }
        if (settings.filterMinDurationEnabled && settings.filterMinDuration && duration2 && duration2 < settings.filterMinDuration) {
          return false;
        }
        return true;
      }
      function filterPicture() {
        if (settings.filterOutGotoTypePicture) {
          if (isFollowed && !settings.enableFilterForFollowedPicture) {
            return true;
          }
          return false;
        } else {
          return true;
        }
      }
    });
  }
  var promise_retry = { exports: {} };
  var promise_timeout = { exports: {} };
  function checkAbortController() {
    if (typeof AbortController === "undefined" || typeof AbortSignal === "undefined") {
      console.error("[promise.timeout] need global AbortController & AbortSingal");
    }
  }
  function ptimeout$1(fn, timeout) {
    return function() {
      var ctx = this;
      var args = [].slice.call(arguments);
      checkAbortController();
      var controller = new AbortController();
      args.push(controller.signal);
      return new Promise(function(resolve, reject) {
        var timer = setTimeout(function() {
          var e2 = new TimeoutError$1(timeout);
          reject(e2);
          controller.abort();
        }, timeout);
        Promise.resolve(fn.apply(ctx, args)).then(
          // resolve
          function(result) {
            clearTimeout(timer);
            resolve(result);
          },
          // reject
          function(err) {
            clearTimeout(timer);
            reject(err);
          }
        );
      });
    };
  }
  let TimeoutError$1 = class TimeoutError2 extends Error {
    constructor(timeout) {
      super();
      this.timeout = timeout;
      this.message = `timeout of ${timeout}ms exceed`;
      Error.captureStackTrace(this, TimeoutError2);
    }
  };
  promise_timeout.exports = ptimeout$1;
  promise_timeout.exports.TimeoutError = TimeoutError$1;
  var promise_timeoutExports = promise_timeout.exports;
  const ptimeout = promise_timeoutExports;
  const TimeoutError3 = ptimeout.TimeoutError;
  promise_retry.exports = function pretry(fn, options) {
    const originalFn = fn;
    options = options || {};
    const times = options.times || 5;
    const _timeout = options.timeout;
    if (_timeout) {
      fn = ptimeout(fn, _timeout);
    }
    const onerror = options.onerror;
    return async function() {
      const ctx = this;
      const args = [].slice.call(arguments);
      const errors = new Array(times);
      for (let i2 = 0; i2 < times; i2++) {
        let result;
        let err;
        try {
          result = await fn.apply(ctx, args);
        } catch (e2) {
          err = e2;
        }
        if (!err) {
          return result;
        }
        if (err instanceof TypeError) {
          throw err;
        }
        if (err instanceof AbortError2) {
          throw err.originalError;
        }
        errors[i2] = err;
        if (onerror) {
          onerror(err, i2);
        }
        continue;
      }
      throw new RetryError({
        times,
        timeout: _timeout,
        fn: originalFn,
        errors
        // 错误列表
      });
    };
  };
  class RetryError extends Error {
    constructor(options) {
      super();
      this.times = options.times;
      this.timeout = options.timeout;
      this.fn = options.fn;
      this.errors = options.errors;
      this.name = "RetryError";
      this.message = `tried function ${this.fn.name || "<anonymous>"} ${this.times} times`;
      if (this.timeout) {
        this.message += ` with timeout = ${this.timeout}ms`;
      }
      Error.captureStackTrace(this, this.constructor);
    }
  }
  class AbortError2 extends Error {
    constructor(message2) {
      super();
      if (message2 instanceof Error) {
        this.originalError = message2;
        ({
          message: message2
        } = message2);
      } else {
        this.originalError = new Error(message2);
        this.originalError.stack = this.stack;
      }
      this.name = "AbortError";
      this.message = message2;
    }
  }
  var RetryError_1 = promise_retry.exports.RetryError = RetryError;
  promise_retry.exports.TimeoutError = TimeoutError3;
  var promise_retryExports = promise_retry.exports;
  const pretry2 = /* @__PURE__ */ getDefaultExportFromCjs(promise_retryExports);
  class RecReqError extends Error {
    constructor(json) {
      super();
      __publicField(this, "json");
      Error.captureStackTrace(this, RecReqError);
      this.json = json;
      this.message = json.message || JSON.stringify(json);
    }
  }
  async function getRecommend(device) {
    var _a2;
    let platformParams = {};
    if (device === "android") {
      platformParams = {
        mobi_app: "android"
      };
    }
    if (device === "ipad") {
      platformParams = {
        // has avatar, date, etc
        // see BewlyBewly usage
        mobi_app: "iphone",
        device: "pad"
      };
    }
    const res = await gmrequest.get(HOST_APP + "/x/v2/feed/index", {
      responseType: "json",
      params: {
        build: "1",
        ...platformParams,
        idx: (Date.now() / 1e3).toFixed(0) + "0" + Math.trunc(Math.random() * 1e3).toString().padStart(3, "0")
      }
    });
    const json = res.data;
    if (!json.data) {
      if (json.code === -663) {
        throw new RecReqError(json);
      }
      toast(`${APP_NAME}: 未知错误, 请联系开发者

  code=${json.code} message=${json.message || ""}`, 5e3);
      return [];
    }
    const items = ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.items) || [];
    return items;
  }
  const tryfn = pretry2(getRecommend, {
    times: 5,
    timeout: 2e3,
    onerror(err, index) {
      console.info("[%s] tryGetRecommend onerror: index=%s", APP_NAME, index, err);
    }
  });
  async function tryGetRecommend(device) {
    try {
      return await tryfn(device);
    } catch (e2) {
      if (e2 instanceof RetryError_1) {
        console.error(e2.errors);
        const msg = [`请求出错, 已重试${e2.times}次:`, ...e2.errors.map((innerError, index) => `  ${index + 1}) ${innerError.message}`), "", "请重新获取 access_key 后重试~"].join("\n");
        toast(msg, 5e3);
      }
      throw e2;
    }
  }
  class AppRecService {
    constructor() {
      __publicField(this, "hasMore", true);
    }
    loadMore() {
      return this.getRecommendTimes(2);
    }
    // 一次10个不够, 多来几次
    async getRecommendTimes(times) {
      let list = [];
      let device = settings.appApiDecice;
      if (device !== AppApiDevice.ipad && device !== AppApiDevice.android) {
        device = AppApiDevice.ipad;
      }
      const parallel = async () => {
        list = (await Promise.all(new Array(times).fill(0).map(() => tryGetRecommend(device)))).flat();
      };
      await parallel();
      list = list.filter((item) => {
        var _a2, _b2;
        if ((_a2 = item.card_goto) == null ? void 0 : _a2.includes("ad"))
          return false;
        if ((_b2 = item.goto) == null ? void 0 : _b2.includes("ad"))
          return false;
        if (item.ad_info)
          return false;
        if (item.card_goto === "banner")
          return false;
        return true;
      });
      list = lodash.uniqBy(list, (item) => item.param);
      return list.map((item) => {
        return {
          ...item,
          api: "app",
          device,
          // android | ipad
          uniqId: item.param + "-" + crypto.randomUUID()
        };
      });
    }
  }
  __publicField(AppRecService, "PAGE_SIZE", 10);
  const debug$4 = baseDebug.extend("service");
  const recItemUniqer = (item) => item.api === ApiType.separator ? item.uniqId : lookinto(item, {
    "pc": (item2) => item2.bvid,
    "app": (item2) => item2.param,
    "dynamic": (item2) => item2.modules.module_dynamic.major.archive.bvid,
    "watchlater": (item2) => item2.bvid,
    "fav": (item2) => item2.bvid,
    "popular-general": (item2) => item2.bvid,
    "popular-weekly": (item2) => item2.bvid
  });
  function uniqConcat(existing, newItems) {
    const ids2 = existing.map(recItemUniqer);
    newItems = lodash.uniqBy(newItems, recItemUniqer);
    return existing.concat(newItems.filter((item) => {
      return !ids2.includes(recItemUniqer(item));
    }));
  }
  const usePcApi = (tab2) => tab2 === "keep-follow-only" || tab2 === "recommend-pc";
  async function getMinCount(count, fetcherOptions, filterMultiplier = 5) {
    const {
      tab: tab2,
      abortSignal,
      pcRecService,
      serviceMap
    } = fetcherOptions;
    const appRecService = new AppRecService();
    let items = [];
    let hasMore = true;
    const addMore = async (restCount) => {
      let cur = [];
      const service = getIService(serviceMap, tab2);
      if (service) {
        cur = await service.loadMore(abortSignal) || [];
        hasMore = service.hasMore;
        items = items.concat(cur);
        items = lodash.uniqBy(items, recItemUniqer);
        return;
      }
      let times;
      if (tab2 === "keep-follow-only") {
        times = 8;
        debug$4("getMinCount: addMore(restCount = %s) times=%s", restCount, times);
      } else {
        const pagesize = usePcApi(tab2) ? PcRecService.PAGE_SIZE : AppRecService.PAGE_SIZE;
        const multipler = anyFilterEnabled(tab2) ? filterMultiplier : 1.2;
        times = Math.ceil(restCount * multipler / pagesize);
        debug$4("getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s", restCount, multipler, pagesize, times);
      }
      cur = usePcApi(tab2) ? await pcRecService.getRecommendTimes(times, abortSignal) : await appRecService.getRecommendTimes(times);
      cur = filterRecItems(cur, tab2);
      items = items.concat(cur);
      items = lodash.uniqBy(items, recItemUniqer);
    };
    await addMore(count);
    while (true) {
      if (abortSignal == null ? void 0 : abortSignal.aborted) {
        debug$4("getMinCount: break for abortSignal");
        break;
      }
      if (!hasMore) {
        debug$4("getMinCount: break for tab=%s hasMore=false", tab2);
        break;
      }
      const len = items.filter((x2) => x2.api !== ApiType.separator).length;
      if (len >= count) {
        break;
      }
      await addMore(count - items.length);
    }
    return items;
  }
  async function refreshForHome(fetcherOptions) {
    let items = await getMinCount(getColumnCount(void 0, false) * 2, fetcherOptions, 5);
    if (fetcherOptions.tab === "watchlater") {
      items = items.slice(0, 20);
    }
    return items;
  }
  async function refreshForGrid(fetcherOptions) {
    return getMinCount(getColumnCount() * 3 + 1, fetcherOptions, 5);
  }
  async function getRecommendTimes(times, tab2, pcRecService) {
    let items = usePcApi(tab2) ? await pcRecService.getRecommendTimes(times) : await new AppRecService().getRecommendTimes(times);
    items = filterRecItems(items, tab2);
    return items;
  }
  var observerMap = /* @__PURE__ */ new Map();
  var RootIds = /* @__PURE__ */ new WeakMap();
  var rootId = 0;
  var unsupportedValue = void 0;
  function getRootId(root2) {
    if (!root2)
      return "0";
    if (RootIds.has(root2))
      return RootIds.get(root2);
    rootId += 1;
    RootIds.set(root2, rootId.toString());
    return RootIds.get(root2);
  }
  function optionsToId(options) {
    return Object.keys(options).sort().filter(
      (key2) => options[key2] !== void 0
    ).map((key2) => {
      return `${key2}_${key2 === "root" ? getRootId(options.root) : options[key2]}`;
    }).toString();
  }
  function createObserver(options) {
    let id = optionsToId(options);
    let instance = observerMap.get(id);
    if (!instance) {
      const elements = /* @__PURE__ */ new Map();
      let thresholds;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          var _a2;
          const inView = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
          if (options.trackVisibility && typeof entry.isVisible === "undefined") {
            entry.isVisible = inView;
          }
          (_a2 = elements.get(entry.target)) == null ? void 0 : _a2.forEach((callback) => {
            callback(inView, entry);
          });
        });
      }, options);
      thresholds = observer.thresholds || (Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0]);
      instance = {
        id,
        observer,
        elements
      };
      observerMap.set(id, instance);
    }
    return instance;
  }
  function observe(element, callback, options = {}, fallbackInView = unsupportedValue) {
    if (typeof window.IntersectionObserver === "undefined" && fallbackInView !== void 0) {
      const bounds = element.getBoundingClientRect();
      callback(fallbackInView, {
        isIntersecting: fallbackInView,
        target: element,
        intersectionRatio: typeof options.threshold === "number" ? options.threshold : 0,
        time: 0,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: bounds
      });
      return () => {
      };
    }
    const { id, observer, elements } = createObserver(options);
    let callbacks = elements.get(element) || [];
    if (!elements.has(element)) {
      elements.set(element, callbacks);
    }
    callbacks.push(callback);
    observer.observe(element);
    return function unobserve() {
      callbacks.splice(callbacks.indexOf(callback), 1);
      if (callbacks.length === 0) {
        elements.delete(element);
        observer.unobserve(element);
      }
      if (elements.size === 0) {
        observer.disconnect();
        observerMap.delete(id);
      }
    };
  }
  function useInView({
    threshold,
    delay: delay2,
    trackVisibility,
    rootMargin,
    root: root2,
    triggerOnce,
    skip,
    initialInView,
    fallbackInView,
    onChange
  } = {}) {
    var _a2;
    const [ref, setRef] = React__default__namespace.useState(null);
    const callback = React__default__namespace.useRef();
    const [state, setState] = React__default__namespace.useState({
      inView: !!initialInView,
      entry: void 0
    });
    callback.current = onChange;
    React__default__namespace.useEffect(
      () => {
        if (skip || !ref)
          return;
        let unobserve;
        unobserve = observe(
          ref,
          (inView, entry) => {
            setState({
              inView,
              entry
            });
            if (callback.current)
              callback.current(inView, entry);
            if (entry.isIntersecting && triggerOnce && unobserve) {
              unobserve();
              unobserve = void 0;
            }
          },
          {
            root: root2,
            rootMargin,
            threshold,
            // @ts-ignore
            trackVisibility,
            // @ts-ignore
            delay: delay2
          },
          fallbackInView
        );
        return () => {
          if (unobserve) {
            unobserve();
          }
        };
      },
      // We break the rule here, because we aren't including the actual `threshold` variable
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        // If the threshold is an array, convert it to a string, so it won't change between renders.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        Array.isArray(threshold) ? threshold.toString() : threshold,
        ref,
        root2,
        rootMargin,
        triggerOnce,
        skip,
        trackVisibility,
        fallbackInView,
        delay2
      ]
    );
    const entryTarget = (_a2 = state.entry) == null ? void 0 : _a2.target;
    const previousEntryTarget = React__default__namespace.useRef();
    if (!ref && entryTarget && !triggerOnce && !skip && previousEntryTarget.current !== entryTarget) {
      previousEntryTarget.current = entryTarget;
      setState({
        inView: !!initialInView,
        entry: void 0
      });
    }
    const result = [setRef, state.inView, state.entry];
    result.ref = result[0];
    result.inView = result[1];
    result.entry = result[2];
    return result;
  }
  const debug$3 = baseDebug.extend("components:RecGrid");
  const CardClassNames = {
    card: /* @__PURE__ */ css$1({
      name: "pqxyg1",
      styles: "border:2px solid transparent;.bili-video-card__info{padding-left:2px;padding-bottom:1px;margin-top:calc(var(--info-margin-top) - 1px);}"
    }),
    cardActive: /* @__PURE__ */ css$1("border-color:", colorPrimaryValue, ";border-radius:", borderRadiusValue, ";overflow:hidden;box-shadow:0px 0px 9px 4px ", colorPrimaryValue, ";", "")
  };
  var _ref$5 = {
    name: "198pn9m",
    styles: "grid-column:1/-1;.ant-divider-inner-text a{color:var(--ant-color-link);&:hover{color:var(--ant-color-primary);}}"
  };
  var _ref2$5 = {
    name: "1hce7io",
    styles: "padding:30px 0;display:flex;align-items:center;justify-content:center;font-size:120%"
  };
  const RecGrid = React__default.forwardRef(function RecGrid2({
    infiteScrollUseWindow,
    shortcutEnabled,
    onScrollToTop,
    className,
    scrollerRef,
    setRefreshing: setUpperRefreshing,
    setExtraInfo
  }, ref) {
    const {
      useNarrowMode,
      styleFancy
    } = useSettingsSnapshot();
    const tab2 = useCurrentSourceTab();
    const [loadCompleteCount, setLoadCompleteCount] = React__default.useState(0);
    const preAction = useMemoizedFn(() => {
      clearActiveIndex();
      updateExtraInfo(tab2);
    });
    const postAction = useMemoizedFn(() => {
      clearActiveIndex();
      setLoadCompleteCount(1);
      updateExtraInfo(tab2);
      queueMicrotask(checkShouldLoadMore);
    });
    const updateExtraInfo = useMemoizedFn((tab22) => {
      var _a2;
      const info = ((_a2 = getIService(serviceMap, tab22)) == null ? void 0 : _a2.usageInfo) ?? null;
      setExtraInfo == null ? void 0 : setExtraInfo(info);
    });
    const {
      refresh,
      items,
      setItems,
      error: refreshError,
      refreshing,
      refreshedAt,
      getRefreshedAt,
      swr,
      hasMore,
      setHasMore,
      refreshAbortController,
      pcRecService,
      serviceMap
    } = useRefresh({
      tab: tab2,
      debug: debug$3,
      fetcher: refreshForGrid,
      recreateService: true,
      preAction,
      postAction,
      onScrollToTop,
      setUpperRefreshing
    });
    useMount$1(refresh);
    React__default.useImperativeHandle(ref, () => ({
      refresh
    }), []);
    const goOutAt = React__default.useRef();
    useEventListener("visibilitychange", (e2) => {
      const visible = document.visibilityState === "visible";
      if (!visible) {
        goOutAt.current = Date.now();
        return;
      }
      if (refreshing)
        return;
      if (loadMoreRequesting.current[refreshedAt])
        return;
      if (tab2 === "watchlater" && goOutAt.current && Date.now() - goOutAt.current > ms$1("1h")) {
        refresh(true, {
          watchlaterKeepOrder: true
        });
      }
    }, {
      target: document
    });
    const loadMoreRequesting = React__default.useRef({});
    const loadMore = useMemoizedFn(async () => {
      if (!hasMore)
        return;
      if (refreshing)
        return;
      const refreshAtWhenStart = refreshedAt;
      if (loadMoreRequesting.current[refreshAtWhenStart])
        return;
      loadMoreRequesting.current = {
        [refreshAtWhenStart]: true
      };
      let newItems = items;
      let newHasMore = true;
      try {
        const service = getIService(serviceMap, tab2);
        if (service) {
          const more = await service.loadMore(refreshAbortController.signal) || [];
          newItems = uniqConcat(newItems, more);
          newHasMore = service.hasMore;
        } else {
          while (!(newItems.length > items.length)) {
            const times = tab2 === "keep-follow-only" ? 5 : 2;
            const more = await getRecommendTimes(times, tab2, pcRecService);
            newItems = uniqConcat(newItems, more);
          }
        }
      } catch (e2) {
        loadMoreRequesting.current[refreshAtWhenStart] = false;
        throw e2;
      }
      if (refreshAtWhenStart !== getRefreshedAt()) {
        debug$3("loadMore: skip update for mismatch refreshedAt, %s != %s", refreshAtWhenStart, getRefreshedAt());
        return;
      }
      debug$3("loadMore: seq(%s) len %s -> %s", loadCompleteCount + 1, items.length, newItems.length);
      setHasMore(newHasMore);
      setItems(newItems);
      setLoadCompleteCount((c2) => c2 + 1);
      loadMoreRequesting.current[refreshAtWhenStart] = false;
      checkShouldLoadMore();
    });
    const checkShouldLoadMore = useMemoizedFn(async () => {
      const ms2 = isSafari ? 100 : 50;
      await delay(ms2);
      debug$3("checkShouldLoadMore(): footerInView = %s", footerInViewRef.current);
      if (footerInViewRef.current) {
        loadMore();
      }
    });
    const containerRef = React__default.useRef(null);
    const getScrollerRect = useMemoizedFn(() => {
      var _a2;
      if (infiteScrollUseWindow) {
        const yStart = getHeaderHeight() + 50;
        return new DOMRect(0, yStart, window.innerWidth, window.innerHeight - yStart);
      } else {
        return (_a2 = scrollerRef == null ? void 0 : scrollerRef.current) == null ? void 0 : _a2.getBoundingClientRect();
      }
    });
    const modalDislikeVisible = useModalDislikeVisible();
    const videoItems = React__default.useMemo(() => {
      return items.filter((x2) => x2.api !== ApiType.separator);
    }, [items]);
    const videoCardEmittersMap = React__default.useMemo(() => /* @__PURE__ */ new Map(), [refreshedAt]);
    const videoCardEmitters = React__default.useMemo(() => {
      return videoItems.map(({
        uniqId: cacheKey2
      }) => {
        return videoCardEmittersMap.get(cacheKey2) || (() => {
          const instance = mitt();
          videoCardEmittersMap.set(cacheKey2, instance);
          return instance;
        })();
      });
    }, [videoItems]);
    const {
      activeIndex,
      clearActiveIndex
    } = useShortcut({
      enabled: shortcutEnabled && !modalDislikeVisible,
      refresh,
      maxIndex: videoItems.length - 1,
      containerRef,
      getScrollerRect,
      videoCardEmitters,
      changeScrollY: infiteScrollUseWindow ? function({
        offset,
        absolute
      }) {
        const scroller = document.documentElement;
        if (typeof offset === "number") {
          scroller.scrollTop += offset;
          return;
        }
        if (typeof absolute === "number") {
          scroller.scrollTop = absolute;
          return;
        }
      } : void 0
    });
    const isInternalTesting = getIsInternalTesting();
    const handleRemoveCard = useMemoizedFn((item, data) => {
      setItems((items2) => {
        const index = items2.findIndex((x2) => x2.uniqId === item.uniqId);
        if (index === -1)
          return items2;
        const newItems = items2.slice();
        newItems.splice(index, 1);
        AntdMessage.success(`已移除: ${data.title}`, 4);
        if (tab2 === "watchlater") {
          serviceMap.watchlater.count--;
          updateExtraInfo(tab2);
        }
        if (tab2 === "fav") {
          serviceMap.fav.total--;
          updateExtraInfo(tab2);
        }
        return newItems;
      });
    });
    const handleMoveCardToFirst = useMemoizedFn((item, data) => {
      setItems((items2) => {
        const currentItem = items2.find((x2) => x2.uniqId === item.uniqId);
        if (!currentItem)
          return items2;
        const index = items2.indexOf(currentItem);
        const newItems = items2.slice();
        newItems.splice(index, 1);
        const newIndex = newItems.findIndex((x2) => x2.api !== ApiType.separator);
        newItems.splice(newIndex, 0, currentItem);
        return newItems;
      });
    });
    const {
      ref: footerRef,
      inView: __footerInView
    } = useInView({
      root: infiteScrollUseWindow ? null : (scrollerRef == null ? void 0 : scrollerRef.current) || null,
      rootMargin: `0px 0px ${window.innerHeight}px 0px`,
      onChange(inView) {
        if (inView) {
          debug$3("footerInView change to visible", inView);
          loadMore();
        }
      }
    });
    const footerInViewRef = useLatest(__footerInView);
    const footer = /* @__PURE__ */ jsx("div", {
      ref: footerRef,
      css: _ref2$5,
      children: !refreshing && /* @__PURE__ */ jsx(Fragment, {
        children: hasMore ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(IconPark, {
            name: "Loading",
            fill: colorPrimaryValue,
            spin: true,
            size: 40,
            style: {
              marginRight: 10
            }
          }), "加载中~"]
        }) : "没有更多了~"
      })
    });
    const gridClassName = cx(
      `${APP_NAME}-video-grid`,
      // for customize css
      videoGrid,
      styleFancy ? videoGridFancy : isInternalTesting ? videoGridInternalTesting : videoGridNewHomepage,
      // default
      useNarrowMode && narrowMode$1,
      // 居中
      className
    );
    const showSkeleton = !items.length || refreshError || refreshing && !swr;
    if (showSkeleton) {
      return /* @__PURE__ */ jsx("div", {
        className: videoGridContainer,
        children: /* @__PURE__ */ jsx("div", {
          className: gridClassName,
          children: new Array(28).fill(void 0).map((_, index) => {
            return /* @__PURE__ */ jsx(VideoCard, {
              loading: true,
              className: CardClassNames.card
            }, index);
          })
        })
      });
    }
    return /* @__PURE__ */ jsxs("div", {
      style: {
        minHeight: "100%"
      },
      className: videoGridContainer,
      children: [/* @__PURE__ */ jsx("div", {
        ref: containerRef,
        className: gridClassName,
        children: items.map((item) => {
          if (item.api === ApiType.separator) {
            return /* @__PURE__ */ jsx(antd.Divider, {
              css: _ref$5,
              orientation: "left",
              children: item.content
            }, item.uniqId);
          } else {
            const index = videoItems.findIndex((x2) => x2.uniqId === item.uniqId);
            const active = index === activeIndex;
            return /* @__PURE__ */ jsx(VideoCard, {
              className: cx(CardClassNames.card, {
                [CardClassNames.cardActive]: active
              }),
              item,
              active,
              onRemoveCurrent: handleRemoveCard,
              onMoveToFirst: handleMoveCardToFirst,
              onRefresh: refresh,
              emitter: videoCardEmitters[index]
            }, item.uniqId);
          }
        })
      }), footer]
    });
  });
  const btnAccessKeyHelpLink = /* @__PURE__ */ jsx(antd.Button, {
    target: "_blank",
    href: "https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E",
    children: "access_key 说明"
  });
  function AccessKeyManage({
    style,
    className
  }) {
    const {
      runAsync,
      loading
    } = useRequest(getAccessKey, {
      manual: true
    });
    const {
      accessKey
    } = useSettingsSnapshot();
    const onDeleteAccessKey = deleteAccessKey;
    return /* @__PURE__ */ jsx(antd.Space, {
      size: "small",
      style,
      className,
      children: !accessKey ? /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(antd.Button, {
          onClick: runAsync,
          disabled: loading,
          children: /* @__PURE__ */ jsx("span", {
            children: "获取 access_key"
          })
        }), btnAccessKeyHelpLink]
      }) : /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(antd.Button, {
          onClick: runAsync,
          disabled: loading,
          children: /* @__PURE__ */ jsx("span", {
            children: "重新获取 access_key"
          })
        }), /* @__PURE__ */ jsx(antd.Button, {
          onClick: onDeleteAccessKey,
          children: /* @__PURE__ */ jsx("span", {
            children: "删除 access_key"
          })
        }), btnAccessKeyHelpLink]
      })
    });
  }
  function useCombinedRefs() {
    for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
      refs[_key] = arguments[_key];
    }
    return React__default.useMemo(
      () => (node2) => {
        refs.forEach((ref) => ref(node2));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      refs
    );
  }
  const canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
  function isWindow(element) {
    const elementString = Object.prototype.toString.call(element);
    return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
    elementString === "[object global]";
  }
  function isNode(node2) {
    return "nodeType" in node2;
  }
  function getWindow(target) {
    var _target$ownerDocument, _target$ownerDocument2;
    if (!target) {
      return window;
    }
    if (isWindow(target)) {
      return target;
    }
    if (!isNode(target)) {
      return window;
    }
    return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
  }
  function isDocument(node2) {
    const {
      Document
    } = getWindow(node2);
    return node2 instanceof Document;
  }
  function isHTMLElement(node2) {
    if (isWindow(node2)) {
      return false;
    }
    return node2 instanceof getWindow(node2).HTMLElement;
  }
  function isSVGElement(node2) {
    return node2 instanceof getWindow(node2).SVGElement;
  }
  function getOwnerDocument(target) {
    if (!target) {
      return document;
    }
    if (isWindow(target)) {
      return target.document;
    }
    if (!isNode(target)) {
      return document;
    }
    if (isDocument(target)) {
      return target;
    }
    if (isHTMLElement(target) || isSVGElement(target)) {
      return target.ownerDocument;
    }
    return document;
  }
  const useIsomorphicLayoutEffect = canUseDOM ? React__default.useLayoutEffect : React__default.useEffect;
  function useEvent(handler) {
    const handlerRef = React__default.useRef(handler);
    useIsomorphicLayoutEffect(() => {
      handlerRef.current = handler;
    });
    return React__default.useCallback(function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return handlerRef.current == null ? void 0 : handlerRef.current(...args);
    }, []);
  }
  function useInterval() {
    const intervalRef = React__default.useRef(null);
    const set = React__default.useCallback((listener, duration2) => {
      intervalRef.current = setInterval(listener, duration2);
    }, []);
    const clear = React__default.useCallback(() => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);
    return [set, clear];
  }
  function useLatestValue(value, dependencies) {
    if (dependencies === void 0) {
      dependencies = [value];
    }
    const valueRef = React__default.useRef(value);
    useIsomorphicLayoutEffect(() => {
      if (valueRef.current !== value) {
        valueRef.current = value;
      }
    }, dependencies);
    return valueRef;
  }
  function useLazyMemo(callback, dependencies) {
    const valueRef = React__default.useRef();
    return React__default.useMemo(
      () => {
        const newValue = callback(valueRef.current);
        valueRef.current = newValue;
        return newValue;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...dependencies]
    );
  }
  function useNodeRef(onChange) {
    const onChangeHandler = useEvent(onChange);
    const node2 = React__default.useRef(null);
    const setNodeRef = React__default.useCallback(
      (element) => {
        if (element !== node2.current) {
          onChangeHandler == null ? void 0 : onChangeHandler(element, node2.current);
        }
        node2.current = element;
      },
      //eslint-disable-next-line
      []
    );
    return [node2, setNodeRef];
  }
  function usePrevious(value) {
    const ref = React__default.useRef();
    React__default.useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }
  let ids = {};
  function useUniqueId(prefix2, value) {
    return React__default.useMemo(() => {
      if (value) {
        return value;
      }
      const id = ids[prefix2] == null ? 0 : ids[prefix2] + 1;
      ids[prefix2] = id;
      return prefix2 + "-" + id;
    }, [prefix2, value]);
  }
  function createAdjustmentFn(modifier) {
    return function(object) {
      for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        adjustments[_key - 1] = arguments[_key];
      }
      return adjustments.reduce((accumulator, adjustment) => {
        const entries = Object.entries(adjustment);
        for (const [key2, valueAdjustment] of entries) {
          const value = accumulator[key2];
          if (value != null) {
            accumulator[key2] = value + modifier * valueAdjustment;
          }
        }
        return accumulator;
      }, {
        ...object
      });
    };
  }
  const add = /* @__PURE__ */ createAdjustmentFn(1);
  const subtract = /* @__PURE__ */ createAdjustmentFn(-1);
  function hasViewportRelativeCoordinates(event) {
    return "clientX" in event && "clientY" in event;
  }
  function isKeyboardEvent(event) {
    if (!event) {
      return false;
    }
    const {
      KeyboardEvent
    } = getWindow(event.target);
    return KeyboardEvent && event instanceof KeyboardEvent;
  }
  function isTouchEvent(event) {
    if (!event) {
      return false;
    }
    const {
      TouchEvent
    } = getWindow(event.target);
    return TouchEvent && event instanceof TouchEvent;
  }
  function getEventCoordinates(event) {
    if (isTouchEvent(event)) {
      if (event.touches && event.touches.length) {
        const {
          clientX: x2,
          clientY: y2
        } = event.touches[0];
        return {
          x: x2,
          y: y2
        };
      } else if (event.changedTouches && event.changedTouches.length) {
        const {
          clientX: x2,
          clientY: y2
        } = event.changedTouches[0];
        return {
          x: x2,
          y: y2
        };
      }
    }
    if (hasViewportRelativeCoordinates(event)) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    }
    return null;
  }
  const CSS = /* @__PURE__ */ Object.freeze({
    Translate: {
      toString(transform) {
        if (!transform) {
          return;
        }
        const {
          x: x2,
          y: y2
        } = transform;
        return "translate3d(" + (x2 ? Math.round(x2) : 0) + "px, " + (y2 ? Math.round(y2) : 0) + "px, 0)";
      }
    },
    Scale: {
      toString(transform) {
        if (!transform) {
          return;
        }
        const {
          scaleX,
          scaleY
        } = transform;
        return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
      }
    },
    Transform: {
      toString(transform) {
        if (!transform) {
          return;
        }
        return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
      }
    },
    Transition: {
      toString(_ref13) {
        let {
          property,
          duration: duration2,
          easing
        } = _ref13;
        return property + " " + duration2 + "ms " + easing;
      }
    }
  });
  const SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
  function findFirstFocusableNode(element) {
    if (element.matches(SELECTOR)) {
      return element;
    }
    return element.querySelector(SELECTOR);
  }
  const hiddenStyles = {
    display: "none"
  };
  function HiddenText(_ref13) {
    let {
      id,
      value
    } = _ref13;
    return React__default.createElement("div", {
      id,
      style: hiddenStyles
    }, value);
  }
  function LiveRegion(_ref13) {
    let {
      id,
      announcement,
      ariaLiveType = "assertive"
    } = _ref13;
    const visuallyHidden = {
      position: "fixed",
      width: 1,
      height: 1,
      margin: -1,
      border: 0,
      padding: 0,
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      clipPath: "inset(100%)",
      whiteSpace: "nowrap"
    };
    return React__default.createElement("div", {
      id,
      style: visuallyHidden,
      role: "status",
      "aria-live": ariaLiveType,
      "aria-atomic": true
    }, announcement);
  }
  function useAnnouncement() {
    const [announcement, setAnnouncement] = React__default.useState("");
    const announce = React__default.useCallback((value) => {
      if (value != null) {
        setAnnouncement(value);
      }
    }, []);
    return {
      announce,
      announcement
    };
  }
  const DndMonitorContext = /* @__PURE__ */ React__default.createContext(null);
  function useDndMonitor(listener) {
    const registerListener = React__default.useContext(DndMonitorContext);
    React__default.useEffect(() => {
      if (!registerListener) {
        throw new Error("useDndMonitor must be used within a children of <DndContext>");
      }
      const unsubscribe = registerListener(listener);
      return unsubscribe;
    }, [listener, registerListener]);
  }
  function useDndMonitorProvider() {
    const [listeners2] = React__default.useState(() => /* @__PURE__ */ new Set());
    const registerListener = React__default.useCallback((listener) => {
      listeners2.add(listener);
      return () => listeners2.delete(listener);
    }, [listeners2]);
    const dispatch = React__default.useCallback((_ref13) => {
      let {
        type,
        event
      } = _ref13;
      listeners2.forEach((listener) => {
        var _listener$type;
        return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
      });
    }, [listeners2]);
    return [dispatch, registerListener];
  }
  const defaultScreenReaderInstructions = {
    draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
  };
  const defaultAnnouncements = {
    onDragStart(_ref13) {
      let {
        active
      } = _ref13;
      return "Picked up draggable item " + active.id + ".";
    },
    onDragOver(_ref22) {
      let {
        active,
        over
      } = _ref22;
      if (over) {
        return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
      }
      return "Draggable item " + active.id + " is no longer over a droppable area.";
    },
    onDragEnd(_ref32) {
      let {
        active,
        over
      } = _ref32;
      if (over) {
        return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
      }
      return "Draggable item " + active.id + " was dropped.";
    },
    onDragCancel(_ref42) {
      let {
        active
      } = _ref42;
      return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
    }
  };
  function Accessibility(_ref13) {
    let {
      announcements = defaultAnnouncements,
      container,
      hiddenTextDescribedById,
      screenReaderInstructions = defaultScreenReaderInstructions
    } = _ref13;
    const {
      announce,
      announcement
    } = useAnnouncement();
    const liveRegionId = useUniqueId("DndLiveRegion");
    const [mounted, setMounted] = React__default.useState(false);
    React__default.useEffect(() => {
      setMounted(true);
    }, []);
    useDndMonitor(React__default.useMemo(() => ({
      onDragStart(_ref22) {
        let {
          active
        } = _ref22;
        announce(announcements.onDragStart({
          active
        }));
      },
      onDragMove(_ref32) {
        let {
          active,
          over
        } = _ref32;
        if (announcements.onDragMove) {
          announce(announcements.onDragMove({
            active,
            over
          }));
        }
      },
      onDragOver(_ref42) {
        let {
          active,
          over
        } = _ref42;
        announce(announcements.onDragOver({
          active,
          over
        }));
      },
      onDragEnd(_ref52) {
        let {
          active,
          over
        } = _ref52;
        announce(announcements.onDragEnd({
          active,
          over
        }));
      },
      onDragCancel(_ref62) {
        let {
          active,
          over
        } = _ref62;
        announce(announcements.onDragCancel({
          active,
          over
        }));
      }
    }), [announce, announcements]));
    if (!mounted) {
      return null;
    }
    const markup = React__default.createElement(React__default.Fragment, null, React__default.createElement(HiddenText, {
      id: hiddenTextDescribedById,
      value: screenReaderInstructions.draggable
    }), React__default.createElement(LiveRegion, {
      id: liveRegionId,
      announcement
    }));
    return container ? require$$0.createPortal(markup, container) : markup;
  }
  var Action;
  (function(Action2) {
    Action2["DragStart"] = "dragStart";
    Action2["DragMove"] = "dragMove";
    Action2["DragEnd"] = "dragEnd";
    Action2["DragCancel"] = "dragCancel";
    Action2["DragOver"] = "dragOver";
    Action2["RegisterDroppable"] = "registerDroppable";
    Action2["SetDroppableDisabled"] = "setDroppableDisabled";
    Action2["UnregisterDroppable"] = "unregisterDroppable";
  })(Action || (Action = {}));
  function noop() {
  }
  function useSensor(sensor, options) {
    return React__default.useMemo(
      () => ({
        sensor,
        options: options != null ? options : {}
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sensor, options]
    );
  }
  function useSensors() {
    for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
      sensors[_key] = arguments[_key];
    }
    return React__default.useMemo(
      () => [...sensors].filter((sensor) => sensor != null),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...sensors]
    );
  }
  const defaultCoordinates = /* @__PURE__ */ Object.freeze({
    x: 0,
    y: 0
  });
  function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  function sortCollisionsAsc(_ref13, _ref22) {
    let {
      data: {
        value: a2
      }
    } = _ref13;
    let {
      data: {
        value: b2
      }
    } = _ref22;
    return a2 - b2;
  }
  function sortCollisionsDesc(_ref32, _ref42) {
    let {
      data: {
        value: a2
      }
    } = _ref32;
    let {
      data: {
        value: b2
      }
    } = _ref42;
    return b2 - a2;
  }
  function getFirstCollision(collisions, property) {
    if (!collisions || collisions.length === 0) {
      return null;
    }
    const [firstCollision] = collisions;
    return property ? firstCollision[property] : firstCollision;
  }
  function centerOfRectangle(rect, left, top) {
    if (left === void 0) {
      left = rect.left;
    }
    if (top === void 0) {
      top = rect.top;
    }
    return {
      x: left + rect.width * 0.5,
      y: top + rect.height * 0.5
    };
  }
  const closestCenter = (_ref13) => {
    let {
      collisionRect,
      droppableRects,
      droppableContainers
    } = _ref13;
    const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
    const collisions = [];
    for (const droppableContainer of droppableContainers) {
      const {
        id
      } = droppableContainer;
      const rect = droppableRects.get(id);
      if (rect) {
        const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: distBetween
          }
        });
      }
    }
    return collisions.sort(sortCollisionsAsc);
  };
  function getIntersectionRatio(entry, target) {
    const top = Math.max(target.top, entry.top);
    const left = Math.max(target.left, entry.left);
    const right = Math.min(target.left + target.width, entry.left + entry.width);
    const bottom = Math.min(target.top + target.height, entry.top + entry.height);
    const width = right - left;
    const height = bottom - top;
    if (left < right && top < bottom) {
      const targetArea = target.width * target.height;
      const entryArea = entry.width * entry.height;
      const intersectionArea = width * height;
      const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
      return Number(intersectionRatio.toFixed(4));
    }
    return 0;
  }
  const rectIntersection = (_ref13) => {
    let {
      collisionRect,
      droppableRects,
      droppableContainers
    } = _ref13;
    const collisions = [];
    for (const droppableContainer of droppableContainers) {
      const {
        id
      } = droppableContainer;
      const rect = droppableRects.get(id);
      if (rect) {
        const intersectionRatio = getIntersectionRatio(rect, collisionRect);
        if (intersectionRatio > 0) {
          collisions.push({
            id,
            data: {
              droppableContainer,
              value: intersectionRatio
            }
          });
        }
      }
    }
    return collisions.sort(sortCollisionsDesc);
  };
  function adjustScale(transform, rect1, rect2) {
    return {
      ...transform,
      scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
      scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
    };
  }
  function getRectDelta(rect1, rect2) {
    return rect1 && rect2 ? {
      x: rect1.left - rect2.left,
      y: rect1.top - rect2.top
    } : defaultCoordinates;
  }
  function createRectAdjustmentFn(modifier) {
    return function adjustClientRect(rect) {
      for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        adjustments[_key - 1] = arguments[_key];
      }
      return adjustments.reduce((acc, adjustment) => ({
        ...acc,
        top: acc.top + modifier * adjustment.y,
        bottom: acc.bottom + modifier * adjustment.y,
        left: acc.left + modifier * adjustment.x,
        right: acc.right + modifier * adjustment.x
      }), {
        ...rect
      });
    };
  }
  const getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
  function parseTransform(transform) {
    if (transform.startsWith("matrix3d(")) {
      const transformArray = transform.slice(9, -1).split(/, /);
      return {
        x: +transformArray[12],
        y: +transformArray[13],
        scaleX: +transformArray[0],
        scaleY: +transformArray[5]
      };
    } else if (transform.startsWith("matrix(")) {
      const transformArray = transform.slice(7, -1).split(/, /);
      return {
        x: +transformArray[4],
        y: +transformArray[5],
        scaleX: +transformArray[0],
        scaleY: +transformArray[3]
      };
    }
    return null;
  }
  function inverseTransform(rect, transform, transformOrigin) {
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) {
      return rect;
    }
    const {
      scaleX,
      scaleY,
      x: translateX,
      y: translateY
    } = parsedTransform;
    const x2 = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
    const y2 = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
    const w2 = scaleX ? rect.width / scaleX : rect.width;
    const h2 = scaleY ? rect.height / scaleY : rect.height;
    return {
      width: w2,
      height: h2,
      top: y2,
      right: x2 + w2,
      bottom: y2 + h2,
      left: x2
    };
  }
  const defaultOptions = {
    ignoreTransform: false
  };
  function getClientRect(element, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    let rect = element.getBoundingClientRect();
    if (options.ignoreTransform) {
      const {
        transform,
        transformOrigin
      } = getWindow(element).getComputedStyle(element);
      if (transform) {
        rect = inverseTransform(rect, transform, transformOrigin);
      }
    }
    const {
      top,
      left,
      width,
      height,
      bottom,
      right
    } = rect;
    return {
      top,
      left,
      width,
      height,
      bottom,
      right
    };
  }
  function getTransformAgnosticClientRect(element) {
    return getClientRect(element, {
      ignoreTransform: true
    });
  }
  function getWindowClientRect(element) {
    const width = element.innerWidth;
    const height = element.innerHeight;
    return {
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height
    };
  }
  function isFixed(node2, computedStyle) {
    if (computedStyle === void 0) {
      computedStyle = getWindow(node2).getComputedStyle(node2);
    }
    return computedStyle.position === "fixed";
  }
  function isScrollable(element, computedStyle) {
    if (computedStyle === void 0) {
      computedStyle = getWindow(element).getComputedStyle(element);
    }
    const overflowRegex = /(auto|scroll|overlay)/;
    const properties2 = ["overflow", "overflowX", "overflowY"];
    return properties2.some((property) => {
      const value = computedStyle[property];
      return typeof value === "string" ? overflowRegex.test(value) : false;
    });
  }
  function getScrollableAncestors(element, limit2) {
    const scrollParents = [];
    function findScrollableAncestors(node2) {
      if (limit2 != null && scrollParents.length >= limit2) {
        return scrollParents;
      }
      if (!node2) {
        return scrollParents;
      }
      if (isDocument(node2) && node2.scrollingElement != null && !scrollParents.includes(node2.scrollingElement)) {
        scrollParents.push(node2.scrollingElement);
        return scrollParents;
      }
      if (!isHTMLElement(node2) || isSVGElement(node2)) {
        return scrollParents;
      }
      if (scrollParents.includes(node2)) {
        return scrollParents;
      }
      const computedStyle = getWindow(element).getComputedStyle(node2);
      if (node2 !== element) {
        if (isScrollable(node2, computedStyle)) {
          scrollParents.push(node2);
        }
      }
      if (isFixed(node2, computedStyle)) {
        return scrollParents;
      }
      return findScrollableAncestors(node2.parentNode);
    }
    if (!element) {
      return scrollParents;
    }
    return findScrollableAncestors(element);
  }
  function getFirstScrollableAncestor(node2) {
    const [firstScrollableAncestor] = getScrollableAncestors(node2, 1);
    return firstScrollableAncestor != null ? firstScrollableAncestor : null;
  }
  function getScrollableElement(element) {
    if (!canUseDOM || !element) {
      return null;
    }
    if (isWindow(element)) {
      return element;
    }
    if (!isNode(element)) {
      return null;
    }
    if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
      return window;
    }
    if (isHTMLElement(element)) {
      return element;
    }
    return null;
  }
  function getScrollXCoordinate(element) {
    if (isWindow(element)) {
      return element.scrollX;
    }
    return element.scrollLeft;
  }
  function getScrollYCoordinate(element) {
    if (isWindow(element)) {
      return element.scrollY;
    }
    return element.scrollTop;
  }
  function getScrollCoordinates(element) {
    return {
      x: getScrollXCoordinate(element),
      y: getScrollYCoordinate(element)
    };
  }
  var Direction;
  (function(Direction2) {
    Direction2[Direction2["Forward"] = 1] = "Forward";
    Direction2[Direction2["Backward"] = -1] = "Backward";
  })(Direction || (Direction = {}));
  function isDocumentScrollingElement(element) {
    if (!canUseDOM || !element) {
      return false;
    }
    return element === document.scrollingElement;
  }
  function getScrollPosition(scrollingContainer) {
    const minScroll = {
      x: 0,
      y: 0
    };
    const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
      height: window.innerHeight,
      width: window.innerWidth
    } : {
      height: scrollingContainer.clientHeight,
      width: scrollingContainer.clientWidth
    };
    const maxScroll = {
      x: scrollingContainer.scrollWidth - dimensions.width,
      y: scrollingContainer.scrollHeight - dimensions.height
    };
    const isTop = scrollingContainer.scrollTop <= minScroll.y;
    const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
    const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
    const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
    return {
      isTop,
      isLeft,
      isBottom,
      isRight,
      maxScroll,
      minScroll
    };
  }
  const defaultThreshold = {
    x: 0.2,
    y: 0.2
  };
  function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref13, acceleration, thresholdPercentage) {
    let {
      top,
      left,
      right,
      bottom
    } = _ref13;
    if (acceleration === void 0) {
      acceleration = 10;
    }
    if (thresholdPercentage === void 0) {
      thresholdPercentage = defaultThreshold;
    }
    const {
      isTop,
      isBottom,
      isLeft,
      isRight
    } = getScrollPosition(scrollContainer);
    const direction = {
      x: 0,
      y: 0
    };
    const speed = {
      x: 0,
      y: 0
    };
    const threshold = {
      height: scrollContainerRect.height * thresholdPercentage.y,
      width: scrollContainerRect.width * thresholdPercentage.x
    };
    if (!isTop && top <= scrollContainerRect.top + threshold.height) {
      direction.y = Direction.Backward;
      speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
    } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
      direction.y = Direction.Forward;
      speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
    }
    if (!isRight && right >= scrollContainerRect.right - threshold.width) {
      direction.x = Direction.Forward;
      speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
    } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
      direction.x = Direction.Backward;
      speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
    }
    return {
      direction,
      speed
    };
  }
  function getScrollElementRect(element) {
    if (element === document.scrollingElement) {
      const {
        innerWidth,
        innerHeight
      } = window;
      return {
        top: 0,
        left: 0,
        right: innerWidth,
        bottom: innerHeight,
        width: innerWidth,
        height: innerHeight
      };
    }
    const {
      top,
      left,
      right,
      bottom
    } = element.getBoundingClientRect();
    return {
      top,
      left,
      right,
      bottom,
      width: element.clientWidth,
      height: element.clientHeight
    };
  }
  function getScrollOffsets(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return add(acc, getScrollCoordinates(node2));
    }, defaultCoordinates);
  }
  function getScrollXOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return acc + getScrollXCoordinate(node2);
    }, 0);
  }
  function getScrollYOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node2) => {
      return acc + getScrollYCoordinate(node2);
    }, 0);
  }
  function scrollIntoViewIfNeeded(element, measure) {
    if (measure === void 0) {
      measure = getClientRect;
    }
    if (!element) {
      return;
    }
    const {
      top,
      left,
      bottom,
      right
    } = measure(element);
    const firstScrollableAncestor = getFirstScrollableAncestor(element);
    if (!firstScrollableAncestor) {
      return;
    }
    if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
      element.scrollIntoView({
        block: "center",
        inline: "center"
      });
    }
  }
  const properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
  class Rect {
    constructor(rect, element) {
      this.rect = void 0;
      this.width = void 0;
      this.height = void 0;
      this.top = void 0;
      this.bottom = void 0;
      this.right = void 0;
      this.left = void 0;
      const scrollableAncestors = getScrollableAncestors(element);
      const scrollOffsets = getScrollOffsets(scrollableAncestors);
      this.rect = {
        ...rect
      };
      this.width = rect.width;
      this.height = rect.height;
      for (const [axis, keys, getScrollOffset] of properties) {
        for (const key2 of keys) {
          Object.defineProperty(this, key2, {
            get: () => {
              const currentOffsets = getScrollOffset(scrollableAncestors);
              const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
              return this.rect[key2] + scrollOffsetsDeltla;
            },
            enumerable: true
          });
        }
      }
      Object.defineProperty(this, "rect", {
        enumerable: false
      });
    }
  }
  class Listeners {
    constructor(target) {
      this.target = void 0;
      this.listeners = [];
      this.removeAll = () => {
        this.listeners.forEach((listener) => {
          var _this$target;
          return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
        });
      };
      this.target = target;
    }
    add(eventName, handler, options) {
      var _this$target2;
      (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
      this.listeners.push([eventName, handler, options]);
    }
  }
  function getEventListenerTarget(target) {
    const {
      EventTarget
    } = getWindow(target);
    return target instanceof EventTarget ? target : getOwnerDocument(target);
  }
  function hasExceededDistance(delta, measurement) {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    if (typeof measurement === "number") {
      return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
    }
    if ("x" in measurement && "y" in measurement) {
      return dx > measurement.x && dy > measurement.y;
    }
    if ("x" in measurement) {
      return dx > measurement.x;
    }
    if ("y" in measurement) {
      return dy > measurement.y;
    }
    return false;
  }
  var EventName;
  (function(EventName2) {
    EventName2["Click"] = "click";
    EventName2["DragStart"] = "dragstart";
    EventName2["Keydown"] = "keydown";
    EventName2["ContextMenu"] = "contextmenu";
    EventName2["Resize"] = "resize";
    EventName2["SelectionChange"] = "selectionchange";
    EventName2["VisibilityChange"] = "visibilitychange";
  })(EventName || (EventName = {}));
  function preventDefault(event) {
    event.preventDefault();
  }
  function stopPropagation(event) {
    event.stopPropagation();
  }
  var KeyboardCode;
  (function(KeyboardCode2) {
    KeyboardCode2["Space"] = "Space";
    KeyboardCode2["Down"] = "ArrowDown";
    KeyboardCode2["Right"] = "ArrowRight";
    KeyboardCode2["Left"] = "ArrowLeft";
    KeyboardCode2["Up"] = "ArrowUp";
    KeyboardCode2["Esc"] = "Escape";
    KeyboardCode2["Enter"] = "Enter";
  })(KeyboardCode || (KeyboardCode = {}));
  const defaultKeyboardCodes = {
    start: [KeyboardCode.Space, KeyboardCode.Enter],
    cancel: [KeyboardCode.Esc],
    end: [KeyboardCode.Space, KeyboardCode.Enter]
  };
  const defaultKeyboardCoordinateGetter = (event, _ref13) => {
    let {
      currentCoordinates
    } = _ref13;
    switch (event.code) {
      case KeyboardCode.Right:
        return {
          ...currentCoordinates,
          x: currentCoordinates.x + 25
        };
      case KeyboardCode.Left:
        return {
          ...currentCoordinates,
          x: currentCoordinates.x - 25
        };
      case KeyboardCode.Down:
        return {
          ...currentCoordinates,
          y: currentCoordinates.y + 25
        };
      case KeyboardCode.Up:
        return {
          ...currentCoordinates,
          y: currentCoordinates.y - 25
        };
    }
    return void 0;
  };
  class KeyboardSensor {
    constructor(props) {
      this.props = void 0;
      this.autoScrollEnabled = false;
      this.referenceCoordinates = void 0;
      this.listeners = void 0;
      this.windowListeners = void 0;
      this.props = props;
      const {
        event: {
          target
        }
      } = props;
      this.props = props;
      this.listeners = new Listeners(getOwnerDocument(target));
      this.windowListeners = new Listeners(getWindow(target));
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.attach();
    }
    attach() {
      this.handleStart();
      this.windowListeners.add(EventName.Resize, this.handleCancel);
      this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
      setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
    }
    handleStart() {
      const {
        activeNode,
        onStart
      } = this.props;
      const node2 = activeNode.node.current;
      if (node2) {
        scrollIntoViewIfNeeded(node2);
      }
      onStart(defaultCoordinates);
    }
    handleKeyDown(event) {
      if (isKeyboardEvent(event)) {
        const {
          active,
          context,
          options
        } = this.props;
        const {
          keyboardCodes = defaultKeyboardCodes,
          coordinateGetter = defaultKeyboardCoordinateGetter,
          scrollBehavior = "smooth"
        } = options;
        const {
          code
        } = event;
        if (keyboardCodes.end.includes(code)) {
          this.handleEnd(event);
          return;
        }
        if (keyboardCodes.cancel.includes(code)) {
          this.handleCancel(event);
          return;
        }
        const {
          collisionRect
        } = context.current;
        const currentCoordinates = collisionRect ? {
          x: collisionRect.left,
          y: collisionRect.top
        } : defaultCoordinates;
        if (!this.referenceCoordinates) {
          this.referenceCoordinates = currentCoordinates;
        }
        const newCoordinates = coordinateGetter(event, {
          active,
          context: context.current,
          currentCoordinates
        });
        if (newCoordinates) {
          const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
          const scrollDelta = {
            x: 0,
            y: 0
          };
          const {
            scrollableAncestors
          } = context.current;
          for (const scrollContainer of scrollableAncestors) {
            const direction = event.code;
            const {
              isTop,
              isRight,
              isLeft,
              isBottom,
              maxScroll,
              minScroll
            } = getScrollPosition(scrollContainer);
            const scrollElementRect = getScrollElementRect(scrollContainer);
            const clampedCoordinates = {
              x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
              y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
            };
            const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
            const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
            if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
              const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
              const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
              if (canScrollToNewCoordinates && !coordinatesDelta.y) {
                scrollContainer.scrollTo({
                  left: newScrollCoordinates,
                  behavior: scrollBehavior
                });
                return;
              }
              if (canScrollToNewCoordinates) {
                scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
              } else {
                scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
              }
              if (scrollDelta.x) {
                scrollContainer.scrollBy({
                  left: -scrollDelta.x,
                  behavior: scrollBehavior
                });
              }
              break;
            } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
              const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
              const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
              if (canScrollToNewCoordinates && !coordinatesDelta.x) {
                scrollContainer.scrollTo({
                  top: newScrollCoordinates,
                  behavior: scrollBehavior
                });
                return;
              }
              if (canScrollToNewCoordinates) {
                scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
              } else {
                scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
              }
              if (scrollDelta.y) {
                scrollContainer.scrollBy({
                  top: -scrollDelta.y,
                  behavior: scrollBehavior
                });
              }
              break;
            }
          }
          this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
        }
      }
    }
    handleMove(event, coordinates) {
      const {
        onMove
      } = this.props;
      event.preventDefault();
      onMove(coordinates);
    }
    handleEnd(event) {
      const {
        onEnd
      } = this.props;
      event.preventDefault();
      this.detach();
      onEnd();
    }
    handleCancel(event) {
      const {
        onCancel
      } = this.props;
      event.preventDefault();
      this.detach();
      onCancel();
    }
    detach() {
      this.listeners.removeAll();
      this.windowListeners.removeAll();
    }
  }
  KeyboardSensor.activators = [{
    eventName: "onKeyDown",
    handler: (event, _ref13, _ref22) => {
      let {
        keyboardCodes = defaultKeyboardCodes,
        onActivation
      } = _ref13;
      let {
        active
      } = _ref22;
      const {
        code
      } = event.nativeEvent;
      if (keyboardCodes.start.includes(code)) {
        const activator = active.activatorNode.current;
        if (activator && event.target !== activator) {
          return false;
        }
        event.preventDefault();
        onActivation == null ? void 0 : onActivation({
          event: event.nativeEvent
        });
        return true;
      }
      return false;
    }
  }];
  function isDistanceConstraint(constraint) {
    return Boolean(constraint && "distance" in constraint);
  }
  function isDelayConstraint(constraint) {
    return Boolean(constraint && "delay" in constraint);
  }
  class AbstractPointerSensor {
    constructor(props, events2, listenerTarget) {
      var _getEventCoordinates;
      if (listenerTarget === void 0) {
        listenerTarget = getEventListenerTarget(props.event.target);
      }
      this.props = void 0;
      this.events = void 0;
      this.autoScrollEnabled = true;
      this.document = void 0;
      this.activated = false;
      this.initialCoordinates = void 0;
      this.timeoutId = null;
      this.listeners = void 0;
      this.documentListeners = void 0;
      this.windowListeners = void 0;
      this.props = props;
      this.events = events2;
      const {
        event
      } = props;
      const {
        target
      } = event;
      this.props = props;
      this.events = events2;
      this.document = getOwnerDocument(target);
      this.documentListeners = new Listeners(this.document);
      this.listeners = new Listeners(listenerTarget);
      this.windowListeners = new Listeners(getWindow(target));
      this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
      this.handleStart = this.handleStart.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.handleEnd = this.handleEnd.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.removeTextSelection = this.removeTextSelection.bind(this);
      this.attach();
    }
    attach() {
      const {
        events: events2,
        props: {
          options: {
            activationConstraint,
            bypassActivationConstraint
          }
        }
      } = this;
      this.listeners.add(events2.move.name, this.handleMove, {
        passive: false
      });
      this.listeners.add(events2.end.name, this.handleEnd);
      this.windowListeners.add(EventName.Resize, this.handleCancel);
      this.windowListeners.add(EventName.DragStart, preventDefault);
      this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
      this.windowListeners.add(EventName.ContextMenu, preventDefault);
      this.documentListeners.add(EventName.Keydown, this.handleKeydown);
      if (activationConstraint) {
        if (bypassActivationConstraint != null && bypassActivationConstraint({
          event: this.props.event,
          activeNode: this.props.activeNode,
          options: this.props.options
        })) {
          return this.handleStart();
        }
        if (isDelayConstraint(activationConstraint)) {
          this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
          return;
        }
        if (isDistanceConstraint(activationConstraint)) {
          return;
        }
      }
      this.handleStart();
    }
    detach() {
      this.listeners.removeAll();
      this.windowListeners.removeAll();
      setTimeout(this.documentListeners.removeAll, 50);
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
    handleStart() {
      const {
        initialCoordinates
      } = this;
      const {
        onStart
      } = this.props;
      if (initialCoordinates) {
        this.activated = true;
        this.documentListeners.add(EventName.Click, stopPropagation, {
          capture: true
        });
        this.removeTextSelection();
        this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
        onStart(initialCoordinates);
      }
    }
    handleMove(event) {
      var _getEventCoordinates2;
      const {
        activated,
        initialCoordinates,
        props
      } = this;
      const {
        onMove,
        options: {
          activationConstraint
        }
      } = props;
      if (!initialCoordinates) {
        return;
      }
      const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
      const delta = subtract(initialCoordinates, coordinates);
      if (!activated && activationConstraint) {
        if (isDistanceConstraint(activationConstraint)) {
          if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
            return this.handleCancel();
          }
          if (hasExceededDistance(delta, activationConstraint.distance)) {
            return this.handleStart();
          }
        }
        if (isDelayConstraint(activationConstraint)) {
          if (hasExceededDistance(delta, activationConstraint.tolerance)) {
            return this.handleCancel();
          }
        }
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      onMove(coordinates);
    }
    handleEnd() {
      const {
        onEnd
      } = this.props;
      this.detach();
      onEnd();
    }
    handleCancel() {
      const {
        onCancel
      } = this.props;
      this.detach();
      onCancel();
    }
    handleKeydown(event) {
      if (event.code === KeyboardCode.Esc) {
        this.handleCancel();
      }
    }
    removeTextSelection() {
      var _this$document$getSel;
      (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
    }
  }
  const events = {
    move: {
      name: "pointermove"
    },
    end: {
      name: "pointerup"
    }
  };
  class PointerSensor extends AbstractPointerSensor {
    constructor(props) {
      const {
        event
      } = props;
      const listenerTarget = getOwnerDocument(event.target);
      super(props, events, listenerTarget);
    }
  }
  PointerSensor.activators = [{
    eventName: "onPointerDown",
    handler: (_ref13, _ref22) => {
      let {
        nativeEvent: event
      } = _ref13;
      let {
        onActivation
      } = _ref22;
      if (!event.isPrimary || event.button !== 0) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  const events$1 = {
    move: {
      name: "mousemove"
    },
    end: {
      name: "mouseup"
    }
  };
  var MouseButton;
  (function(MouseButton2) {
    MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
  })(MouseButton || (MouseButton = {}));
  class MouseSensor extends AbstractPointerSensor {
    constructor(props) {
      super(props, events$1, getOwnerDocument(props.event.target));
    }
  }
  MouseSensor.activators = [{
    eventName: "onMouseDown",
    handler: (_ref13, _ref22) => {
      let {
        nativeEvent: event
      } = _ref13;
      let {
        onActivation
      } = _ref22;
      if (event.button === MouseButton.RightClick) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  const events$2 = {
    move: {
      name: "touchmove"
    },
    end: {
      name: "touchend"
    }
  };
  class TouchSensor extends AbstractPointerSensor {
    constructor(props) {
      super(props, events$2);
    }
    static setup() {
      window.addEventListener(events$2.move.name, noop2, {
        capture: false,
        passive: false
      });
      return function teardown() {
        window.removeEventListener(events$2.move.name, noop2);
      };
      function noop2() {
      }
    }
  }
  TouchSensor.activators = [{
    eventName: "onTouchStart",
    handler: (_ref13, _ref22) => {
      let {
        nativeEvent: event
      } = _ref13;
      let {
        onActivation
      } = _ref22;
      const {
        touches
      } = event;
      if (touches.length > 1) {
        return false;
      }
      onActivation == null ? void 0 : onActivation({
        event
      });
      return true;
    }
  }];
  var AutoScrollActivator;
  (function(AutoScrollActivator2) {
    AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
    AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
  })(AutoScrollActivator || (AutoScrollActivator = {}));
  var TraversalOrder;
  (function(TraversalOrder2) {
    TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
    TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
  })(TraversalOrder || (TraversalOrder = {}));
  function useAutoScroller(_ref13) {
    let {
      acceleration,
      activator = AutoScrollActivator.Pointer,
      canScroll,
      draggingRect,
      enabled,
      interval = 5,
      order = TraversalOrder.TreeOrder,
      pointerCoordinates,
      scrollableAncestors,
      scrollableAncestorRects,
      delta,
      threshold
    } = _ref13;
    const scrollIntent = useScrollIntent({
      delta,
      disabled: !enabled
    });
    const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
    const scrollSpeed = React__default.useRef({
      x: 0,
      y: 0
    });
    const scrollDirection = React__default.useRef({
      x: 0,
      y: 0
    });
    const rect = React__default.useMemo(() => {
      switch (activator) {
        case AutoScrollActivator.Pointer:
          return pointerCoordinates ? {
            top: pointerCoordinates.y,
            bottom: pointerCoordinates.y,
            left: pointerCoordinates.x,
            right: pointerCoordinates.x
          } : null;
        case AutoScrollActivator.DraggableRect:
          return draggingRect;
      }
    }, [activator, draggingRect, pointerCoordinates]);
    const scrollContainerRef = React__default.useRef(null);
    const autoScroll = React__default.useCallback(() => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }
      const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
      const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
      scrollContainer.scrollBy(scrollLeft, scrollTop);
    }, []);
    const sortedScrollableAncestors = React__default.useMemo(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
    React__default.useEffect(
      () => {
        if (!enabled || !scrollableAncestors.length || !rect) {
          clearAutoScrollInterval();
          return;
        }
        for (const scrollContainer of sortedScrollableAncestors) {
          if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
            continue;
          }
          const index = scrollableAncestors.indexOf(scrollContainer);
          const scrollContainerRect = scrollableAncestorRects[index];
          if (!scrollContainerRect) {
            continue;
          }
          const {
            direction,
            speed
          } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
          for (const axis of ["x", "y"]) {
            if (!scrollIntent[axis][direction[axis]]) {
              speed[axis] = 0;
              direction[axis] = 0;
            }
          }
          if (speed.x > 0 || speed.y > 0) {
            clearAutoScrollInterval();
            scrollContainerRef.current = scrollContainer;
            setAutoScrollInterval(autoScroll, interval);
            scrollSpeed.current = speed;
            scrollDirection.current = direction;
            return;
          }
        }
        scrollSpeed.current = {
          x: 0,
          y: 0
        };
        scrollDirection.current = {
          x: 0,
          y: 0
        };
        clearAutoScrollInterval();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        acceleration,
        autoScroll,
        canScroll,
        clearAutoScrollInterval,
        enabled,
        interval,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(rect),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(scrollIntent),
        setAutoScrollInterval,
        scrollableAncestors,
        sortedScrollableAncestors,
        scrollableAncestorRects,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(threshold)
      ]
    );
  }
  const defaultScrollIntent = {
    x: {
      [Direction.Backward]: false,
      [Direction.Forward]: false
    },
    y: {
      [Direction.Backward]: false,
      [Direction.Forward]: false
    }
  };
  function useScrollIntent(_ref22) {
    let {
      delta,
      disabled
    } = _ref22;
    const previousDelta = usePrevious(delta);
    return useLazyMemo((previousIntent) => {
      if (disabled || !previousDelta || !previousIntent) {
        return defaultScrollIntent;
      }
      const direction = {
        x: Math.sign(delta.x - previousDelta.x),
        y: Math.sign(delta.y - previousDelta.y)
      };
      return {
        x: {
          [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
          [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
        },
        y: {
          [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
          [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
        }
      };
    }, [disabled, delta, previousDelta]);
  }
  function useCachedNode(draggableNodes, id) {
    const draggableNode = id !== null ? draggableNodes.get(id) : void 0;
    const node2 = draggableNode ? draggableNode.node.current : null;
    return useLazyMemo((cachedNode) => {
      var _ref13;
      if (id === null) {
        return null;
      }
      return (_ref13 = node2 != null ? node2 : cachedNode) != null ? _ref13 : null;
    }, [node2, id]);
  }
  function useCombineActivators(sensors, getSyntheticHandler) {
    return React__default.useMemo(() => sensors.reduce((accumulator, sensor) => {
      const {
        sensor: Sensor
      } = sensor;
      const sensorActivators = Sensor.activators.map((activator) => ({
        eventName: activator.eventName,
        handler: getSyntheticHandler(activator.handler, sensor)
      }));
      return [...accumulator, ...sensorActivators];
    }, []), [sensors, getSyntheticHandler]);
  }
  var MeasuringStrategy;
  (function(MeasuringStrategy2) {
    MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
    MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
    MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
  })(MeasuringStrategy || (MeasuringStrategy = {}));
  var MeasuringFrequency;
  (function(MeasuringFrequency2) {
    MeasuringFrequency2["Optimized"] = "optimized";
  })(MeasuringFrequency || (MeasuringFrequency = {}));
  const defaultValue = /* @__PURE__ */ new Map();
  function useDroppableMeasuring(containers, _ref13) {
    let {
      dragging,
      dependencies,
      config
    } = _ref13;
    const [queue, setQueue] = React__default.useState(null);
    const {
      frequency,
      measure,
      strategy
    } = config;
    const containersRef = React__default.useRef(containers);
    const disabled = isDisabled();
    const disabledRef = useLatestValue(disabled);
    const measureDroppableContainers = React__default.useCallback(function(ids2) {
      if (ids2 === void 0) {
        ids2 = [];
      }
      if (disabledRef.current) {
        return;
      }
      setQueue((value) => {
        if (value === null) {
          return ids2;
        }
        return value.concat(ids2.filter((id) => !value.includes(id)));
      });
    }, [disabledRef]);
    const timeoutId = React__default.useRef(null);
    const droppableRects = useLazyMemo((previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }
      if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
        const map = /* @__PURE__ */ new Map();
        for (let container of containers) {
          if (!container) {
            continue;
          }
          if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
            map.set(container.id, container.rect.current);
            continue;
          }
          const node2 = container.node.current;
          const rect = node2 ? new Rect(measure(node2), node2) : null;
          container.rect.current = rect;
          if (rect) {
            map.set(container.id, rect);
          }
        }
        return map;
      }
      return previousValue;
    }, [containers, queue, dragging, disabled, measure]);
    React__default.useEffect(() => {
      containersRef.current = containers;
    }, [containers]);
    React__default.useEffect(
      () => {
        if (disabled) {
          return;
        }
        measureDroppableContainers();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dragging, disabled]
    );
    React__default.useEffect(
      () => {
        if (queue && queue.length > 0) {
          setQueue(null);
        }
      },
      //eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(queue)]
    );
    React__default.useEffect(
      () => {
        if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
          return;
        }
        timeoutId.current = setTimeout(() => {
          measureDroppableContainers();
          timeoutId.current = null;
        }, frequency);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [frequency, disabled, measureDroppableContainers, ...dependencies]
    );
    return {
      droppableRects,
      measureDroppableContainers,
      measuringScheduled: queue != null
    };
    function isDisabled() {
      switch (strategy) {
        case MeasuringStrategy.Always:
          return false;
        case MeasuringStrategy.BeforeDragging:
          return dragging;
        default:
          return !dragging;
      }
    }
  }
  function useInitialValue(value, computeFn) {
    return useLazyMemo((previousValue) => {
      if (!value) {
        return null;
      }
      if (previousValue) {
        return previousValue;
      }
      return typeof computeFn === "function" ? computeFn(value) : value;
    }, [computeFn, value]);
  }
  function useInitialRect(node2, measure) {
    return useInitialValue(node2, measure);
  }
  function useMutationObserver(_ref13) {
    let {
      callback,
      disabled
    } = _ref13;
    const handleMutations = useEvent(callback);
    const mutationObserver = React__default.useMemo(() => {
      if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
        return void 0;
      }
      const {
        MutationObserver: MutationObserver2
      } = window;
      return new MutationObserver2(handleMutations);
    }, [handleMutations, disabled]);
    React__default.useEffect(() => {
      return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }, [mutationObserver]);
    return mutationObserver;
  }
  function useResizeObserver(_ref13) {
    let {
      callback,
      disabled
    } = _ref13;
    const handleResize = useEvent(callback);
    const resizeObserver = React__default.useMemo(
      () => {
        if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
          return void 0;
        }
        const {
          ResizeObserver
        } = window;
        return new ResizeObserver(handleResize);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [disabled]
    );
    React__default.useEffect(() => {
      return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
    }, [resizeObserver]);
    return resizeObserver;
  }
  function defaultMeasure(element) {
    return new Rect(getClientRect(element), element);
  }
  function useRect(element, measure, fallbackRect) {
    if (measure === void 0) {
      measure = defaultMeasure;
    }
    const [rect, measureRect] = React__default.useReducer(reducer2, null);
    const mutationObserver = useMutationObserver({
      callback(records) {
        if (!element) {
          return;
        }
        for (const record of records) {
          const {
            type,
            target
          } = record;
          if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
            measureRect();
            break;
          }
        }
      }
    });
    const resizeObserver = useResizeObserver({
      callback: measureRect
    });
    useIsomorphicLayoutEffect(() => {
      measureRect();
      if (element) {
        resizeObserver == null ? void 0 : resizeObserver.observe(element);
        mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
        mutationObserver == null ? void 0 : mutationObserver.disconnect();
      }
    }, [element]);
    return rect;
    function reducer2(currentRect) {
      if (!element) {
        return null;
      }
      if (element.isConnected === false) {
        var _ref13;
        return (_ref13 = currentRect != null ? currentRect : fallbackRect) != null ? _ref13 : null;
      }
      const newRect = measure(element);
      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }
      return newRect;
    }
  }
  function useRectDelta(rect) {
    const initialRect = useInitialValue(rect);
    return getRectDelta(rect, initialRect);
  }
  const defaultValue$1 = [];
  function useScrollableAncestors(node2) {
    const previousNode = React__default.useRef(node2);
    const ancestors = useLazyMemo((previousValue) => {
      if (!node2) {
        return defaultValue$1;
      }
      if (previousValue && previousValue !== defaultValue$1 && node2 && previousNode.current && node2.parentNode === previousNode.current.parentNode) {
        return previousValue;
      }
      return getScrollableAncestors(node2);
    }, [node2]);
    React__default.useEffect(() => {
      previousNode.current = node2;
    }, [node2]);
    return ancestors;
  }
  function useScrollOffsets(elements) {
    const [scrollCoordinates, setScrollCoordinates] = React__default.useState(null);
    const prevElements = React__default.useRef(elements);
    const handleScroll = React__default.useCallback((event) => {
      const scrollingElement = getScrollableElement(event.target);
      if (!scrollingElement) {
        return;
      }
      setScrollCoordinates((scrollCoordinates2) => {
        if (!scrollCoordinates2) {
          return null;
        }
        scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
        return new Map(scrollCoordinates2);
      });
    }, []);
    React__default.useEffect(() => {
      const previousElements = prevElements.current;
      if (elements !== previousElements) {
        cleanup(previousElements);
        const entries = elements.map((element) => {
          const scrollableElement = getScrollableElement(element);
          if (scrollableElement) {
            scrollableElement.addEventListener("scroll", handleScroll, {
              passive: true
            });
            return [scrollableElement, getScrollCoordinates(scrollableElement)];
          }
          return null;
        }).filter((entry) => entry != null);
        setScrollCoordinates(entries.length ? new Map(entries) : null);
        prevElements.current = elements;
      }
      return () => {
        cleanup(elements);
        cleanup(previousElements);
      };
      function cleanup(elements2) {
        elements2.forEach((element) => {
          const scrollableElement = getScrollableElement(element);
          scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll);
        });
      }
    }, [handleScroll, elements]);
    return React__default.useMemo(() => {
      if (elements.length) {
        return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
      }
      return defaultCoordinates;
    }, [elements, scrollCoordinates]);
  }
  function useScrollOffsetsDelta(scrollOffsets, dependencies) {
    if (dependencies === void 0) {
      dependencies = [];
    }
    const initialScrollOffsets = React__default.useRef(null);
    React__default.useEffect(
      () => {
        initialScrollOffsets.current = null;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      dependencies
    );
    React__default.useEffect(() => {
      const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
      if (hasScrollOffsets && !initialScrollOffsets.current) {
        initialScrollOffsets.current = scrollOffsets;
      }
      if (!hasScrollOffsets && initialScrollOffsets.current) {
        initialScrollOffsets.current = null;
      }
    }, [scrollOffsets]);
    return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
  }
  function useSensorSetup(sensors) {
    React__default.useEffect(
      () => {
        if (!canUseDOM) {
          return;
        }
        const teardownFns = sensors.map((_ref13) => {
          let {
            sensor
          } = _ref13;
          return sensor.setup == null ? void 0 : sensor.setup();
        });
        return () => {
          for (const teardown of teardownFns) {
            teardown == null ? void 0 : teardown();
          }
        };
      },
      // TO-DO: Sensors length could theoretically change which would not be a valid dependency
      // eslint-disable-next-line react-hooks/exhaustive-deps
      sensors.map((_ref22) => {
        let {
          sensor
        } = _ref22;
        return sensor;
      })
    );
  }
  function useSyntheticListeners(listeners2, id) {
    return React__default.useMemo(() => {
      return listeners2.reduce((acc, _ref13) => {
        let {
          eventName,
          handler
        } = _ref13;
        acc[eventName] = (event) => {
          handler(event, id);
        };
        return acc;
      }, {});
    }, [listeners2, id]);
  }
  function useWindowRect(element) {
    return React__default.useMemo(() => element ? getWindowClientRect(element) : null, [element]);
  }
  const defaultValue$2 = [];
  function useRects(elements, measure) {
    if (measure === void 0) {
      measure = getClientRect;
    }
    const [firstElement] = elements;
    const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
    const [rects, measureRects] = React__default.useReducer(reducer2, defaultValue$2);
    const resizeObserver = useResizeObserver({
      callback: measureRects
    });
    if (elements.length > 0 && rects === defaultValue$2) {
      measureRects();
    }
    useIsomorphicLayoutEffect(() => {
      if (elements.length) {
        elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
      } else {
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
        measureRects();
      }
    }, [elements]);
    return rects;
    function reducer2() {
      if (!elements.length) {
        return defaultValue$2;
      }
      return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    }
  }
  function getMeasurableNode(node2) {
    if (!node2) {
      return null;
    }
    if (node2.children.length > 1) {
      return node2;
    }
    const firstChild = node2.children[0];
    return isHTMLElement(firstChild) ? firstChild : node2;
  }
  function useDragOverlayMeasuring(_ref13) {
    let {
      measure
    } = _ref13;
    const [rect, setRect] = React__default.useState(null);
    const handleResize = React__default.useCallback((entries) => {
      for (const {
        target
      } of entries) {
        if (isHTMLElement(target)) {
          setRect((rect2) => {
            const newRect = measure(target);
            return rect2 ? {
              ...rect2,
              width: newRect.width,
              height: newRect.height
            } : newRect;
          });
          break;
        }
      }
    }, [measure]);
    const resizeObserver = useResizeObserver({
      callback: handleResize
    });
    const handleNodeChange = React__default.useCallback((element) => {
      const node2 = getMeasurableNode(element);
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      if (node2) {
        resizeObserver == null ? void 0 : resizeObserver.observe(node2);
      }
      setRect(node2 ? measure(node2) : null);
    }, [measure, resizeObserver]);
    const [nodeRef, setRef] = useNodeRef(handleNodeChange);
    return React__default.useMemo(() => ({
      nodeRef,
      rect,
      setRef
    }), [rect, nodeRef, setRef]);
  }
  const defaultSensors = [{
    sensor: PointerSensor,
    options: {}
  }, {
    sensor: KeyboardSensor,
    options: {}
  }];
  const defaultData = {
    current: {}
  };
  const defaultMeasuringConfiguration = {
    draggable: {
      measure: getTransformAgnosticClientRect
    },
    droppable: {
      measure: getTransformAgnosticClientRect,
      strategy: MeasuringStrategy.WhileDragging,
      frequency: MeasuringFrequency.Optimized
    },
    dragOverlay: {
      measure: getClientRect
    }
  };
  class DroppableContainersMap extends Map {
    get(id) {
      var _super$get;
      return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
    }
    toArray() {
      return Array.from(this.values());
    }
    getEnabled() {
      return this.toArray().filter((_ref13) => {
        let {
          disabled
        } = _ref13;
        return !disabled;
      });
    }
    getNodeFor(id) {
      var _this$get$node$curren, _this$get;
      return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
    }
  }
  const defaultPublicContext = {
    activatorEvent: null,
    active: null,
    activeNode: null,
    activeNodeRect: null,
    collisions: null,
    containerNodeRect: null,
    draggableNodes: /* @__PURE__ */ new Map(),
    droppableRects: /* @__PURE__ */ new Map(),
    droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
    over: null,
    dragOverlay: {
      nodeRef: {
        current: null
      },
      rect: null,
      setRef: noop
    },
    scrollableAncestors: [],
    scrollableAncestorRects: [],
    measuringConfiguration: defaultMeasuringConfiguration,
    measureDroppableContainers: noop,
    windowRect: null,
    measuringScheduled: false
  };
  const defaultInternalContext = {
    activatorEvent: null,
    activators: [],
    active: null,
    activeNodeRect: null,
    ariaDescribedById: {
      draggable: ""
    },
    dispatch: noop,
    draggableNodes: /* @__PURE__ */ new Map(),
    over: null,
    measureDroppableContainers: noop
  };
  const InternalContext = /* @__PURE__ */ React__default.createContext(defaultInternalContext);
  const PublicContext = /* @__PURE__ */ React__default.createContext(defaultPublicContext);
  function getInitialState() {
    return {
      draggable: {
        active: null,
        initialCoordinates: {
          x: 0,
          y: 0
        },
        nodes: /* @__PURE__ */ new Map(),
        translate: {
          x: 0,
          y: 0
        }
      },
      droppable: {
        containers: new DroppableContainersMap()
      }
    };
  }
  function reducer(state, action) {
    switch (action.type) {
      case Action.DragStart:
        return {
          ...state,
          draggable: {
            ...state.draggable,
            initialCoordinates: action.initialCoordinates,
            active: action.active
          }
        };
      case Action.DragMove:
        if (!state.draggable.active) {
          return state;
        }
        return {
          ...state,
          draggable: {
            ...state.draggable,
            translate: {
              x: action.coordinates.x - state.draggable.initialCoordinates.x,
              y: action.coordinates.y - state.draggable.initialCoordinates.y
            }
          }
        };
      case Action.DragEnd:
      case Action.DragCancel:
        return {
          ...state,
          draggable: {
            ...state.draggable,
            active: null,
            initialCoordinates: {
              x: 0,
              y: 0
            },
            translate: {
              x: 0,
              y: 0
            }
          }
        };
      case Action.RegisterDroppable: {
        const {
          element
        } = action;
        const {
          id
        } = element;
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, element);
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      case Action.SetDroppableDisabled: {
        const {
          id,
          key: key2,
          disabled
        } = action;
        const element = state.droppable.containers.get(id);
        if (!element || key2 !== element.key) {
          return state;
        }
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, {
          ...element,
          disabled
        });
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      case Action.UnregisterDroppable: {
        const {
          id,
          key: key2
        } = action;
        const element = state.droppable.containers.get(id);
        if (!element || key2 !== element.key) {
          return state;
        }
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.delete(id);
        return {
          ...state,
          droppable: {
            ...state.droppable,
            containers
          }
        };
      }
      default: {
        return state;
      }
    }
  }
  function RestoreFocus(_ref13) {
    let {
      disabled
    } = _ref13;
    const {
      active,
      activatorEvent,
      draggableNodes
    } = React__default.useContext(InternalContext);
    const previousActivatorEvent = usePrevious(activatorEvent);
    const previousActiveId = usePrevious(active == null ? void 0 : active.id);
    React__default.useEffect(() => {
      if (disabled) {
        return;
      }
      if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
        if (!isKeyboardEvent(previousActivatorEvent)) {
          return;
        }
        if (document.activeElement === previousActivatorEvent.target) {
          return;
        }
        const draggableNode = draggableNodes.get(previousActiveId);
        if (!draggableNode) {
          return;
        }
        const {
          activatorNode,
          node: node2
        } = draggableNode;
        if (!activatorNode.current && !node2.current) {
          return;
        }
        requestAnimationFrame(() => {
          for (const element of [activatorNode.current, node2.current]) {
            if (!element) {
              continue;
            }
            const focusableNode = findFirstFocusableNode(element);
            if (focusableNode) {
              focusableNode.focus();
              break;
            }
          }
        });
      }
    }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
    return null;
  }
  function applyModifiers(modifiers, _ref13) {
    let {
      transform,
      ...args
    } = _ref13;
    return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
      return modifier({
        transform: accumulator,
        ...args
      });
    }, transform) : transform;
  }
  function useMeasuringConfiguration(config) {
    return React__default.useMemo(
      () => ({
        draggable: {
          ...defaultMeasuringConfiguration.draggable,
          ...config == null ? void 0 : config.draggable
        },
        droppable: {
          ...defaultMeasuringConfiguration.droppable,
          ...config == null ? void 0 : config.droppable
        },
        dragOverlay: {
          ...defaultMeasuringConfiguration.dragOverlay,
          ...config == null ? void 0 : config.dragOverlay
        }
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
    );
  }
  function useLayoutShiftScrollCompensation(_ref13) {
    let {
      activeNode,
      measure,
      initialRect,
      config = true
    } = _ref13;
    const initialized = React__default.useRef(false);
    const {
      x: x2,
      y: y2
    } = typeof config === "boolean" ? {
      x: config,
      y: config
    } : config;
    useIsomorphicLayoutEffect(() => {
      const disabled = !x2 && !y2;
      if (disabled || !activeNode) {
        initialized.current = false;
        return;
      }
      if (initialized.current || !initialRect) {
        return;
      }
      const node2 = activeNode == null ? void 0 : activeNode.node.current;
      if (!node2 || node2.isConnected === false) {
        return;
      }
      const rect = measure(node2);
      const rectDelta = getRectDelta(rect, initialRect);
      if (!x2) {
        rectDelta.x = 0;
      }
      if (!y2) {
        rectDelta.y = 0;
      }
      initialized.current = true;
      if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
        const firstScrollableAncestor = getFirstScrollableAncestor(node2);
        if (firstScrollableAncestor) {
          firstScrollableAncestor.scrollBy({
            top: rectDelta.y,
            left: rectDelta.x
          });
        }
      }
    }, [activeNode, x2, y2, initialRect, measure]);
  }
  const ActiveDraggableContext = /* @__PURE__ */ React__default.createContext({
    ...defaultCoordinates,
    scaleX: 1,
    scaleY: 1
  });
  var Status;
  (function(Status2) {
    Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
    Status2[Status2["Initializing"] = 1] = "Initializing";
    Status2[Status2["Initialized"] = 2] = "Initialized";
  })(Status || (Status = {}));
  const DndContext = /* @__PURE__ */ React__default.memo(function DndContext2(_ref13) {
    var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
    let {
      id,
      accessibility,
      autoScroll = true,
      children,
      sensors = defaultSensors,
      collisionDetection = rectIntersection,
      measuring,
      modifiers,
      ...props
    } = _ref13;
    const store2 = React__default.useReducer(reducer, void 0, getInitialState);
    const [state, dispatch] = store2;
    const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
    const [status, setStatus] = React__default.useState(Status.Uninitialized);
    const isInitialized = status === Status.Initialized;
    const {
      draggable: {
        active: activeId,
        nodes: draggableNodes,
        translate
      },
      droppable: {
        containers: droppableContainers
      }
    } = state;
    const node2 = activeId ? draggableNodes.get(activeId) : null;
    const activeRects = React__default.useRef({
      initial: null,
      translated: null
    });
    const active = React__default.useMemo(() => {
      var _node$data;
      return activeId != null ? {
        id: activeId,
        // It's possible for the active node to unmount while dragging
        data: (_node$data = node2 == null ? void 0 : node2.data) != null ? _node$data : defaultData,
        rect: activeRects
      } : null;
    }, [activeId, node2]);
    const activeRef = React__default.useRef(null);
    const [activeSensor, setActiveSensor] = React__default.useState(null);
    const [activatorEvent, setActivatorEvent] = React__default.useState(null);
    const latestProps = useLatestValue(props, Object.values(props));
    const draggableDescribedById = useUniqueId("DndDescribedBy", id);
    const enabledDroppableContainers = React__default.useMemo(() => droppableContainers.getEnabled(), [droppableContainers]);
    const measuringConfiguration = useMeasuringConfiguration(measuring);
    const {
      droppableRects,
      measureDroppableContainers,
      measuringScheduled
    } = useDroppableMeasuring(enabledDroppableContainers, {
      dragging: isInitialized,
      dependencies: [translate.x, translate.y],
      config: measuringConfiguration.droppable
    });
    const activeNode = useCachedNode(draggableNodes, activeId);
    const activationCoordinates = React__default.useMemo(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
    const autoScrollOptions = getAutoScrollerOptions();
    const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
    useLayoutShiftScrollCompensation({
      activeNode: activeId ? draggableNodes.get(activeId) : null,
      config: autoScrollOptions.layoutShiftCompensation,
      initialRect: initialActiveNodeRect,
      measure: measuringConfiguration.draggable.measure
    });
    const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
    const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
    const sensorContext = React__default.useRef({
      activatorEvent: null,
      active: null,
      activeNode,
      collisionRect: null,
      collisions: null,
      droppableRects,
      draggableNodes,
      draggingNode: null,
      draggingNodeRect: null,
      droppableContainers,
      over: null,
      scrollableAncestors: [],
      scrollAdjustedTranslate: null
    });
    const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
    const dragOverlay = useDragOverlayMeasuring({
      measure: measuringConfiguration.dragOverlay.measure
    });
    const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
    const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
    const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
    const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
    const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
    const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
    const scrollableAncestorRects = useRects(scrollableAncestors);
    const modifiedTranslate = applyModifiers(modifiers, {
      transform: {
        x: translate.x - nodeRectDelta.x,
        y: translate.y - nodeRectDelta.y,
        scaleX: 1,
        scaleY: 1
      },
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggingNodeRect,
      over: sensorContext.current.over,
      overlayNodeRect: dragOverlay.rect,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect
    });
    const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
    const scrollOffsets = useScrollOffsets(scrollableAncestors);
    const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
    const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
    const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
    const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
    const collisions = active && collisionRect ? collisionDetection({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: enabledDroppableContainers,
      pointerCoordinates
    }) : null;
    const overId = getFirstCollision(collisions, "id");
    const [over, setOver] = React__default.useState(null);
    const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
    const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
    const instantiateSensor = React__default.useCallback(
      (event, _ref22) => {
        let {
          sensor: Sensor,
          options
        } = _ref22;
        if (activeRef.current == null) {
          return;
        }
        const activeNode2 = draggableNodes.get(activeRef.current);
        if (!activeNode2) {
          return;
        }
        const activatorEvent2 = event.nativeEvent;
        const sensorInstance = new Sensor({
          active: activeRef.current,
          activeNode: activeNode2,
          event: activatorEvent2,
          options,
          // Sensors need to be instantiated with refs for arguments that change over time
          // otherwise they are frozen in time with the stale arguments
          context: sensorContext,
          onStart(initialCoordinates) {
            const id2 = activeRef.current;
            if (id2 == null) {
              return;
            }
            const draggableNode = draggableNodes.get(id2);
            if (!draggableNode) {
              return;
            }
            const {
              onDragStart
            } = latestProps.current;
            const event2 = {
              active: {
                id: id2,
                data: draggableNode.data,
                rect: activeRects
              }
            };
            require$$0.unstable_batchedUpdates(() => {
              onDragStart == null ? void 0 : onDragStart(event2);
              setStatus(Status.Initializing);
              dispatch({
                type: Action.DragStart,
                initialCoordinates,
                active: id2
              });
              dispatchMonitorEvent({
                type: "onDragStart",
                event: event2
              });
            });
          },
          onMove(coordinates) {
            dispatch({
              type: Action.DragMove,
              coordinates
            });
          },
          onEnd: createHandler(Action.DragEnd),
          onCancel: createHandler(Action.DragCancel)
        });
        require$$0.unstable_batchedUpdates(() => {
          setActiveSensor(sensorInstance);
          setActivatorEvent(event.nativeEvent);
        });
        function createHandler(type) {
          return async function handler() {
            const {
              active: active2,
              collisions: collisions2,
              over: over2,
              scrollAdjustedTranslate: scrollAdjustedTranslate2
            } = sensorContext.current;
            let event2 = null;
            if (active2 && scrollAdjustedTranslate2) {
              const {
                cancelDrop
              } = latestProps.current;
              event2 = {
                activatorEvent: activatorEvent2,
                active: active2,
                collisions: collisions2,
                delta: scrollAdjustedTranslate2,
                over: over2
              };
              if (type === Action.DragEnd && typeof cancelDrop === "function") {
                const shouldCancel = await Promise.resolve(cancelDrop(event2));
                if (shouldCancel) {
                  type = Action.DragCancel;
                }
              }
            }
            activeRef.current = null;
            require$$0.unstable_batchedUpdates(() => {
              dispatch({
                type
              });
              setStatus(Status.Uninitialized);
              setOver(null);
              setActiveSensor(null);
              setActivatorEvent(null);
              const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
              if (event2) {
                const handler2 = latestProps.current[eventName];
                handler2 == null ? void 0 : handler2(event2);
                dispatchMonitorEvent({
                  type: eventName,
                  event: event2
                });
              }
            });
          };
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [draggableNodes]
    );
    const bindActivatorToSensorInstantiator = React__default.useCallback((handler, sensor) => {
      return (event, active2) => {
        const nativeEvent = event.nativeEvent;
        const activeDraggableNode = draggableNodes.get(active2);
        if (
          // Another sensor is already instantiating
          activeRef.current !== null || // No active draggable
          !activeDraggableNode || // Event has already been captured
          nativeEvent.dndKit || nativeEvent.defaultPrevented
        ) {
          return;
        }
        const activationContext = {
          active: activeDraggableNode
        };
        const shouldActivate = handler(event, sensor.options, activationContext);
        if (shouldActivate === true) {
          nativeEvent.dndKit = {
            capturedBy: sensor.sensor
          };
          activeRef.current = active2;
          instantiateSensor(event, sensor);
        }
      };
    }, [draggableNodes, instantiateSensor]);
    const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
    useSensorSetup(sensors);
    useIsomorphicLayoutEffect(() => {
      if (activeNodeRect && status === Status.Initializing) {
        setStatus(Status.Initialized);
      }
    }, [activeNodeRect, status]);
    React__default.useEffect(
      () => {
        const {
          onDragMove
        } = latestProps.current;
        const {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          over: over2
        } = sensorContext.current;
        if (!active2 || !activatorEvent2) {
          return;
        }
        const event = {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          delta: {
            x: scrollAdjustedTranslate.x,
            y: scrollAdjustedTranslate.y
          },
          over: over2
        };
        require$$0.unstable_batchedUpdates(() => {
          onDragMove == null ? void 0 : onDragMove(event);
          dispatchMonitorEvent({
            type: "onDragMove",
            event
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
    );
    React__default.useEffect(
      () => {
        const {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          droppableContainers: droppableContainers2,
          scrollAdjustedTranslate: scrollAdjustedTranslate2
        } = sensorContext.current;
        if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
          return;
        }
        const {
          onDragOver
        } = latestProps.current;
        const overContainer = droppableContainers2.get(overId);
        const over2 = overContainer && overContainer.rect.current ? {
          id: overContainer.id,
          rect: overContainer.rect.current,
          data: overContainer.data,
          disabled: overContainer.disabled
        } : null;
        const event = {
          active: active2,
          activatorEvent: activatorEvent2,
          collisions: collisions2,
          delta: {
            x: scrollAdjustedTranslate2.x,
            y: scrollAdjustedTranslate2.y
          },
          over: over2
        };
        require$$0.unstable_batchedUpdates(() => {
          setOver(over2);
          onDragOver == null ? void 0 : onDragOver(event);
          dispatchMonitorEvent({
            type: "onDragOver",
            event
          });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [overId]
    );
    useIsomorphicLayoutEffect(() => {
      sensorContext.current = {
        activatorEvent,
        active,
        activeNode,
        collisionRect,
        collisions,
        droppableRects,
        draggableNodes,
        draggingNode,
        draggingNodeRect,
        droppableContainers,
        over,
        scrollableAncestors,
        scrollAdjustedTranslate
      };
      activeRects.current = {
        initial: draggingNodeRect,
        translated: collisionRect
      };
    }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
    useAutoScroller({
      ...autoScrollOptions,
      delta: translate,
      draggingRect: collisionRect,
      pointerCoordinates,
      scrollableAncestors,
      scrollableAncestorRects
    });
    const publicContext = React__default.useMemo(() => {
      const context = {
        active,
        activeNode,
        activeNodeRect,
        activatorEvent,
        collisions,
        containerNodeRect,
        dragOverlay,
        draggableNodes,
        droppableContainers,
        droppableRects,
        over,
        measureDroppableContainers,
        scrollableAncestors,
        scrollableAncestorRects,
        measuringConfiguration,
        measuringScheduled,
        windowRect
      };
      return context;
    }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
    const internalContext = React__default.useMemo(() => {
      const context = {
        activatorEvent,
        activators,
        active,
        activeNodeRect,
        ariaDescribedById: {
          draggable: draggableDescribedById
        },
        dispatch,
        draggableNodes,
        over,
        measureDroppableContainers
      };
      return context;
    }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
    return React__default.createElement(DndMonitorContext.Provider, {
      value: registerMonitorListener
    }, React__default.createElement(InternalContext.Provider, {
      value: internalContext
    }, React__default.createElement(PublicContext.Provider, {
      value: publicContext
    }, React__default.createElement(ActiveDraggableContext.Provider, {
      value: transform
    }, children)), React__default.createElement(RestoreFocus, {
      disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
    })), React__default.createElement(Accessibility, {
      ...accessibility,
      hiddenTextDescribedById: draggableDescribedById
    }));
    function getAutoScrollerOptions() {
      const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
      const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
      const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
      if (typeof autoScroll === "object") {
        return {
          ...autoScroll,
          enabled
        };
      }
      return {
        enabled
      };
    }
  });
  const NullContext = /* @__PURE__ */ React__default.createContext(null);
  const defaultRole = "button";
  const ID_PREFIX$1 = "Droppable";
  function useDraggable(_ref13) {
    let {
      id,
      data,
      disabled = false,
      attributes
    } = _ref13;
    const key2 = useUniqueId(ID_PREFIX$1);
    const {
      activators,
      activatorEvent,
      active,
      activeNodeRect,
      ariaDescribedById,
      draggableNodes,
      over
    } = React__default.useContext(InternalContext);
    const {
      role = defaultRole,
      roleDescription = "draggable",
      tabIndex = 0
    } = attributes != null ? attributes : {};
    const isDragging = (active == null ? void 0 : active.id) === id;
    const transform = React__default.useContext(isDragging ? ActiveDraggableContext : NullContext);
    const [node2, setNodeRef] = useNodeRef();
    const [activatorNode, setActivatorNodeRef] = useNodeRef();
    const listeners2 = useSyntheticListeners(activators, id);
    const dataRef = useLatestValue(data);
    useIsomorphicLayoutEffect(
      () => {
        draggableNodes.set(id, {
          id,
          key: key2,
          node: node2,
          activatorNode,
          data: dataRef
        });
        return () => {
          const node3 = draggableNodes.get(id);
          if (node3 && node3.key === key2) {
            draggableNodes.delete(id);
          }
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [draggableNodes, id]
    );
    const memoizedAttributes = React__default.useMemo(() => ({
      role,
      tabIndex,
      "aria-disabled": disabled,
      "aria-pressed": isDragging && role === defaultRole ? true : void 0,
      "aria-roledescription": roleDescription,
      "aria-describedby": ariaDescribedById.draggable
    }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
    return {
      active,
      activatorEvent,
      activeNodeRect,
      attributes: memoizedAttributes,
      isDragging,
      listeners: disabled ? void 0 : listeners2,
      node: node2,
      over,
      setNodeRef,
      setActivatorNodeRef,
      transform
    };
  }
  function useDndContext() {
    return React__default.useContext(PublicContext);
  }
  const ID_PREFIX$1$1 = "Droppable";
  const defaultResizeObserverConfig = {
    timeout: 25
  };
  function useDroppable(_ref13) {
    let {
      data,
      disabled = false,
      id,
      resizeObserverConfig
    } = _ref13;
    const key2 = useUniqueId(ID_PREFIX$1$1);
    const {
      active,
      dispatch,
      over,
      measureDroppableContainers
    } = React__default.useContext(InternalContext);
    const previous = React__default.useRef({
      disabled
    });
    const resizeObserverConnected = React__default.useRef(false);
    const rect = React__default.useRef(null);
    const callbackId = React__default.useRef(null);
    const {
      disabled: resizeObserverDisabled,
      updateMeasurementsFor,
      timeout: resizeObserverTimeout
    } = {
      ...defaultResizeObserverConfig,
      ...resizeObserverConfig
    };
    const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
    const handleResize = React__default.useCallback(
      () => {
        if (!resizeObserverConnected.current) {
          resizeObserverConnected.current = true;
          return;
        }
        if (callbackId.current != null) {
          clearTimeout(callbackId.current);
        }
        callbackId.current = setTimeout(() => {
          measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
          callbackId.current = null;
        }, resizeObserverTimeout);
      },
      //eslint-disable-next-line react-hooks/exhaustive-deps
      [resizeObserverTimeout]
    );
    const resizeObserver = useResizeObserver({
      callback: handleResize,
      disabled: resizeObserverDisabled || !active
    });
    const handleNodeChange = React__default.useCallback((newElement, previousElement) => {
      if (!resizeObserver) {
        return;
      }
      if (previousElement) {
        resizeObserver.unobserve(previousElement);
        resizeObserverConnected.current = false;
      }
      if (newElement) {
        resizeObserver.observe(newElement);
      }
    }, [resizeObserver]);
    const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
    const dataRef = useLatestValue(data);
    React__default.useEffect(() => {
      if (!resizeObserver || !nodeRef.current) {
        return;
      }
      resizeObserver.disconnect();
      resizeObserverConnected.current = false;
      resizeObserver.observe(nodeRef.current);
    }, [nodeRef, resizeObserver]);
    useIsomorphicLayoutEffect(
      () => {
        dispatch({
          type: Action.RegisterDroppable,
          element: {
            id,
            key: key2,
            disabled,
            node: nodeRef,
            rect,
            data: dataRef
          }
        });
        return () => dispatch({
          type: Action.UnregisterDroppable,
          key: key2,
          id
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id]
    );
    React__default.useEffect(() => {
      if (disabled !== previous.current.disabled) {
        dispatch({
          type: Action.SetDroppableDisabled,
          id,
          key: key2,
          disabled
        });
        previous.current.disabled = disabled;
      }
    }, [id, key2, disabled, dispatch]);
    return {
      active,
      rect,
      isOver: (over == null ? void 0 : over.id) === id,
      node: nodeRef,
      over,
      setNodeRef
    };
  }
  function restrictToBoundingRect(transform, rect, boundingRect) {
    const value = {
      ...transform
    };
    if (rect.top + transform.y <= boundingRect.top) {
      value.y = boundingRect.top - rect.top;
    } else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) {
      value.y = boundingRect.top + boundingRect.height - rect.bottom;
    }
    if (rect.left + transform.x <= boundingRect.left) {
      value.x = boundingRect.left - rect.left;
    } else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
      value.x = boundingRect.left + boundingRect.width - rect.right;
    }
    return value;
  }
  const restrictToParentElement = (_ref13) => {
    let {
      containerNodeRect,
      draggingNodeRect,
      transform
    } = _ref13;
    if (!draggingNodeRect || !containerNodeRect) {
      return transform;
    }
    return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
  };
  const restrictToVerticalAxis = (_ref13) => {
    let {
      transform
    } = _ref13;
    return {
      ...transform,
      x: 0
    };
  };
  function arrayMove(array, from2, to) {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from2, 1)[0]);
    return newArray;
  }
  function getSortedRects(items, rects) {
    return items.reduce((accumulator, id, index) => {
      const rect = rects.get(id);
      if (rect) {
        accumulator[index] = rect;
      }
      return accumulator;
    }, Array(items.length));
  }
  function isValidIndex(index) {
    return index !== null && index >= 0;
  }
  function itemsEqual(a2, b2) {
    if (a2 === b2) {
      return true;
    }
    if (a2.length !== b2.length) {
      return false;
    }
    for (let i2 = 0; i2 < a2.length; i2++) {
      if (a2[i2] !== b2[i2]) {
        return false;
      }
    }
    return true;
  }
  function normalizeDisabled(disabled) {
    if (typeof disabled === "boolean") {
      return {
        draggable: disabled,
        droppable: disabled
      };
    }
    return disabled;
  }
  const rectSortingStrategy = (_ref13) => {
    let {
      rects,
      activeIndex,
      overIndex,
      index
    } = _ref13;
    const newRects = arrayMove(rects, overIndex, activeIndex);
    const oldRect = rects[index];
    const newRect = newRects[index];
    if (!newRect || !oldRect) {
      return null;
    }
    return {
      x: newRect.left - oldRect.left,
      y: newRect.top - oldRect.top,
      scaleX: newRect.width / oldRect.width,
      scaleY: newRect.height / oldRect.height
    };
  };
  const defaultScale$1 = {
    scaleX: 1,
    scaleY: 1
  };
  const verticalListSortingStrategy = (_ref13) => {
    var _rects$activeIndex;
    let {
      activeIndex,
      activeNodeRect: fallbackActiveRect,
      index,
      rects,
      overIndex
    } = _ref13;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) {
      return null;
    }
    if (index === activeIndex) {
      const overIndexRect = rects[overIndex];
      if (!overIndexRect) {
        return null;
      }
      return {
        x: 0,
        y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
        ...defaultScale$1
      };
    }
    const itemGap = getItemGap$1(rects, index, activeIndex);
    if (index > activeIndex && index <= overIndex) {
      return {
        x: 0,
        y: -activeNodeRect.height - itemGap,
        ...defaultScale$1
      };
    }
    if (index < activeIndex && index >= overIndex) {
      return {
        x: 0,
        y: activeNodeRect.height + itemGap,
        ...defaultScale$1
      };
    }
    return {
      x: 0,
      y: 0,
      ...defaultScale$1
    };
  };
  function getItemGap$1(clientRects, index, activeIndex) {
    const currentRect = clientRects[index];
    const previousRect = clientRects[index - 1];
    const nextRect = clientRects[index + 1];
    if (!currentRect) {
      return 0;
    }
    if (activeIndex < index) {
      return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
    }
    return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
  }
  const ID_PREFIX = "Sortable";
  const Context = /* @__PURE__ */ React__default.createContext({
    activeIndex: -1,
    containerId: ID_PREFIX,
    disableTransforms: false,
    items: [],
    overIndex: -1,
    useDragOverlay: false,
    sortedRects: [],
    strategy: rectSortingStrategy,
    disabled: {
      draggable: false,
      droppable: false
    }
  });
  function SortableContext(_ref13) {
    let {
      children,
      id,
      items: userDefinedItems,
      strategy = rectSortingStrategy,
      disabled: disabledProp = false
    } = _ref13;
    const {
      active,
      dragOverlay,
      droppableRects,
      over,
      measureDroppableContainers
    } = useDndContext();
    const containerId = useUniqueId(ID_PREFIX, id);
    const useDragOverlay = Boolean(dragOverlay.rect !== null);
    const items = React__default.useMemo(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
    const isDragging = active != null;
    const activeIndex = active ? items.indexOf(active.id) : -1;
    const overIndex = over ? items.indexOf(over.id) : -1;
    const previousItemsRef = React__default.useRef(items);
    const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
    const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
    const disabled = normalizeDisabled(disabledProp);
    useIsomorphicLayoutEffect(() => {
      if (itemsHaveChanged && isDragging) {
        measureDroppableContainers(items);
      }
    }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
    React__default.useEffect(() => {
      previousItemsRef.current = items;
    }, [items]);
    const contextValue = React__default.useMemo(
      () => ({
        activeIndex,
        containerId,
        disabled,
        disableTransforms,
        items,
        overIndex,
        useDragOverlay,
        sortedRects: getSortedRects(items, droppableRects),
        strategy
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]
    );
    return React__default.createElement(Context.Provider, {
      value: contextValue
    }, children);
  }
  const defaultNewIndexGetter = (_ref13) => {
    let {
      id,
      items,
      activeIndex,
      overIndex
    } = _ref13;
    return arrayMove(items, activeIndex, overIndex).indexOf(id);
  };
  const defaultAnimateLayoutChanges = (_ref22) => {
    let {
      containerId,
      isSorting,
      wasDragging,
      index,
      items,
      newIndex,
      previousItems,
      previousContainerId,
      transition
    } = _ref22;
    if (!transition || !wasDragging) {
      return false;
    }
    if (previousItems !== items && index === newIndex) {
      return false;
    }
    if (isSorting) {
      return true;
    }
    return newIndex !== index && containerId === previousContainerId;
  };
  const defaultTransition = {
    duration: 200,
    easing: "ease"
  };
  const transitionProperty = "transform";
  const disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
    property: transitionProperty,
    duration: 0,
    easing: "linear"
  });
  const defaultAttributes = {
    roleDescription: "sortable"
  };
  function useDerivedTransform(_ref13) {
    let {
      disabled,
      index,
      node: node2,
      rect
    } = _ref13;
    const [derivedTransform, setDerivedtransform] = React__default.useState(null);
    const previousIndex = React__default.useRef(index);
    useIsomorphicLayoutEffect(() => {
      if (!disabled && index !== previousIndex.current && node2.current) {
        const initial = rect.current;
        if (initial) {
          const current = getClientRect(node2.current, {
            ignoreTransform: true
          });
          const delta = {
            x: initial.left - current.left,
            y: initial.top - current.top,
            scaleX: initial.width / current.width,
            scaleY: initial.height / current.height
          };
          if (delta.x || delta.y) {
            setDerivedtransform(delta);
          }
        }
      }
      if (index !== previousIndex.current) {
        previousIndex.current = index;
      }
    }, [disabled, index, node2, rect]);
    React__default.useEffect(() => {
      if (derivedTransform) {
        setDerivedtransform(null);
      }
    }, [derivedTransform]);
    return derivedTransform;
  }
  function useSortable(_ref13) {
    let {
      animateLayoutChanges = defaultAnimateLayoutChanges,
      attributes: userDefinedAttributes,
      disabled: localDisabled,
      data: customData,
      getNewIndex = defaultNewIndexGetter,
      id,
      strategy: localStrategy,
      resizeObserverConfig,
      transition = defaultTransition
    } = _ref13;
    const {
      items,
      containerId,
      activeIndex,
      disabled: globalDisabled,
      disableTransforms,
      sortedRects,
      overIndex,
      useDragOverlay,
      strategy: globalStrategy
    } = React__default.useContext(Context);
    const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
    const index = items.indexOf(id);
    const data = React__default.useMemo(() => ({
      sortable: {
        containerId,
        index,
        items
      },
      ...customData
    }), [containerId, customData, index, items]);
    const itemsAfterCurrentSortable = React__default.useMemo(() => items.slice(items.indexOf(id)), [items, id]);
    const {
      rect,
      node: node2,
      isOver,
      setNodeRef: setDroppableNodeRef
    } = useDroppable({
      id,
      data,
      disabled: disabled.droppable,
      resizeObserverConfig: {
        updateMeasurementsFor: itemsAfterCurrentSortable,
        ...resizeObserverConfig
      }
    });
    const {
      active,
      activatorEvent,
      activeNodeRect,
      attributes,
      setNodeRef: setDraggableNodeRef,
      listeners: listeners2,
      isDragging,
      over,
      setActivatorNodeRef,
      transform
    } = useDraggable({
      id,
      data,
      attributes: {
        ...defaultAttributes,
        ...userDefinedAttributes
      },
      disabled: disabled.draggable
    });
    const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
    const isSorting = Boolean(active);
    const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
    const shouldDisplaceDragSource = !useDragOverlay && isDragging;
    const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
    const strategy = localStrategy != null ? localStrategy : globalStrategy;
    const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
      rects: sortedRects,
      activeNodeRect,
      activeIndex,
      overIndex,
      index
    }) : null;
    const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
      id,
      items,
      activeIndex,
      overIndex
    }) : index;
    const activeId = active == null ? void 0 : active.id;
    const previous = React__default.useRef({
      activeId,
      items,
      newIndex,
      containerId
    });
    const itemsHaveChanged = items !== previous.current.items;
    const shouldAnimateLayoutChanges = animateLayoutChanges({
      active,
      containerId,
      isDragging,
      isSorting,
      id,
      index,
      items,
      newIndex: previous.current.newIndex,
      previousItems: previous.current.items,
      previousContainerId: previous.current.containerId,
      transition,
      wasDragging: previous.current.activeId != null
    });
    const derivedTransform = useDerivedTransform({
      disabled: !shouldAnimateLayoutChanges,
      index,
      node: node2,
      rect
    });
    React__default.useEffect(() => {
      if (isSorting && previous.current.newIndex !== newIndex) {
        previous.current.newIndex = newIndex;
      }
      if (containerId !== previous.current.containerId) {
        previous.current.containerId = containerId;
      }
      if (items !== previous.current.items) {
        previous.current.items = items;
      }
    }, [isSorting, newIndex, containerId, items]);
    React__default.useEffect(() => {
      if (activeId === previous.current.activeId) {
        return;
      }
      if (activeId && !previous.current.activeId) {
        previous.current.activeId = activeId;
        return;
      }
      const timeoutId = setTimeout(() => {
        previous.current.activeId = activeId;
      }, 50);
      return () => clearTimeout(timeoutId);
    }, [activeId]);
    return {
      active,
      activeIndex,
      attributes,
      data,
      rect,
      index,
      newIndex,
      items,
      isOver,
      isSorting,
      isDragging,
      listeners: listeners2,
      node: node2,
      overIndex,
      over,
      setNodeRef,
      setActivatorNodeRef,
      setDroppableNodeRef,
      setDraggableNodeRef,
      transform: derivedTransform != null ? derivedTransform : finalTransform,
      transition: getTransition()
    };
    function getTransition() {
      if (
        // Temporarily disable transitions for a single frame to set up derived transforms
        derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
        itemsHaveChanged && previous.current.newIndex === index
      ) {
        return disabledTransition;
      }
      if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) {
        return void 0;
      }
      if (isSorting || shouldAnimateLayoutChanges) {
        return CSS.Transition.toString({
          ...transition,
          property: transitionProperty
        });
      }
      return void 0;
    }
  }
  function normalizeLocalDisabled(localDisabled, globalDisabled) {
    var _localDisabled$dragga, _localDisabled$droppa;
    if (typeof localDisabled === "boolean") {
      return {
        draggable: localDisabled,
        // Backwards compatibility
        droppable: false
      };
    }
    return {
      draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
      droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
    };
  }
  [KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];
  const configIcon = "_config-icon_1th8l_1";
  const settingsGroup = "_settings-group_1th8l_7";
  const settingsGroupTitle = "_settings-group-title_1th8l_10";
  const settingsGroupSubTitle = "_settings-group-sub-title_1th8l_15";
  const settingsGroupContent = "_settings-group-content_1th8l_21";
  const row = "_row_1th8l_28";
  const check = "_check_1th8l_37";
  const settingTabs = "_setting-tabs_1th8l_43";
  const tabPane = "_tab-pane_1th8l_47";
  const styles$1 = {
    configIcon,
    settingsGroup,
    settingsGroupTitle,
    settingsGroupSubTitle,
    settingsGroupContent,
    row,
    check,
    settingTabs,
    tabPane
  };
  var _ref$4 = {
    name: "1ba68ro",
    styles: "min-width:60px;text-align:center;cursor:pointer"
  };
  var _ref2$4 = {
    name: "1kk26el",
    styles: "font-size:1.5em;display:flex;align-items:center;margin-top:10px"
  };
  function ThemesSelect() {
    const activeId = useCurrentTheme().id;
    const {
      colorPickerThemeSelectedColor
    } = useSettingsSnapshot();
    const [customColor, setCustomColor] = React__default.useState(colorPickerThemeSelectedColor || DEFAULT_BILI_PINK_THEME.colorPrimary);
    const customColorHex = React__default.useMemo(() => {
      return typeof customColor === "string" ? customColor : customColor.toHexString();
    }, [customColor]);
    return /* @__PURE__ */ jsx("div", {
      children: ThemeGroups.map(({
        name,
        themes,
        tooltip
      }) => {
        return /* @__PURE__ */ jsxs(React__default.Fragment, {
          children: [/* @__PURE__ */ jsxs("div", {
            css: _ref2$4,
            children: [name, /* @__PURE__ */ jsx(HelpInfo, {
              tooltip,
              tooltipProps: {
                color: "rgba(0, 0, 0, 0.85)"
              },
              iconProps: {
                name: "Tips",
                size: 16
              }
            })]
          }), /* @__PURE__ */ jsx("div", {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "2px 8px"
            },
            children: themes.map((t2) => {
              const isActive = activeId === t2.id;
              const isCustom = t2.isCustom;
              const innerSize = 30;
              const outerSize = innerSize + 8;
              let previewWrapper = /* @__PURE__ */ jsx("div", {
                className: "preview-wrapper",
                css: [/* @__PURE__ */ css("aspect-ratio:1;width:", outerSize, "px;border:2px solid transparent;border-radius:50%;margin:0 auto;font-size:0;", ""), flexCenterStyle, isActive && /* @__PURE__ */ css("border-color:", t2.colorPrimary, ";", ""), "", ""],
                children: /* @__PURE__ */ jsx("div", {
                  className: "preview",
                  css: [/* @__PURE__ */ css("aspect-ratio:1;width:", innerSize, "px;background-color:", isCustom ? customColorHex : t2.colorPrimary, ";border-radius:50%;", ""), flexCenterStyle, "", ""],
                  children: isActive && /* @__PURE__ */ jsx(IconPark, {
                    name: "CheckSmall",
                    size: 18,
                    fill: "#fff"
                  })
                })
              });
              if (t2.isCustom) {
                previewWrapper = /* @__PURE__ */ jsx(antd.ColorPicker, {
                  value: customColor,
                  onChange: (c2) => setCustomColor(c2),
                  onOpenChange: (open) => {
                    if (!open) {
                      updateSettings({
                        colorPickerThemeSelectedColor: customColorHex
                      });
                    }
                  },
                  children: previewWrapper
                });
              }
              return /* @__PURE__ */ jsxs("div", {
                css: _ref$4,
                onClick: (e2) => {
                  updateSettings({
                    theme: t2.id
                  });
                },
                children: [previewWrapper, t2.name]
              }, t2.id);
            })
          })]
        }, name);
      })
    });
  }
  async function toastAndReload() {
    AntdMessage.info("即将刷新网页");
    await delay(500);
    location.reload();
  }
  function onResetSettings() {
    resetSettings();
    return toastAndReload();
  }
  async function onRestoreSettings() {
    const remoteSettings = await getData();
    const pickedSettings = lodash.pick(remoteSettings || {}, allowedSettingsKeys);
    const len = Object.keys(pickedSettings).length;
    if (!len) {
      return AntdMessage.error("备份不存在或没有有效的配置");
    }
    set_HAS_RESTORED_SETTINGS(true);
    updateSettings({ ...pickedSettings });
    return toastAndReload();
  }
  function useHotkeyForConfig(hotkey, configKey, label) {
    return useKeyPress(hotkey, (e2) => {
      if (shouldDisableShortcut())
        return;
      settings[configKey] = !settings[configKey];
      const isCancel = !settings[configKey];
      AntdMessage.success(`已${isCancel ? "禁用" : "启用"}「${label}」`);
    }, { exactMatch: true });
  }
  const tab = "basic";
  const modalSettingsStore = proxy({ tab });
  var _ref12 = { name: "1a2afmv", styles: "margin-left:10px" };
  function ModalSettings({ show, onHide: onHide2 }) {
    const { filterEnabled, filterMinPlayCount, filterMinPlayCountEnabled, filterMinDuration, filterMinDurationEnabled, filterOutGotoTypePicture } = useSettingsSnapshot();
    useHotkeyForConfig(["shift.p"], "autoPreviewWhenKeyboardSelect", "键盘选中后自动开始预览");
    useHotkeyForConfig(["shift.m"], "autoPreviewWhenHover", "鼠标悬浮后自动开始预览");
    useHotkeyForConfig(["shift.c"], "useNarrowMode", "居中模式");
    useHotkeyForConfig(["shift.y"], "styleFancy", "Fancy Style");
    const { tab: tab2 } = useSnapshot(modalSettingsStore);
    return /* @__PURE__ */ jsxs(BaseModal, { ...{ show, onHide: onHide2, hideWhenMaskOnClick: true, hideWhenEsc: true, styleModal: { width: 900, maxHeight: "unset" } }, children: [/* @__PURE__ */ jsxs("div", { className: BaseModalClass.modalHeader, children: [/* @__PURE__ */ jsxs("div", { className: BaseModalClass.modalTitle, children: [/* @__PURE__ */ jsx(IconPark, { name: "Config", className: styles$1.configIcon }), "设置项"] }), /* @__PURE__ */ jsx("div", { className: "space", style: { flex: 1 } }), /* @__PURE__ */ jsx(ModalClose, { onClick: onHide2 })] }), /* @__PURE__ */ jsx("main", { className: BaseModalClass.modalBody, style: { overflow: "hidden" }, children: /* @__PURE__ */ jsx(antd.Tabs, { tabPosition: "left", size: "middle", className: styles$1.settingTabs, activeKey: tab2, onChange: (tab3) => modalSettingsStore.tab = tab3, items: [{ label: "常规设置", key: "basic", children: /* @__PURE__ */ jsx(TabPaneBasic, {}) }, { label: "内容过滤", key: "filter", children: /* @__PURE__ */ jsx("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: ["内容过滤", /* @__PURE__ */ jsx(HelpInfo, { iconProps: { name: "Tips" }, tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["启用过滤会大幅降低加载速度, 谨慎开启! ", /* @__PURE__ */ jsx("br", {}), "仅推荐类 Tab 生效"] }) }), /* @__PURE__ */ jsx(antd.Switch, { css: _ref12, checked: filterEnabled, onChange: (val) => {
      updateSettings({ filterEnabled: val });
    } })] }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent), children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupSubTitle, children: "视频" }), /* @__PURE__ */ jsxs("div", { className: styles$1.row, children: [/* @__PURE__ */ jsx(FlagSettingItem, { disabled: !filterEnabled, configKey: "filterMinPlayCountEnabled", label: "按播放量过滤", tooltip: /* @__PURE__ */ jsx(Fragment, { children: "不显示播放量很少的视频" }) }), /* @__PURE__ */ jsx(antd.InputNumber, { size: "small", min: 1, step: 1e3, value: filterMinPlayCount, onChange: (val) => val && updateSettings({ filterMinPlayCount: val }), disabled: !filterEnabled || !filterMinPlayCountEnabled })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.row, style: { marginTop: 3 }, children: [/* @__PURE__ */ jsx(FlagSettingItem, { configKey: "filterMinDurationEnabled", label: "按视频时长过滤", tooltip: /* @__PURE__ */ jsx(Fragment, { children: "不显示短视频" }), disabled: !filterEnabled }), /* @__PURE__ */ jsx(antd.InputNumber, { style: { width: 150 }, size: "small", min: 1, step: 10, addonAfter: "单位:秒", value: filterMinDuration, onChange: (val) => val && updateSettings({ filterMinDuration: val }), disabled: !filterEnabled || !filterMinDurationEnabled })] }), /* @__PURE__ */ jsx(FlagSettingItem, { className: styles$1.row, style: { marginTop: 3 }, configKey: "enableFilterForFollowedVideo", label: "对「已关注」的视频启用过滤", tooltip: /* @__PURE__ */ jsx(Fragment, { children: "默认不过滤「已关注」" }), disabled: !filterEnabled }), /* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupSubTitle, children: "图文" }), /* @__PURE__ */ jsx(FlagSettingItem, { className: styles$1.row, configKey: "filterOutGotoTypePicture", label: "启用图文(动态 & 专栏)过滤", tooltip: /* @__PURE__ */ jsx(Fragment, { children: "过滤掉图文推荐" }), disabled: !filterEnabled }), /* @__PURE__ */ jsx(FlagSettingItem, { className: styles$1.row, disabled: !filterEnabled || !filterOutGotoTypePicture, configKey: "enableFilterForFollowedPicture", label: "对「已关注」的图文启用过滤", tooltip: /* @__PURE__ */ jsx(Fragment, { children: "默认不过滤「已关注」" }) })] })] }) }) }, { label: "外观设置", key: "ui", children: /* @__PURE__ */ jsx("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, style: { marginBottom: 15 }, children: "样式自定义" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent), children: [/* @__PURE__ */ jsx("div", { className: styles$1.row, children: /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "styleFancy", label: "Fancy Style", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["增加卡片大小, 增大卡片间距", /* @__PURE__ */ jsx("br", {}), "视频卡片会显示头像", /* @__PURE__ */ jsx("br", {}), "切换设置快捷键: ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "shift+y" })] }) }) }), /* @__PURE__ */ jsx("div", { className: styles$1.row, style: { marginTop: 5 }, children: /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "styleUseStandardVideoSourceTab", label: "推荐源切换 Tab 按钮: 使用标准高度", tooltip: "默认紧凑高度" }) }), /* @__PURE__ */ jsx("div", { className: styles$1.row, style: { marginTop: 5 }, children: /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "styleUseStickyTabbarInPureRecommend", label: "纯推荐模式: stick tab bar", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["默认勾选: Tab 栏会吸附在顶栏下方", /* @__PURE__ */ jsx("br", {}), "取消选中: Tab 栏会随页面一起滚动"] }) }) })] })] }) }) }, { label: "主题选择", key: "theme-select", children: /* @__PURE__ */ jsx("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, style: { marginBottom: 15 }, children: "主题选择" }), /* @__PURE__ */ jsx("div", { className: cx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsx(ThemesSelect, {}) })] }) }) }, { label: "Tab 设置", key: "video-source-tab-config", children: /* @__PURE__ */ jsx(TabPaneVideoSourceTabConfig, {}) }, { label: "高级设置", key: "advance", children: /* @__PURE__ */ jsx(TabPaneAdvance, {}) }] }) })] });
  }
  var _ref10 = { name: "15c7vdh", styles: "position:relative;top:4px;cursor:pointer" };
  var _ref11 = { name: "velg6b", styles: "margin-left:8px;margin-right:4px;font-size:14px;position:relative;top:4px" };
  function TabPaneBasic() {
    return /* @__PURE__ */ jsxs("div", { className: styles$1.tabPane, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: ["access_key", /* @__PURE__ */ jsx(HelpInfo, { iconProps: { name: "Help", size: 18, style: { marginTop: 6, marginLeft: 5 } }, tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["用于「推荐」Tab", /* @__PURE__ */ jsx("br", {}), "用于 获取推荐 / 提交不喜欢等操作"] }) })] }), /* @__PURE__ */ jsx("div", { className: cx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsx("div", { className: styles$1.row, style: { marginTop: 5 }, children: /* @__PURE__ */ jsx(AccessKeyManage, {}) }) })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, children: "开关" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent, styles$1.row), children: [/* @__PURE__ */ jsx(FlagSettingItem, { configKey: "pureRecommend", label: "纯推荐模式", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["首页只保留推荐", /* @__PURE__ */ jsx("br", {}), "P.S 需要刷新网页~"] }), className: styles$1.check, extraAction: toastAndReload }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "useNarrowMode", label: "居中模式", tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["居中两列", /* @__PURE__ */ jsx("br", {}), "切换设置快捷键: ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "shift+c" })] }), className: styles$1.check }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "showModalFeedOnLoad", label: "自动「查看更多」", tooltip: "打开首页时自动打开「查看更多」弹窗", className: styles$1.check, extraAction: (val) => {
      if (val) {
        AntdMessage.success("已开启自动「查看更多」: 下次打开首页时将自动打开「查看更多」弹窗");
      }
    } }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "showModalFeedEntry", label: "「查看更多」按钮", tooltip: "是否展示「查看更多」按钮", className: styles$1.check })] })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, children: "视频链接" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent, styles$1.row), children: [/* @__PURE__ */ jsx(FlagSettingItem, { configKey: "openVideoInPopupWhenClick", label: "默认「小窗打开」", tooltip: "点击视频链接默认行为改为「小窗打开」并自动网页全屏", className: styles$1.check }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "openVideoAutoFullscreen", label: "打开视频后自动全屏", tooltip: "点击视频链接新窗口打开视频后「自动全屏」", className: styles$1.check })] })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, children: "预览" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent, styles$1.row), children: [/* @__PURE__ */ jsx(FlagSettingItem, { configKey: "autoPreviewWhenKeyboardSelect", label: "键盘选中后自动开始预览", className: styles$1.check, tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["手动预览快捷键: ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "." }), " or ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "p" }), /* @__PURE__ */ jsx("br", {}), "切换设置快捷键: ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "shift+p" })] }) }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "autoPreviewWhenHover", label: "鼠标悬浮后自动开始预览", className: styles$1.check, tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["鼠标悬浮后自动开始预览, 预览不再跟随鼠标位置 ", /* @__PURE__ */ jsx("br", {}), "切换设置快捷键: ", /* @__PURE__ */ jsx(antd.Tag, { color: "green", children: "shift+m" })] }) })] })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: ["帮助", /* @__PURE__ */ jsxs("span", { css: _ref11, children: ["(当前版本: v", "0.20.2", ")"] }), /* @__PURE__ */ jsx(IconPark, { name: "Copy", size: 16, onClick: () => {
      const content = `v${"0.20.2"}`;
      GM.setClipboard(content);
      AntdMessage.success(`已复制当前版本: ${content}`);
    }, css: _ref10 })] }), /* @__PURE__ */ jsx("div", { className: cx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsx("div", { className: styles$1.row, children: /* @__PURE__ */ jsxs(antd.Space, { size: "small", children: [/* @__PURE__ */ jsx(antd.Button, { href: "https://github.com/magicdawn/bilibili-app-recommend", target: "_blank", children: "GitHub 主页" }), /* @__PURE__ */ jsx(antd.Button, { href: "https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend", target: "_blank", children: "GreasyFork 主页" }), /* @__PURE__ */ jsx(antd.Button, { href: "https://github.com/magicdawn/bilibili-app-recommend#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E", target: "_blank", children: "查看可用的快捷键" }), /* @__PURE__ */ jsx(antd.Button, { href: "https://github.com/magicdawn/bilibili-app-recommend/blob/main/CHANGELOG.md", target: "_blank", children: "更新日志" }), /* @__PURE__ */ jsx(antd.Button, { href: "https://afdian.net/a/magicdawn", target: "_blank", children: "用 ❤️ 发电" })] }) }) })] })] });
  }
  function TabPaneAdvance() {
    const { autoPreviewUpdateInterval, appApiDecice } = useSettingsSnapshot();
    return /* @__PURE__ */ jsx("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, children: "设置项" }), /* @__PURE__ */ jsx("div", { className: cx(styles$1.settingsGroupContent), children: /* @__PURE__ */ jsx("div", { className: styles$1.row, children: /* @__PURE__ */ jsx(antd.Popconfirm, { title: "确定", description: "确定恢复默认设置? 该操作不可逆!", onConfirm: onResetSettings, children: /* @__PURE__ */ jsx(antd.Button, { danger: true, type: "primary", children: "恢复默认设置" }) }) }) }), /* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, style: { marginTop: 15 }, children: "备份/恢复" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent), children: [/* @__PURE__ */ jsxs("div", { className: styles$1.row, children: [/* @__PURE__ */ jsx(FlagSettingItem, { configKey: "backupSettingsToArticleDraft", label: "备份设置到专栏草稿箱中", tooltip: `专栏 - 草稿箱 - ${APP_NAME}` }), /* @__PURE__ */ jsxs("a", { style: { marginLeft: 15, display: "inline-flex", alignItems: "center" }, href: "https://member.bilibili.com/platform/upload/text/draft", target: "_blank", children: [/* @__PURE__ */ jsx(IconPark, { name: "EfferentFour", size: 16, style: { marginRight: 4 } }), "去草稿箱浏览"] })] }), /* @__PURE__ */ jsx("div", { className: styles$1.row, style: { marginTop: 5 }, children: /* @__PURE__ */ jsx(antd.Popconfirm, { title: "确定", description: "将覆盖本地设置? 该操作不可逆!", onConfirm: onRestoreSettings, children: /* @__PURE__ */ jsx(antd.Button, { danger: true, type: "primary", children: "从专栏草稿箱中恢复" }) }) })] }), /* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, style: { marginTop: 15 }, children: "预览" }), /* @__PURE__ */ jsxs("div", { style: { width: "100%", display: "flex", alignItems: "center" }, children: ["自动预览更新间隔", /* @__PURE__ */ jsx(antd.Slider, { style: { flex: 1, margin: "0 15px" }, min: 0, max: 1e3, keyboard: true, onChange: (val) => settings.autoPreviewUpdateInterval = val, value: autoPreviewUpdateInterval }), /* @__PURE__ */ jsxs("span", { style: { width: "65px" }, children: ["(", autoPreviewUpdateInterval, "ms)"] })] }), /* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, style: { marginTop: 15 }, children: "App 推荐" }), /* @__PURE__ */ jsxs("div", { style: { width: "100%", display: "flex", alignItems: "center" }, children: ["App API 设备类型", /* @__PURE__ */ jsx(HelpInfo, { iconProps: { name: "Tips", style: { marginLeft: 5, marginRight: 10 } }, tooltip: /* @__PURE__ */ jsxs(Fragment, { children: ["默认 ipad, 视频有 头像/日期 等信息", /* @__PURE__ */ jsx("br", {}), "可选 android, 有图文类型的推荐"] }) }), /* @__PURE__ */ jsx(antd.Radio.Group, { optionType: "button", buttonStyle: "solid", size: "small", options: [AppApiDevice.ipad, AppApiDevice.android], value: appApiDecice, onChange: (e2) => updateSettings({ appApiDecice: e2.target.value }) })] })] }) });
  }
  var _ref5 = { name: "1hzl8wy", styles: "margin-left:20px!important" };
  var _ref6 = { name: "ypff5m", styles: "min-width:100px" };
  var _ref7 = { name: "1hzl8wy", styles: "margin-left:20px!important" };
  var _ref8 = { name: "ypff5m", styles: "min-width:100px" };
  var _ref9 = { name: "rsr636", styles: "display:grid;grid-template-columns:300px 1fr;column-gap:20px" };
  function TabPaneVideoSourceTabConfig() {
    return /* @__PURE__ */ jsx("div", { className: styles$1.tabPane, children: /* @__PURE__ */ jsxs("div", { css: _ref9, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroupTitle, children: ["Tab 设置", /* @__PURE__ */ jsx(HelpInfo, { iconProps: { name: "Tips", style: { marginLeft: 5, marginRight: 20 } }, tooltip: /* @__PURE__ */ jsx(Fragment, { children: "勾选显示, 拖动排序" }) }), /* @__PURE__ */ jsx(antd.Popconfirm, { title: "确定", description: "确定不是手欠点着玩? 再点一次确定吧~", onConfirm: () => {
      updateSettings({ hidingTabKeys: [], customTabKeysOrder: [] });
    }, children: /* @__PURE__ */ jsx(antd.Button, { children: "重置" }) })] }), /* @__PURE__ */ jsx(VideoSourceTabOrder, {})] }), /* @__PURE__ */ jsxs("div", { className: styles$1.settingsGroup, children: [/* @__PURE__ */ jsx("div", { className: styles$1.settingsGroupTitle, children: "更多设置" }), /* @__PURE__ */ jsxs("div", { className: cx(styles$1.settingsGroupContent), children: [/* @__PURE__ */ jsxs("div", { className: styles$1.row, children: [/* @__PURE__ */ jsx("span", { css: _ref8, children: "「稍后再看」" }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "shuffleForWatchLater", label: "随机顺序", tooltip: "不包括近期添加的「稍后再看」" }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "addSeparatorForWatchLater", label: "添加分割线", tooltip: "添加「近期」「更早」分割线", css: _ref7 })] }), /* @__PURE__ */ jsxs("div", { className: styles$1.row, children: [/* @__PURE__ */ jsx("span", { css: _ref6, children: "「收藏」" }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "shuffleForFav", label: "随机顺序", tooltip: "随机收藏" }), /* @__PURE__ */ jsx(FlagSettingItem, { configKey: "addSeparatorForFav", label: "添加分割线", tooltip: "顺序显示时, 按收藏夹添加分割线", css: _ref5 })] })] })] })] }) });
  }
  var _ref4 = { name: "b1rfuh", styles: "display:block;line-height:unset" };
  function VideoSourceTabOrder() {
    const currentShowingTabKeys = useCurrentShowingTabKeys();
    const sortedTabKeys = useSortedTabKeys();
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = useMemoizedFn((e2) => {
      const { over, active } = e2;
      if (!(over == null ? void 0 : over.id))
        return;
      if (over.id === active.id)
        return;
      const oldIndex = sortedTabKeys.indexOf(active.id.toString());
      const newIndex = sortedTabKeys.indexOf(over.id.toString());
      const item = sortedTabKeys[oldIndex];
      const newSortedKeys = sortedTabKeys.slice();
      newSortedKeys.splice(oldIndex, 1);
      newSortedKeys.splice(newIndex, 0, item);
      updateSettings({ customTabKeysOrder: newSortedKeys });
    });
    return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(antd.Checkbox.Group, { css: _ref4, value: currentShowingTabKeys, onChange: (newVal) => {
      if (!newVal.length) {
        return AntdMessage.error("至少选择一项!");
      }
      updateSettings({ hidingTabKeys: TabKeys.filter((k2) => !newVal.includes(k2)) });
    }, children: /* @__PURE__ */ jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis, restrictToParentElement], children: /* @__PURE__ */ jsx(SortableContext, { items: sortedTabKeys, strategy: verticalListSortingStrategy, children: sortedTabKeys.map((key2) => /* @__PURE__ */ jsx(VideoSourceTabSortableItem, { id: key2 }, key2)) }) }) }) });
  }
  var _ref$3 = { name: "82a6rk", styles: "flex:1" };
  var _ref2$3 = { name: "fhwcsu", styles: "margin:0 5px 0 10px" };
  var _ref3$1 = { name: "8irbms", styles: "display:inline-flex;align-items:center" };
  function VideoSourceTabSortableItem({ id }) {
    const { attributes, listeners: listeners2, setNodeRef, transform, transition, setActivatorNodeRef } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const { label, desc, icon, iconProps } = TabConfigMap[id];
    const dark = useIsDarkMode();
    return /* @__PURE__ */ jsxs("div", { ref: setNodeRef, style, ...attributes, css: /* @__PURE__ */ css("display:flex;align-items:center;justify-content:flex-start;height:35px;padding-left:20px;border:1px solid ", !dark ? "#ddd" : "#444", ";border-radius:6px;margin-top:6px;", ""), children: [/* @__PURE__ */ jsx(antd.Checkbox, { value: id }), /* @__PURE__ */ jsxs(AntdTooltip, { title: desc, css: _ref3$1, children: [/* @__PURE__ */ jsx(IconPark, { name: icon, ...iconProps, size: (iconProps == null ? void 0 : iconProps.size) || 18, css: _ref2$3 }), label] }), /* @__PURE__ */ jsx("div", { css: _ref$3 }), /* @__PURE__ */ jsx("div", { ...listeners2, ref: setActivatorNodeRef, css: /* @__PURE__ */ css("cursor:grab;font-size:0;padding:5px;margin-right:10px;border-radius:5px;&:hover{background-color:", !dark ? "#eee" : "#999", ";}", ""), children: /* @__PURE__ */ jsx(IconPark, { name: "Drag", size: 18 }) })] }, id);
  }
  function useSticky() {
    const stickyRef = React__default.useRef(null);
    const [sticky, setSticky] = React__default.useState(false);
    React__default.useEffect(() => {
      function observe2() {
        if (!stickyRef.current)
          return;
        const refPageOffset = Math.trunc(stickyRef.current.getBoundingClientRect().top * 10) / 10;
        const stickyOffset = parseInt(getComputedStyle(stickyRef.current).top);
        const stickyActive = refPageOffset <= stickyOffset;
        setSticky(stickyActive);
      }
      observe2();
      document.addEventListener("scroll", observe2);
      window.addEventListener("resize", observe2);
      window.addEventListener("orientationchange", observe2);
      return () => {
        document.removeEventListener("scroll", observe2);
        window.removeEventListener("resize", observe2);
        window.removeEventListener("orientationchange", observe2);
      };
    }, [sticky]);
    return [stickyRef, sticky];
  }
  const RefreshButton = React__default.forwardRef(function({
    onRefresh,
    className = "",
    style,
    refreshHotkeyEnabled,
    refreshing
  }, ref) {
    refreshHotkeyEnabled ?? (refreshHotkeyEnabled = true);
    React__default.useState(0);
    const btn = React__default.useRef(null);
    const click = useMemoizedFn(() => {
      if (!btn.current)
        return;
      if (btn.current.disabled)
        return;
      btn.current.click();
    });
    React__default.useImperativeHandle(ref, () => ({
      click
    }), []);
    useKeyPress("r", () => {
      if (shouldDisableShortcut())
        return;
      if (!refreshHotkeyEnabled)
        return;
      click();
    }, {
      exactMatch: true
    });
    const tab2 = useCurrentSourceTab();
    const {
      shuffleForFav,
      shuffleForWatchLater,
      shuffleForPopularWeekly
    } = useSettingsSnapshot();
    const text = tab2 === "dynamic-feed" || tab2 === "watchlater" && !shuffleForWatchLater || tab2 === "fav" && !shuffleForFav || tab2 === "popular-general" || tab2 === "popular-weekly" && !shuffleForPopularWeekly ? "刷新" : "换一换";
    const [scope, animate] = framerMotion.useAnimate();
    const onClick = useMemoizedFn((e2) => {
      animate(scope.current, {
        rotate: [0, 360]
      }, {
        duration: 0.5,
        type: "tween"
      });
      return onRefresh == null ? void 0 : onRefresh();
    });
    return /* @__PURE__ */ jsxs(antd.Button, {
      disabled: refreshing,
      className,
      style,
      css: /* @__PURE__ */ css(flexCenterStyle, " &.ant-btn:not(:disabled):focus-visible{outline:none;}", ""),
      ref: btn,
      onClick,
      children: [/* @__PURE__ */ jsx("svg", {
        ref: scope,
        style: {
          width: "11px",
          height: "11px",
          marginRight: 5
        },
        children: /* @__PURE__ */ jsx("use", {
          href: "#widget-roll"
        })
      }), /* @__PURE__ */ jsx("span", {
        css: antdBtnTextStyle,
        children: text
      })]
    });
  });
  var _ref$2 = {
    name: "q1c343",
    styles: "transform:rotateZ(0deg)"
  };
  var _ref2$2 = {
    name: "1dvos8d",
    styles: "width:13px;height:13px;transform:rotateZ(180deg)"
  };
  var _ref3 = {
    name: "28jp32",
    styles: "padding:0;width:31px;height:31px;border-radius:50%;body.dark &{color:#eee!important;border-color:transparent!important;background-color:#333!important;&:hover{background-color:#555!important;}}"
  };
  const CollapseBtn = React__default.forwardRef(function CollapseBtn2({
    children,
    initialOpen = false
  }, ref) {
    const [buttonsExpanded, buttonsExpandedActions] = useToggle(initialOpen);
    React__default.useImperativeHandle(ref, () => buttonsExpandedActions, [buttonsExpandedActions]);
    const btn = /* @__PURE__ */ jsx("button", {
      onClick: buttonsExpandedActions.toggle,
      className: "primary-btn",
      css: _ref3,
      children: /* @__PURE__ */ jsx("svg", {
        css: [_ref2$2, buttonsExpanded && _ref$2, "", ""],
        children: /* @__PURE__ */ jsx("use", {
          href: "#widget-arrow"
        })
      })
    });
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [btn, buttonsExpanded && children]
    });
  });
  const modalMask = "_modal-mask_14tde_1";
  const narrowMode = "_narrow-mode_14tde_1";
  const modal = "_modal_14tde_1";
  const fullScreenMode = "_full-screen-mode_14tde_19";
  const modalHeader = "_modal-header_14tde_24";
  const modalBody = "_modal-body_14tde_25";
  const btnRefresh = "_btn-refresh_14tde_29";
  const styles = {
    modalMask,
    narrowMode,
    modal,
    fullScreenMode,
    modalHeader,
    modalBody,
    btnRefresh
  };
  var _ref2$1 = {
    name: "1q4vxyr",
    styles: "margin-left:8px"
  };
  const ModalFeed = React__default.memo(function ModalFeed2({
    show,
    onHide: onHide2
  }) {
    const scrollerRef = React__default.useRef(null);
    const recGridRef = React__default.useRef(null);
    const {
      // 双列模式
      useNarrowMode,
      // 全屏模式
      modalFeedFullScreen
    } = useSettingsSnapshot();
    const useFullScreen = !useNarrowMode && modalFeedFullScreen;
    const dark = useIsDarkMode();
    const moreStyles = React__default.useMemo(() => ({
      [styles.narrowMode]: useNarrowMode,
      [styles.fullScreenMode]: useFullScreen
    }), [useNarrowMode, useFullScreen]);
    const modalBorderStyle = React__default.useMemo(() => {
      if (useFullScreen) {
        return {
          border: `5px solid ${colorPrimaryValue}`
        };
      } else if (dark) {
        return {
          border: `1px solid ${colorPrimaryValue}`
        };
      }
    }, [dark, useFullScreen]);
    const onRefresh = useMemoizedFn((...args) => {
      var _a2;
      return (_a2 = recGridRef.current) == null ? void 0 : _a2.refresh(...args);
    });
    const [extraInfo, setExtraInfo] = React__default.useState(null);
    const onScrollToTop = useMemoizedFn(() => {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = 0;
      }
    });
    const [refreshing, setRefreshing] = React__default.useState(false);
    return /* @__PURE__ */ jsx(BaseModal, {
      ...{
        show,
        onHide: onHide2
      },
      clsModalMask: cx(moreStyles),
      clsModal: cx(styles.modal, moreStyles),
      styleModal: {
        ...modalBorderStyle
      },
      children: /* @__PURE__ */ jsxs(OnRefreshContext.Provider, {
        value: onRefresh,
        children: [/* @__PURE__ */ jsxs("div", {
          className: cx(BaseModalClass.modalHeader, styles.modalHeader),
          children: [/* @__PURE__ */ jsx(VideoSourceTab, {
            onRefresh
          }), extraInfo, /* @__PURE__ */ jsx("div", {
            className: "space",
            style: {
              flex: 1
            }
          }), useNarrowMode ? null : useFullScreen ? /* @__PURE__ */ jsx(ModalFeedConfigChecks, {}) : /* @__PURE__ */ jsx(CollapseBtn, {
            initialOpen: true,
            children: /* @__PURE__ */ jsx(ModalFeedConfigChecks, {})
          }), /* @__PURE__ */ jsx(RefreshButton, {
            css: _ref2$1,
            refreshing,
            onRefresh,
            className: styles.btnRefresh,
            refreshHotkeyEnabled: show
          }), /* @__PURE__ */ jsx(ModalClose, {
            onClick: onHide2
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: cx(BaseModalClass.modalBody, styles.modalBody),
          ref: scrollerRef,
          children: /* @__PURE__ */ jsx(RecGrid, {
            ref: recGridRef,
            shortcutEnabled: show,
            onScrollToTop,
            infiteScrollUseWindow: false,
            scrollerRef,
            setRefreshing,
            setExtraInfo
          })
        })]
      })
    });
  });
  var _ref$1 = {
    name: "1qkltea",
    styles: "margin-left:5px"
  };
  function ModalFeedConfigChecks() {
    const inModalFeedStyle = _ref$1;
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(FlagSettingItem, {
        configKey: "showModalFeedOnLoad",
        label: "自动查看更多",
        tooltip: "打开首页时默认打开推荐弹窗",
        css: inModalFeedStyle,
        extraAction: (val) => {
          if (val) {
            AntdMessage.success("已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗");
          }
        }
      }), /* @__PURE__ */ jsx(FlagSettingItem, {
        configKey: "modalFeedFullScreen",
        label: "全屏",
        tooltip: "世界清净了~",
        css: inModalFeedStyle
      })]
    });
  }
  const headerState = proxy({
    modalFeedVisible: settings.showModalFeedOnLoad,
    modalConfigVisible: false
  });
  const useHeaderState = function() {
    return useSnapshot(headerState);
  };
  const showModalFeed = () => {
    headerState.modalFeedVisible = true;
  };
  const hideModalFeed = () => {
    headerState.modalFeedVisible = false;
  };
  const showModalConfig = () => {
    headerState.modalConfigVisible = true;
  };
  const hideModalConfig = () => {
    headerState.modalConfigVisible = false;
  };
  const debug$2 = baseDebug.extend("RecHeader");
  const configStyles = {
    btn: /* @__PURE__ */ css("padding:0;width:32px;height:32px;border-radius:50%;", flexCenterStyle, ";", ""),
    icon: {
      name: "1k4rqoq",
      styles: "svg{width:14px;height:14px;}"
    }
  };
  var _ref = {
    name: "1fkic3w",
    styles: "width:12px;height:12px;margin-left:2px"
  };
  var _ref2 = {
    name: "166xca0",
    styles: "margin-bottom:0;height:50px"
  };
  const RecHeader = React__default.forwardRef(function RecHeader2({
    onRefresh,
    refreshing,
    leftSlot,
    rightSlot
  }, ref) {
    const {
      accessKey,
      pureRecommend,
      styleFancy,
      showModalFeedEntry,
      styleUseStickyTabbarInPureRecommend
    } = useSettingsSnapshot();
    const {
      modalFeedVisible,
      modalConfigVisible
    } = useSnapshot(headerState);
    useKeyPress(["shift.comma"], (e2) => {
      if (shouldDisableShortcut())
        return;
      headerState.modalConfigVisible = !headerState.modalConfigVisible;
    }, {
      exactMatch: true
    });
    const [stickyRef, sticky] = useSticky();
    const scroll = useMemoizedFn(() => {
      var _a2;
      if (!pureRecommend)
        return;
      const container = (_a2 = stickyRef.current) == null ? void 0 : _a2.parentElement;
      if (!container)
        return;
      const rect = container.getBoundingClientRect();
      const headerHeight2 = getHeaderHeight();
      if (rect.top < headerHeight2) {
        const relativeScrolltop = headerHeight2 - rect.top + 1;
        debug$2("changing scroll on refresh: rect.top = %s, headerHeight = %s, scrollTop -= %s", rect.top, headerHeight2, relativeScrolltop);
        document.documentElement.scrollTop -= relativeScrolltop;
      }
    });
    React__default.useImperativeHandle(ref, () => ({
      scroll
    }));
    const headerHeight = useHeaderHeight();
    const isInternalTesting = getIsInternalTesting();
    return /* @__PURE__ */ jsx(Fragment, {
      children: /* @__PURE__ */ jsxs(OnRefreshContext.Provider, {
        value: onRefresh,
        children: [/* @__PURE__ */ jsxs("div", {
          ref: stickyRef,
          className: "area-header",
          css: [_ref2, pureRecommend && styleUseStickyTabbarInPureRecommend && /* @__PURE__ */ css("position:sticky;top:", headerHeight - 1, "px;z-index:1000;", ""), pureRecommend && styleUseStickyTabbarInPureRecommend && sticky && /* @__PURE__ */ css("background-color:var(--", styleFancy ? "bg2" : "bg1", "_float);box-shadow:0 2px 4px rgb(0 0 0 / 8%);", ""), "", ""],
          children: [/* @__PURE__ */ jsxs("div", {
            className: "left",
            children: [!pureRecommend && !isInternalTesting && /* @__PURE__ */ jsx("svg", {
              className: "icon",
              children: /* @__PURE__ */ jsx("use", {
                href: "#channel-cinephile"
              })
            }), /* @__PURE__ */ jsx(VideoSourceTab, {
              onRefresh
            }), leftSlot]
          }), /* @__PURE__ */ jsx("div", {
            className: "right",
            children: /* @__PURE__ */ jsxs(antd.Space, {
              size: "small",
              children: [rightSlot, !accessKey && /* @__PURE__ */ jsx(AccessKeyManage, {
                style: {
                  marginLeft: 5
                }
              }), /* @__PURE__ */ jsx(antd.Button, {
                onClick: showModalConfig,
                css: configStyles.btn,
                children: /* @__PURE__ */ jsx(IconPark, {
                  name: "Config",
                  css: configStyles.icon
                })
              }), /* @__PURE__ */ jsx(RefreshButton, {
                refreshing,
                onRefresh,
                refreshHotkeyEnabled: !(modalConfigVisible || modalFeedVisible)
              }), showModalFeedEntry && /* @__PURE__ */ jsxs(antd.Button, {
                css: flexCenterStyle,
                onClick: showModalFeed,
                children: [/* @__PURE__ */ jsx("span", {
                  css: antdBtnTextStyle,
                  children: "查看更多"
                }), /* @__PURE__ */ jsx("svg", {
                  css: _ref,
                  children: /* @__PURE__ */ jsx("use", {
                    href: "#widget-arrow"
                  })
                })]
              })]
            })
          })]
        }), /* @__PURE__ */ jsx(ModalFeed, {
          show: modalFeedVisible,
          onHide: hideModalFeed
        }), /* @__PURE__ */ jsx(ModalSettings, {
          show: modalConfigVisible,
          onHide: hideModalConfig
        })]
      })
    });
  });
  const narrowStyle = {
    grid: /* @__PURE__ */ css("width:", 360 * 2 + 20, "px;margin:0 auto;", "")
  };
  function PureRecommend() {
    const {
      useNarrowMode
    } = useSettingsSnapshot();
    const {
      modalFeedVisible,
      modalConfigVisible
    } = useHeaderState();
    const recHeader = React__default.useRef(null);
    const recGrid = React__default.useRef(null);
    const onRefresh = useMemoizedFn((...args) => {
      var _a2;
      return (_a2 = recGrid.current) == null ? void 0 : _a2.refresh(...args);
    });
    const onScrollToTop = useMemoizedFn(() => {
      var _a2;
      return (_a2 = recHeader.current) == null ? void 0 : _a2.scroll();
    });
    const [refreshing, setRefreshing] = React__default.useState(false);
    const [extraInfo, setExtraInfo] = React__default.useState(null);
    return /* @__PURE__ */ jsxs("section", {
      "data-area": "推荐",
      children: [/* @__PURE__ */ jsx(RecHeader, {
        ref: recHeader,
        refreshing,
        onRefresh,
        leftSlot: extraInfo
      }), /* @__PURE__ */ jsx(RecGrid, {
        ref: recGrid,
        css: [useNarrowMode && narrowStyle.grid, "", ""],
        shortcutEnabled: !(modalFeedVisible || modalConfigVisible),
        infiteScrollUseWindow: true,
        onScrollToTop,
        setRefreshing,
        setExtraInfo
      })]
    });
  }
  const debug$1 = baseDebug.extend("components:SectionRecommend");
  function SectionRecommend() {
    const skeletonPlaceholders = React__default.useMemo(() => new Array(20).fill(0).map(() => crypto.randomUUID()), []);
    const isInternalTesting = getIsInternalTesting();
    const tab2 = useCurrentSourceTab();
    const {
      refreshing,
      items,
      refresh,
      error: refreshError,
      swr
    } = useRefresh({
      tab: tab2,
      debug: debug$1,
      fetcher: refreshForHome,
      recreateService: false
    });
    useMount$1(refresh);
    const showSkeleton = !items.length || refreshError || refreshing && !swr;
    return /* @__PURE__ */ jsxs("section", {
      "data-area": "推荐",
      children: [/* @__PURE__ */ jsx(RecHeader, {
        refreshing,
        onRefresh: refresh
      }), /* @__PURE__ */ jsx("div", {
        className: cx(videoGrid, limitTwoLines, isInternalTesting ? videoGridInternalTesting : videoGridNewHomepage),
        style: {
          marginBottom: isInternalTesting ? 30 : 0
        },
        children: showSkeleton ? skeletonPlaceholders.map((id) => /* @__PURE__ */ jsx(VideoCard, {}, id)) : items.map((item) => {
          return item.api === ApiType.separator ? null : /* @__PURE__ */ jsx(VideoCard, {
            item
          }, item.uniqId);
        })
      })]
    });
  }
  const isHashEntry = (location.hash || "").startsWith(`#/${APP_NAME}/`);
  function hasBewlyBewly() {
    return !isHashEntry && document.documentElement.classList.contains("bewly-design");
  }
  async function tryDetectBewlyBewly() {
    return tryAction("html.bewly-design", () => {
      console.warn(`${APP_NAME}: unmount for using bewly-design`);
      root == null ? void 0 : root.unmount();
    }, {
      timeout: 5e3,
      warnOnTimeout: false
    });
  }
  let root;
  async function initHomepage() {
    tryToRemove(".adblock-tips");
    tryAction("html.gray", (el) => el.classList.remove("gray"));
    if (hasBewlyBewly()) {
      console.warn(`${APP_NAME}: quit for using bewly-design`);
      return;
    }
    if (settings.pureRecommend) {
      return initHomepagePureRecommend();
    } else {
      return initHomepageSection();
    }
  }
  async function initHomepageSection() {
    const timeout = 10 * 1e3;
    const timeoutAt = Date.now() + timeout;
    let insert;
    while (Date.now() <= timeoutAt) {
      if (document.querySelector(".bili-layout > section.bili-grid")) {
        const previousElement = document.querySelector(".bili-layout > section.bili-grid");
        insert = (reactNode) => previousElement == null ? void 0 : previousElement.insertAdjacentElement("afterend", reactNode);
        break;
      }
      if (getIsInternalTesting() && document.querySelector(".bili-feed4-layout")) {
        insert = (reactNode) => {
          var _a2;
          return (_a2 = document.querySelector(".bili-feed4-layout")) == null ? void 0 : _a2.insertAdjacentElement("afterbegin", reactNode);
        };
        break;
      }
      await delay(200);
    }
    if (!insert) {
      console.error(`[${APP_NAME}]: init fail`);
      return;
    }
    const recommendContainer = document.createElement("section");
    recommendContainer.classList.add(APP_NAME_ROOT_CLASSNAME);
    insert(recommendContainer);
    root = createRoot(recommendContainer);
    root.render(/* @__PURE__ */ jsx(AntdApp, {
      injectGlobalStyle: true,
      renderAppComponent: true,
      children: /* @__PURE__ */ jsx(SectionRecommend, {})
    }));
    if (getIsInternalTesting()) {
      tryToRemove(".bili-feed4 .header-channel");
    }
    tryDetectBewlyBewly();
  }
  async function initHomepagePureRecommend() {
    var _a2;
    if (isSafari)
      await delay(500);
    let renderBackTop = false;
    if (getIsInternalTesting()) {
      tryToRemove("#i_cecream .bili-feed4-layout");
      tryToRemove(".bili-feed4 .header-channel");
      tryToRemove(".palette-button-wrap");
      renderBackTop = true;
    } else {
      (_a2 = document.querySelector(".bili-layout")) == null ? void 0 : _a2.remove();
      tryToRemove(".bili-footer");
      tryToRemove(".palette-button-wrap > .primary-btn", (el) => el.innerText.includes("分区"), 2e3).then(() => {
        document.querySelectorAll(".palette-button-wrap .primary-btn").forEach((el) => {
          el.classList.remove("hidden");
          if (el.classList.contains("top-btn"))
            el.classList.remove("top-btn");
        });
      });
    }
    const insertFn = (reactContainer2) => document.body.appendChild(reactContainer2);
    const biliLayout = document.createElement("div");
    biliLayout.classList.add(getIsInternalTesting() ? "bili-feed4-layout" : "bili-layout", "pure-recommend");
    insertFn(biliLayout);
    const reactContainer = document.createElement("section");
    reactContainer.classList.add(APP_NAME_ROOT_CLASSNAME);
    biliLayout.appendChild(reactContainer);
    root = createRoot(reactContainer);
    root.render(/* @__PURE__ */ jsxs(AntdApp, {
      injectGlobalStyle: true,
      renderAppComponent: true,
      children: [/* @__PURE__ */ jsx(PureRecommend, {}), renderBackTop && /* @__PURE__ */ jsx(antd.FloatButton.BackTop, {
        style: {
          // right
          insetInlineEnd: "var(--back-top-right, 24px)"
        }
      })]
    }));
    tryDetectBewlyBewly();
  }
  const debug = baseDebug.extend("main:video-play-page");
  function initVideoPlayPage() {
    handleFullscreen();
  }
  async function handleFullscreen() {
    const targetMode = new URL(location.href).searchParams.get(PLAYER_SCREEN_MODE);
    const next2 = targetMode === PlayerScreenMode.WebFullscreen || targetMode === PlayerScreenMode.Fullscreen;
    if (!next2)
      return;
    let action;
    if (targetMode === PlayerScreenMode.WebFullscreen) {
      action = () => {
        var _a2;
        return (_a2 = document.querySelector('[role="button"][aria-label="网页全屏"]')) == null ? void 0 : _a2.click();
      };
    }
    if (targetMode === PlayerScreenMode.Fullscreen) {
      action = () => {
        var _a2;
        return (_a2 = document.querySelector('[role="button"][aria-label="全屏"]')) == null ? void 0 : _a2.click();
      };
    }
    const getCurrentMode = () => {
      var _a2;
      return ((_a2 = document.querySelector("#bilibili-player .bpx-player-container")) == null ? void 0 : _a2.dataset.screen) || PlayerScreenMode.Normal;
    };
    const timeoutAt = Date.now() + ms$1("30s");
    while (getCurrentMode() !== targetMode && Date.now() <= timeoutAt) {
      action == null ? void 0 : action();
      await delay(100);
    }
    debug("handleFullscreen to %s complete", targetMode);
  }
  dayjs.extend(duration);
  void function main() {
    if (IN_BILIBILI_HOMEPAGE) {
      return initHomepage();
    }
    if (IN_BILIBILI_VIDEO_PLAY_PAGE) {
      return initVideoPlayPage();
    }
  }();

})(axios, dayjs, axiosGmxhrAdapter, React, _, dayjs_plugin_duration, UAParser, antd, antd.locales.zh_CN, ReactDOM, _.isEqual, Motion, _.debounce, _.throttle);