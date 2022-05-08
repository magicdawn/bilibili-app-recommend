# Changelog

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
