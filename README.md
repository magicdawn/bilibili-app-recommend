# bilibili-app-recommend

> 为 B 站首页添加像 App 一样的推荐

## 功能

- [x] 纯推荐模式, 无限滚动 (设置中开启)
- [x] 无侵入推荐块, 推荐弹框 (默认)
- [x] 深色模式兼容
- [x] 居中双列模式
- [x] 稍候再看
- [x] 我不想看
- [x] 鼠标快速预览, 鼠标自动预览
- [x] 完善的键盘支持
- [x] 视频过滤
- [x] 接口切换
- [x] IINA

## 链接

- 安装地址 https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend
- 源代码 https://github.com/magicdawn/bilibili-app-recommend 如果对你有用,请来个 Star :)

## 声明

代码 fork 自此处

- https://github.com/indefined/UserScripts/tree/master/bilibiliHome
- https://github.com/indefined/UserScripts/issues/76

## 杂

### B 站首页版本

支持新版首页和内测首页. 旧版首页请看这里 https://github.com/indefined/UserScripts/tree/master/bilibiliHome

### Monkey 插件

支持 ViolentMonkey(我使用的) 和 TamperMonkey.

### 浏览器

不支持 macOS safari TamperMonkey, 请使用 Chrome / Edge / Firefox.

### 你可能不需要这个脚本 :)

B 站桌面端已上线, 支持 MacOS / Windows, 首页包含推荐模块

## 介绍

### API 切换

支持使用 App API 或者 PC 桌面端 API

#### App API, 默认

- 需要 access_key
- 可以使用标记不喜欢功能
- 没有视频发布日期

#### PC 桌面端 API

- 不需要 access_key 了
- 标记不喜欢功能没了
- 和首页自带推荐不一样, 自带推荐有视频预览 / 弹幕预览, 本项目还是鼠标滑动查看快照图片.
- 首页自带推荐的接口, 貌似不会给你推荐番剧 (没有看见数据, 所以没有兼容)
- 推荐结果貌似更理想

### 主页 "推荐" 块

![image](https://user-images.githubusercontent.com/4067115/163818208-9090095d-1690-4d03-a0ff-bcca72b071ea.png)

- [x] 点击获取 access_key, 以便调用推荐接口

### 主页 "推荐" 块, 纯推荐模式

该模式会去除首页其他所有内容, 仅保留推荐块, 推荐操作栏有吸顶效果, 目前

- 与 B 站首页自带顶栏兼容
- 与 Bilibili-Evolved 的自定义顶栏兼容. (自定义顶栏: 全局固定 / 高度 可自由设置)

默认关闭, 在开关内打开

![image](https://user-images.githubusercontent.com/4067115/203917748-bce30561-80cf-4389-ab15-31d7cf79c9a2.png)

### 查看更多 -> 全屏弹框推荐

![image](https://user-images.githubusercontent.com/4067115/163818386-1550dcbd-69fb-4eec-9db2-fb4d538a7e20.png)
![image](https://user-images.githubusercontent.com/4067115/182653003-e48befbe-c69a-4ccc-9bee-b4fe97149052.png)

- [x] 支持无限滚动, 加载更多
- [x] 深色模式, 与 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved) 提供的深色模式兼容
- [x] 支持窄屏模式, 全屏浏览在显示器下需要左右扭脖子(治好了你们多年的颈椎病), 如果没有颈椎病可以用窄屏模式(即居中双列模式)
- [x] 支持快捷键
- [x] 支持自动查看更多, 即打开 B 站首页自动弹出全屏弹框.

### 快捷键说明

#### 查看更多弹框 & 纯推荐模式

- [x] 方向键, 选择视频
- [x] `Esc`: 清除选中状态
- [x] 没有选中时, 按方向键, 会选中顶部第一个可见视频
- [x] `Enter`: 打开选中的视频
- [x] `Backspace`: 即删除键, 打开标记不喜欢弹框
- [x] `r`: 刷新, 效果同顶部 "换一换" 按钮, 取自 `refresh`
- [x] `s` / `w`: 添加/移除 稍候再看, 取自 `save` / `watch`. `s` 与 Bilibili-Evolved 快捷键冲突, 你可以使用 `w`

#### 各种其他弹框

- 设置弹框 / 标记为不喜欢弹框: 可以通过点击透明区域 or `Esc` 键关闭
- `shift+,` 打开/关闭设置弹框.

#### 标记为不喜欢弹框

- 数字键(1 到 6)直接提交不喜欢理由
- 也可以方向键选择理由, 回车提交
- 默认选中最后一个理由, 通常是「不感兴趣」

### 视频卡片

- [x] 支持鼠标滑动快速预览.
- [x] 支持添加/移除「稍候再看」
- [x] 不喜欢 / 撤销 「不喜欢」
- [ ] 弹幕预览, 个人需求不是很大. (不好弄...)

## 开发 or 使用源代码构建最新版本

- git clone this repo
- pnpm install
- pnpm build, build 完会自动使用 Chrome 打开安装地址

## 支持

- 如果对你有用,请来个 Star :)
- 如果你喜欢这个项目, 可以 「[爱发电](https://afdian.net/a/magicdawn)」 支持一下

![afdian-magicdawn_w375](https://ghproxy.com/https://raw.githubusercontent.com/magicdawn/magicdawn/master/images/afdian-magicdawn_w375.jpg)

## Changelog

[CHANGELOG.md](https://github.com/magicdawn/bilibili-app-recommend/blob/master/CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
