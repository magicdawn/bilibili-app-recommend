## release 步骤

- 完成 features
- 完成 changelog
- npm version patch
- pnpm build
- 自测一遍 prod version script
- 上传 greasefork
- git push origin master && git push origin --tags

## Todo

- [x] modal close button
- [x] meta 补充
- [x] 优化 externals, 减小打包体积
- [x] preview progress bar
- [x] 稍后再看
- [x] access_key 管理, 特别是增加删除功能
- [x] 提交不喜欢原因, 撤销
- [x] 快捷键, modal-feed 上下左右, 刷新,
- [ ] 弹幕预览

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
