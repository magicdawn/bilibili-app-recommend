import request from 'axios'
import $ from 'jquery'
import { config } from '@settings'
import { toast } from './toast'

/**
 * 获取 access_key
 */

async function getAuth() {
  const res = await request.get('https://passport.bilibili.com/login/app/third', {
    params: {
      appkey: '27eb53fc9058f8c3',
      api: 'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png',
      sign: '04224646d1fea004e79606d3b038c84a',
    },
    withCredentials: true,
  })
  const json = res.data

  if (!json?.data?.has_login) {
    return { errmsg: '你必须登录B站之后才能使用授权', json }
  }

  if (!json?.data?.confirm_uri) {
    return { errmsg: '无法获得授权网址', json }
  }

  const confirm_uri = json.data.confirm_uri
  let timeout: ReturnType<typeof setTimeout> | null

  const waitCallback = new Promise<string | { errmsg: string }>((resolve) => {
    window.addEventListener('message', (e) => {
      if (e.origin != 'https://www.mcbbs.net' || !e.data) return

      const key = e.data.match(/access_key=([0-9a-z]{32})/)
      if (!key || !key[1]) {
        return resolve({ errmsg: '没有获得匹配的密钥' })
      }

      resolve(key[1] as string)
    })

    // 授权超时, 单位(s)
    // 5s 有人反馈超时 https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend/discussions/140661
    // 改成 10s
    let authTimeout = Number(GM_getValue('authTimeout') || 10)
    if (isNaN(authTimeout)) authTimeout = 10
    console.log('[bilibili-app-recommend]: authTimeout = %s(s)', authTimeout)

    timeout = setTimeout(() => {
      resolve({ errmsg: '获取授权超时' })
    }, authTimeout * 1000)
  })

  const $iframe = $(`<iframe src='${confirm_uri}' style="display: none;" />`)
  $iframe.appendTo(document.body)

  function cleanup() {
    $iframe.remove()
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const result = await waitCallback
  cleanup()

  // {errmsg} | access_key
  return result
}

export async function auth() {
  const res = await getAuth()

  if (typeof res === 'object' && 'errmsg' in res) {
    toast(res.errmsg)
    return
  }

  const accessKey = res
  config.accessKey = accessKey
  toast('获取成功')

  return accessKey
}

export function deleteAccessToken() {
  config.accessKey = ''
  toast('已删除 access_key')
}
