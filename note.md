## 授权

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
