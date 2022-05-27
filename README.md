# bilibili-app-recommend

> 为 B 站首页添加像 App 一样的推荐

## 源代码

https://github.com/magicdawn/bilibili-app-recommend

## 声明

代码 fork 自此处

- https://github.com/indefined/UserScripts/tree/master/bilibiliHome
- https://github.com/indefined/UserScripts/issues/76

## 安装地址

https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend

## 你可能不需要这个脚本 :)

B 站桌面端已上线, 支持 MacOS / Windows, 首页包含推荐模块
![image](https://user-images.githubusercontent.com/4067115/169683392-2ed72442-5d4a-42cc-aa6c-6398b4b0517b.png)

## 介绍

### 主页 "推荐" 块

![image](https://user-images.githubusercontent.com/4067115/163818208-9090095d-1690-4d03-a0ff-bcca72b071ea.png)

- [x] 点击获取 access_key, 以便调用推荐接口

### 更多 -> 模态框信息流

![image](https://user-images.githubusercontent.com/4067115/163818386-1550dcbd-69fb-4eec-9db2-fb4d538a7e20.png)

- [x] 支持无限滚动, 加载更多

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
