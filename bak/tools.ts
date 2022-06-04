//一些通用模块

import request from 'axios'
import { _c } from './element'

export const token = (() => {
  const ret = document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)?.[1]
  if (!ret) console.error('添加APP首页推荐找不到token, 请检查是否登录')
  return ret
})()

export const imgType = (() => {
  try {
    return 0 == document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp')
      ? 'webp'
      : 'jpg'
  } catch (e) {
    return 'jpg'
  }
})()

export function toast(msg: string, error?: any) {
  if (error) console.error(msg, error)

  const div = _c({
    nodeType: 'div',
    style:
      'position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 12px 24px;font-size: 14px;' +
      'width: 240px; margin-left: -120px;background: #ffb243;color: #fff;border-radius: 6px;',
    innerHTML: msg,
    parent: document.body,
  })

  setTimeout(() => document.body.removeChild(div), 2000)
  return false
}

export function formatNumber(input: number, format: 'number' | 'time' = 'number') {
  if (format == 'time') {
    let second: number | string = input % 60
    let minute: number | string = Math.floor(input / 60)
    let hour: number | null = null
    if (minute > 60) {
      hour = Math.floor(minute / 60)
      minute = minute % 60
    }

    if (second < 10) second = '0' + second
    if (minute < 10) minute = '0' + minute
    return hour ? `${hour}:${minute}:${second}` : `${minute}:${second}`
  } else {
    return input > 9999 ? `${(input / 10000).toFixed(1)}万` : input || 0
  }
}

export function watchLater(ev: MouseEvent) {
  const target = ev.target as HTMLElement
  const action = target?.classList?.contains('added') ? 'del' : 'add'

  const req = new XMLHttpRequest()
  req.open('POST', '//api.bilibili.com/x/v2/history/toview/' + action)
  req.withCredentials = true
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  req.onload = (res) => {
    try {
      // @ts-ignore
      // 这里用了文档上没有的方法
      var list = JSON.parse(res.target?.response)
      if (list.code != 0) {
        toast(`请求稍后再看错误 code ${list.code}</br>msg:${list.message}`, {
          list,
          target,
        })
        return
      }
      target.classList.toggle('added')
      target.title = target.classList.contains('added') ? '移除稍后再看' : '稍后再看'
    } catch (e) {
      toast('请求稍后再看发生错误', e)
    }
  }
  req.send(`aid=${target.dataset.aid}&csrf=${token}`)
  return false
}

//视频预览……做得挺深井冰的……
export function previewImage(pv, target, width) {
  if (!pv || !target || !target.cover) return
  let pWidth = target.parentNode.offsetWidth,
    data = target.cover,
    percent = +width / pWidth,
    index = Math.floor(percent * data.index.length),
    url = data.image[Math.floor(index / data.img_x_len / data.img_y_len)],
    size = pWidth * data.img_x_len,
    y = ((Math.floor(index / data.img_x_len) * -pWidth) / data.img_x_size) * data.img_y_size,
    x = (index % target.cover.img_x_len) * -pWidth
  if (pv.classList.contains('van-framepreview')) {
    if (pv.classList.contains('ranking')) y += 10
    pv.style = `background-image: url(${url}); background-position: ${x}px ${y}px; background-size: ${size}px;opacity:1;`
    pv.innerHTML = `<div className="van-fpbar-box"><span style="width: ${
      percent * 100
    }%;display:block;"></span></div>`
  } else {
    pv.innerHTML =
      `<div className="cover" style="background-image: url(${url}); background-position: ${x}px ${y}px; background-size: ${size}px;"></div>` +
      `<div className="progress-bar van-fpbar-box"><span style="width: ${
        percent * 100
      }%;display:block;"></span></div>`
  }
}

export function previewDanmu(target, status) {
  if (!target || !target.data || !target.data.length || !target.previewDanmu) return
  clearInterval(target.timmer)
  if (status) {
    target.previewDanmu()
    target.timmer = setInterval(target.previewDanmu, 2.5 * 1000)
  } else {
    target.style.opacity = 0
  }
}

export function preview(ev) {
  if (!ev.target) return
  let deep = 1,
    target = ev.target
  while (!target.dataset.id && deep++ < 4) {
    target = target.parentNode
  }
  const pv = target.querySelector('.cover-preview-module'),
    danmu = target.querySelector('.danmu-module')
  if (!pv || !danmu) return
  if (ev.type == 'mouseenter') {
    target.timmer = setTimeout(() => {
      if (!target.timmer) return
      pv.classList.add('show')
      danmu.classList.add('show')
      if (!target.cover) {
        fetch(`//api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()}`)
          .then((res) => res.json())
          .then((d) => (target.cover = d.data))
          .then(() =>
            fetch(`//api.bilibili.com/x/v2/dm/ajax?aid=${target.dataset.id}&_=${Date.now()}`)
          )
          .then((res) => res.json())
          .then((d) => {
            danmu.data = d.data
            danmu.count = 0
            danmu.previewDanmu = function () {
              danmu.style.opacity = 1
              if (danmu.count % danmu.data.length == 0) {
                danmu.count = 0
                danmu.innerHTML = danmu.data
                  .map(
                    (item, i) =>
                      `<p className="dm van-danmu-item ${i % 2 ? '' : 'row2'}">${item}</p>`
                  )
                  .join('')
              }
              const item = danmu.children[danmu.count++]
              if (!item) return
              item.style = `left: -${item.offsetWidth}px; transition: left 5s linear 0s;`
            }
            if (!target.timmer) return
            previewImage(pv, target, ev.offsetX)
            previewDanmu(danmu, true)
            delete target.timmer
          })
      } else {
        previewImage(pv, target, ev.offsetX)
        previewDanmu(danmu, true)
        delete target.timmer
      }
    }, 100)
  } else if (ev.type == 'mouseleave') {
    clearTimeout(target.timmer)
    delete target.timmer
    pv.classList.remove('show')
    if (pv.classList.contains('van-framepreview')) {
      pv.style.opacity = 0
    }
    danmu.classList.remove('show')
    previewDanmu(danmu, false)
  } else {
    if (!target.cover) return
    previewImage(pv, target, ev.offsetX)
  }
}
