# Changelog

## v0.2.1 未发布

- fix: 全屏信息流, 刷新之后清除选中状态, 否则在快捷键下行为显得很奇怪

## v0.2.0 2022-06-04

- feat: 全屏信息流支持窄屏模式, 不用在宽屏上扭脖子了
- feat: 全屏信息流支持快捷键, 方向键 + enter 打开视频

## v0.1.1 2022-05-28

- feat: 使用 vite, 支持 HMR, 比较方便
- chore: 样式优化

## v0.1.0 2022-05-28

- feat: 添加 access_key [使用说明](https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E), 感谢原作者提供的文档
- feat: 未授权状态, 不显示 "提交不喜欢" 入口

## v0.0.9 2022-05-28

- feat: 使用 valtio 管理 access_key 状态
- feat: 实现提交不喜欢 / 撤销不喜欢, 简单实现了下 "不喜欢", 状态下的 UI
- fix: 视频卡片, border 问题, 修改为预览时, 左上右上有圆角, 左下右下跟进度条一致, 无圆角

## v0.0.8 2022-05-22

- fix: @require script 使用 unpkg, jsdelivr 在大陆被屏蔽
- fix: 推荐列表去重, 重复的时候出现 duplicate key, 导致空白

## v0.0.7 2022-05-08

- feat: 优化视频卡片 fetch video data 逻辑
- fix: 收缩 init 范围到首页

## v0.0.6 2022-05-08

- fix: 修复正常白色模式下模态框样式问题
- feat: 使用 skeleton
- feat: 增加 access_key 管理: (重新获取 & 删除)
- feat: 视频预览使用二分查找优化 findIndex

## v0.0.5

- 清理 v0.0.4 默认打开模态框的代码

## v0.0.4 2022-04-21

- impl 预览进度条
- impl 添加/移除「稍后再看」

## v0.0.3 2022-04-19

- 去除 bootstrap, bootstrap 全局 css `.row` 影响了 bilibili-envoled 插件的显示, 这种全局 css 不是很好

## v0.0.2 2022-04-18

- Modal 关闭按钮, 改为纯文字
- Modal 增加 bilibili 红 border, 因为在深色模式下看不清
- 完善 @meta block
- 不支持弹幕, 去掉 dm 接口调用
- 优化 externals, 减小打包体积

## v0.0.1 2022-04-17

- first release, untaged
