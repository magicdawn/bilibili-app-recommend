# bilibili-app-recommend

> 为 B 站首页添加像 App 一样的推荐

## 链接

- 安装地址 https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend
- 源代码 https://github.com/magicdawn/bilibili-app-recommend 如果对你有用,请来个 Star :)

## Monkey 插件

TamperMonkey 的 @match 有些问题, 推荐使用 ViolentMonkey

<details>
  <summary>详情</summary>

TamperMonkey `https://www.bilibili.com` 或者 `https://www.bilibili.com/?` 都可以匹配, 但是加上其他 query, 如 `https://www.bilibili.com/?abc` 不能匹配
按照 chrome [match](https://developer.chrome.com/docs/extensions/mv2/match_patterns/) 规则, query 不参与匹配

### 案例

- https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/140539
- https://github.com/Tampermonkey/tampermonkey/issues/1531
- https://github.com/Tampermonkey/tampermonkey/issues/1527
- https://github.com/Tampermonkey/tampermonkey/issues/1522

</details>

## 声明

代码 fork 自此处

- https://github.com/indefined/UserScripts/tree/master/bilibiliHome
- https://github.com/indefined/UserScripts/issues/76

## 你可能不需要这个脚本 :)

B 站桌面端已上线, 支持 MacOS / Windows, 首页包含推荐模块
![image](https://user-images.githubusercontent.com/4067115/169683392-2ed72442-5d4a-42cc-aa6c-6398b4b0517b.png)

## 介绍

### 主页 "推荐" 块

![image](https://user-images.githubusercontent.com/4067115/163818208-9090095d-1690-4d03-a0ff-bcca72b071ea.png)

- [x] 点击获取 access_key, 以便调用推荐接口

### 查看更多 -> 全屏弹框推荐

![image](https://user-images.githubusercontent.com/4067115/163818386-1550dcbd-69fb-4eec-9db2-fb4d538a7e20.png)

- [x] 支持无限滚动, 加载更多
- [x] 深色模式, 与 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved) 提供的深色模式兼容
- [x] 支持窄屏模式, 全屏浏览在显示器下需要左右扭脖子(治好了你们多年的颈椎病), 如果没有颈椎病可以用窄屏模式(像手机一样的双列模式)
- [x] 支持快捷键

#### 快捷键说明

- 左右方向键: 选中前一个 / 后一个的视频
- 上下方向键: 选中上面一个 / 下面一个视频
- `Esc`: 清除选中状态
- `Enter`: 打开选中的视频
- `r`: 刷新, 效果同顶部 "换一换" 按钮
- 没有选中时, 按方向键, 会选中顶部第一个视频

### 视频卡片

- [x] 支持鼠标滑动快速预览.
- [x] 支持添加/移除「稍候再看」
- [x] 不喜欢 / 撤销不喜欢
- [ ] 弹幕预览, 个人需求不是很大. (不好弄...)

## 开发 or 使用源代码构建最新版本

- pnpm build
- 按照提示, 复制 `file://` 链接, 在 chrome 中打开, 即可安装

## Changelog

[CHANGELOG.md](https://github.com/magicdawn/bilibili-app-recommend/blob/master/CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
