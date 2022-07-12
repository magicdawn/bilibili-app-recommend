# Changelog

## v0.3.7 2022-07-12

- chore: 防止 onGetAuth 多次触发

## v0.3.6 2022-07-08

- fix: access_key timeout 默认 5s -> 10s, 并可以通过脚本设置 `authTimeout` 项调整, 单位秒, 可设置成 20 即为 20 秒

## v0.3.5 2022-07-04

- fix: 修复只使用向下箭头, 因为下标溢出, 向下无法加载更多的问题

## v0.3.4 2022-06-30

- 5442ddd - chore: fix eslint
- c489c2e - fix: 修复有些情况无法获取 json 的情况
- 1dca2b0 - chore: setup git hook & eslint
- 2a223c9 - chore: fix lodash => lodash-es
- 5e08c5d - feat: use @match only

## v0.3.3 2022-06-14

- chore: 样式调整
- feat: 添加 "自动查看更多" 设置

## v0.3.2 2022-06-08

- fix: 修复 Bilibili-Evoled 的深色模式切换时(日落自动切换 / 电脑经历睡眠后亮屏自动切换), 全屏弹框的样式异常的问题

## v0.3.1 2022-06-06

- fix: 修复使用向下箭头导致滚动抖动的问题.
- optimize: 优化 VideoCard, 优化初始加载时 / 刷新时 线框图的显示. (之前首页第一次推荐接口成功之前显示为空白)

## v0.3.0 2022-06-06

- optimize: 方向键使用体验优化, 上下方向键行为实现为"真" 上下移动
- optimize: 键盘 & 鼠标同时滚动时, 如果键盘方向键选中, 然后鼠标滚动, 如果选中的视频卡片离开屏幕太远 (超过一屏算太远),
  再继续用方向键, 会认为之前的选中无效(等同于使用了一次 Esc), 然后选中屏幕可以完全看见的第一个卡片

## v0.2.2 2022-06-06

- optimize: 使用 `crypto.randomUUID` 解决因推荐重复 + 使用视频 id 作为列表 key 导致的 react duplicate key, 导致的卡片状态异常的情况
- optimize: 使用 `React.memo(VideoCard)`

## v0.2.1 2022-06-05

- fix: 全屏信息流, 刷新之后清除选中状态, 否则在快捷键下行为显得很奇怪
- fix: 弹框开启后锁定 body 滚动逻辑, 之前的实现在多个弹框 show 之后, 上层弹框关闭之后 body 依然可以滚动.
  例如全屏推荐里打开不喜欢弹框, 再关闭不喜欢, 外层就可以滚动了. 这次修复了这个行为.
- fix: 快捷键, 只有单按 `r` 的时候刷新, 防止 CMD+R 刷新网页时触发 "换一换"

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
