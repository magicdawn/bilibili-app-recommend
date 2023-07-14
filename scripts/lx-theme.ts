import child_process from 'child_process'
import dl from 'dl-vampire'
import esmUtils from 'esm-utils'
import fsp from 'fs/promises'
import path from 'path'

const { __dirname } = esmUtils(import.meta)

void (async function () {
  await dl({
    file: __dirname + '/tmp/lx-themes.json',
    // url: 'https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json',
    url: 'https://raw.githubusercontent.com/lyswhut/lx-music-desktop/v2.2.2/src/common/theme/index.json',
  })

  const arr = JSON.parse(await fsp.readFile(__dirname + '/tmp/lx-themes.json', 'utf-8'))

  const picked = arr.map((theme) => {
    return {
      id: theme.id,
      name: theme.name,
      isDark: theme.isDark,
      isCustom: theme.isCustom,
      colorPrimary: theme.config.themeColors['--color-primary'],
      colorTheme: theme.config.themeColors['--color-theme'],
    }
  })

  const target = path.join(__dirname, '../src/components/ModalSettings/lx-themes.json')
  fsp.writeFile(target, JSON.stringify(picked))
  child_process.execSync(`pnpm prettier --write "${target}"`, { cwd: __dirname })
})()
