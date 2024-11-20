## release 步骤

- 完成 features
- 完成 changelog
- npm version patch
- git push origin --all && git push origin --tags

## Todo

- [x] cache ALL Dynamic Feed with IDB in search case, because it's based on client search
- [x] advance search for dynamic feed
- [x] invistigate antd Button.Group missing background issue

## 实现细节

### 授权

```
'https://passport.bilibili.com/login/app/third?appkey=27eb53fc9058f8c3' +
'&api=https%3A%2F%2Fwww.mcbbs.net%2Ftemplate%2Fmcbbs%2Fimage%2Fspecial_photo_bg.png&sign=04224646d1fea004e79606d3b038c84a',
{
method: 'GET',
credentials: 'include',
}
```

拿到 confirm_uri, 创建一个 iframe, iframe 会向当前窗口 postMessage
从 message 中拿到 access token, 并存储

```js
// 用于获取授权
if (location.href.startsWith('https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?')) {
  window.stop()

  if (window.top === window) {
    // a window
    window.opener?.postMessage(location.href, 'https://www.bilibili.com')
  } else {
    // a iframe
    window.top?.postMessage(location.href, 'https://www.bilibili.com')
  }

  return
}
```

## match & include

https://github.com/Tampermonkey/tampermonkey/issues/1560

- ViolentMonkey 对于 @match query 不参与匹配
- TamperMonkey 对于 @match query 参与匹配

所以得写成, `?*` 是为了 TamperMonkey 支持

```txt
@match '*://www.bilibili.com/',
@match 'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png',
@match '*://www.bilibili.com/?*',
@match 'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
```

或者干脆用 Include

```
include: [
  'https://www.bilibili.com',
  'https://www.bilibili.com/',
  'https://www.bilibili.com?*',
  'https://www.bilibili.com/?*',
  'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
],
```
