# macOS IINA

## Steps

- 全局安装 yt-dlp `brew install yt-dlp`
- IINA 设置 -> 网络 -> youtube-dl 取消勾选, IINA 内置的 ytdl hook 早就过时了
- IINA 设置 -> 高级 -> 勾选使用配置目录, 默认 `~/.config/mpv/`

### 下载最新 ytdl hook

```sh
mkdir -p ~/.config/mpv/scripts
wget https://raw.githubusercontent.com/mpv-player/mpv/master/player/lua/ytdl_hook.lua -O ~/.config/mpv/scripts/ytdl_hook.lua
```

### 设置 yt-dlp

新建文本文件, ~/.config/yt-dlp/config

```txt
# cookies
--cookies-from-browser chrome
```

这样, yt-dlp 能从 chrome 读取 cookie, 而上面 ytdl_hook.lua 会调用 yt-dlp
