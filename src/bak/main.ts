import * as element from './element'
import * as tools from './tools'

// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.6.22
// @description  网页端首页添加APP首页推荐、全站排行、可选提交不喜欢的视频
// @author       indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @match        *://www.bilibili.com/*
// @include      https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*
// @license      MIT
// @connect      app.bilibili.com
// @connect      api.bilibili.com
// @connect      passport.bilibili.com
// @connect      link.acg.tv
// @connect      www.mcbbs.net
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==
;(function () {
  'use strict'
  if (
    location.href.startsWith('https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?')
  ) {
    //用于获取授权
    window.stop()
    return window.top?.postMessage(location.href, 'https://www.bilibili.com')
  }

  // +custom css
  const style = `<style></style>`

  //APP首页推荐
  function InitRecommend() {
    //初始化标题栏并注入推荐下方

    if (element.mainDiv) {
      element.mainDiv.id = 'recommend'
    }

    let scrollBox
    if (element.isNew == 1) {
      element._s(element.mainDiv.querySelector('.storey-title')!, {
        innerHTML: style,
        childs: [
          '<div className="l-con"><svg aria-hidden="true" className="svg-icon"><use xlinkHref="#bili-douga"></use></svg><span className="name">猜你喜欢</span></div>',
          {
            nodeType: 'div',
            className: 'exchange-btn',
            childs: [
              {
                nodeType: 'div',
                style: 'width: 86px;',
                className: 'btn btn-change',
                innerHTML:
                  '<i className="bilifont bili-icon_caozuo_huanyihuan"></i><span className="info">加载更多</span>',
                onclick: () => {
                  for (let i = 0; i < setting.manualFreshCount; i++) getRecommend()
                },
              },
              {
                nodeType: 'span',
                className: 'btn more',
                innerHTML:
                  '<span>设置</span><i className="bilifont bili-icon_caozuo_qianwang"></i>',
                onclick: () => setting.show(),
              },
            ],
          },
        ],
      })
      scrollBox = element.mainDiv.querySelector('div.zone-list-box')
      scrollBox.classList.add('storey-box')
    } else if (element.isNew == 2) {
    } else {
      element._s(element.mainDiv.querySelector('div.zone-title')!, {
        innerHTML: style,
        childs: [
          {
            nodeType: 'div',
            className: 'headline clearfix',
            innerHTML:
              '<i className="icon icon_t icon-douga"></i><span className="name">猜你喜欢</span>',
            childs: [
              {
                nodeType: 'div',
                className: 'link-more',
                style: 'cursor:pointer;user-select: none;',
                innerHTML: '<span>设置  </span><i className="icon"></i>',
                onclick: () => setting.show(),
              },
              {
                nodeType: 'div',
                className: 'read-push',
                style: 'cursor:pointer;user-select: none;',
                innerHTML:
                  '<i className="icon icon_read"></i><span className="info">加载更多</span>',
                onclick: () => {
                  for (let i = 0; i < setting.manualFreshCount; i++) getRecommend()
                },
              },
            ],
          },
        ],
      })
      scrollBox = element.mainDiv.querySelector('div.storey-box.clearfix')
    }
    let listBox
    element._s(scrollBox, {
      innerHTML: '',
      style: 'overflow:hidden auto;display:block',
      childs: [
        (listBox = element._c({
          nodeType: 'div',
          className: scrollBox.className,
          id: 'recommend-list',
          style: 'overflow:auto',
          innerHTML: '<span style="display:none">empty</span>',
        })),
      ],
    })
    const moreButton = element._c({
      nodeType: 'div',
      className: 'clearfix',
      innerHTML:
        '<div className="load-state" style="cursor: pointer;padding: 4px;text-align: center;">回到推荐顶部</div>',
      onclick: () => {
        listBox.scrollTop = 0
        scrollBox.scrollTop = 0
        element.mainDiv.scrollIntoView()
      },
    })
    scrollBox.insertAdjacentElement('afterend', moreButton)
    if (element.isNew) {
      document.querySelector('.proxy-box')!.insertAdjacentElement('afterbegin', element.mainDiv)
    } else {
      document.querySelector('#home_popularize')!.insertAdjacentElement('afterend', element.mainDiv)
    }

    const recommends: any[] = [] //保存当前页面中的推荐元素，用于清除多余内容
    //显示历史推荐
    if (setting.historyData) updateRecommend(setting.historyData)
    //加载新推荐
    for (let i = 0; i < setting.autoFreshCount; i++) getRecommend()

    //如果是新版页面，因为弹性布局原因，需要根据情况设置宽度避免因为不显示滚动条干扰溢出
    if (element.isNew == 1) {
      ;(setting as any).setListWidth = function () {
        if (listBox.scrollHeight > listBox.clientHeight && setting.noScrollBar) {
          listBox.style =
            'overflow-y: auto;align-content: flex-start;width: calc(100% + 20px) !important'
        } else {
          listBox.style = 'overflow-y: auto;align-content: flex-start;width: 100% !important'
        }
      }
      ;(setting as any).setListWidth()
      new MutationObserver((setting as any).setListWidth).observe(listBox, { childList: true })
    }
    //获取推荐视频数据
    function getRecommend() {
      let loadingDiv
      listBox.insertAdjacentElement('afterBegin', (loadingDiv = element.getLoadingDiv('recommend')))
      GM_xmlhttpRequest({
        method: 'GET',
        url:
          'https://app.bilibili.com/x/feed/index?build=1&mobi_app=android&idx=' +
          (Date.now() / 1000).toFixed(0) +
          (setting.accessKey ? '&access_key=' + setting.accessKey : ''),
        onload: (res) => {
          try {
            const rep = JSON.parse(res.response)
            if (rep.code != 0) {
              loadingDiv.firstChild.innerText = `请求app首页失败 code ${rep.code}</br>msg ${rep.message}`
              return console.error('请求app首页失败', rep)
            }
            setting.pushHistory(rep.data)
            updateRecommend(rep.data)
            loadingDiv.style.display = 'none'
          } catch (e) {
            loadingDiv.firstChild.innerText = `请求app首页发生错误 ${e}`
            console.error(e, '请求app首页发生错误')
          }
        },
        onerror: (e) => {
          loadingDiv.firstChild.innerText = `请求app首页发生错误 ${e}`
          console.error(e, '请求app首页发生错误')
        },
      })
    }

    //旧版创建视频卡
    function createOldRecommend(data) {
      return element._c({
        nodeType: 'div',
        className: 'spread-module',
        childs: [
          {
            nodeType: 'a',
            target: '_blank',
            onmouseenter: data.goto == 'av' && tools.preview,
            onmouseleave: data.goto == 'av' && tools.preview,
            onmousemove: data.goto == 'av' && tools.preview,
            href: data.goto == 'av' ? `/video/av${data.param}` : data.uri,
            dataset: {
              tag_id: data.tag ? data.tag.tag_id : '',
              id: data.param,
              goto: data.goto,
              mid: data.mid,
              rid: data.tid,
            },
            childs: [
              {
                nodeType: 'div',
                className: 'pic',
                childs: [
                  `<div className="lazy-img"><img src="${data.cover}@160w_100h.${tools.imgType}" /></div>`,
                  `<div className="cover-preview-module"></div>`,
                  `<div className="mask-video"></div>`,
                  `<div className="danmu-module"></div>`,
                  `<span title="分区：${data.tname || data.badge}" className="tname">${
                    data.tname || data.badge
                  }</span>`,
                  (data.duration &&
                    `<span className="dur">${tools.formatNumber(data.duration, 'time')}</span>`) ||
                    '',
                  data.goto == 'av'
                    ? {
                        nodeType: 'div',
                        dataset: { aid: data.param },
                        title: '稍后再看',
                        className: 'watch-later-trigger w-later',
                        onclick: tools.watchLater,
                      }
                    : '',
                  data.dislike_reasons && setting.accessKey
                    ? {
                        nodeType: 'div',
                        innerText: 'Ｘ',
                        className: 'dislike-botton',
                        childs: [
                          {
                            nodeType: 'div',
                            className: 'dislike-list',
                            childs: data.dislike_reasons.map((reason) => ({
                              nodeType: 'div',
                              dataset: { reason_id: reason.reason_id },
                              innerText: reason.reason_name,
                              title: `提交因为【${reason.reason_name}】不喜欢`,
                              onclick: dislike,
                            })),
                          },
                        ],
                      }
                    : '',
                ],
              },
              `<p title="${data.title}" className="t">${data.title}</p>`,
              `<p className="num"><span className="play"><i className="icon"></i>${tools.formatNumber(
                data.play
              )}</span>` +
                `<span className="danmu"><i className="icon"></i>${tools.formatNumber(
                  data.danmaku
                )}</span>`,
            ],
          },
        ],
      })
    }
    //新版创建视频卡
    function createNewRecommend(data) {
      return element._c({
        nodeType: 'div',
        style: 'display:block',
        className: 'video-card-common',
        childs: [
          {
            nodeType: 'div',
            className: 'card-pic',
            onmouseenter: data.goto == 'av' && tools.preview,
            onmouseleave: data.goto == 'av' && tools.preview,
            onmousemove: data.goto == 'av' && tools.preview,
            dataset: {
              tag_id: data.tag ? data.tag.tag_id : '',
              id: data.param,
              goto: data.goto,
              mid: data.mid,
              rid: data.tid,
            },
            childs: [
              `<a href="${
                data.goto == 'av' ? `/video/av${data.param}` : data.uri
              }" target="_blank">` +
                `<img src="${data.cover}@216w_122h_1c_100q.${tools.imgType}"><div className="count">` +
                `<div className="left"><span><i className="bilifont bili-icon_shipin_bofangshu"></i>${tools.formatNumber(
                  data.play
                )}</span>` +
                ((data.like &&
                  `<span><i className="bilifont bili-icon_shipin_dianzanshu"></i>${tools.formatNumber(
                    data.like
                  )}</span></div>`) ||
                  '</div>') +
                `<div className="right"><span>${
                  (data.duration && tools.formatNumber(data.duration, 'time')) || ''
                }</span></div></div></a>`,
              `<div className="cover-preview-module van-framepreview"></div>`,
              `<div className="danmu-module van-danmu"></div>`,
              `<span title="分区：${data.tname || data.badge}" className="tname">${
                data.tname || data.badge
              }</span>`,
              data.goto == 'av'
                ? {
                    nodeType: 'div',
                    dataset: { aid: data.param },
                    title: '稍后再看',
                    className: 'watch-later-video van-watchlater black',
                    onclick: tools.watchLater,
                  }
                : '',
              data.dislike_reasons && setting.accessKey
                ? {
                    nodeType: 'div',
                    innerText: 'Ｘ',
                    className: 'dislike-botton',
                    childs: [
                      {
                        nodeType: 'div',
                        className: 'dislike-list',
                        childs: data.dislike_reasons.map((reason) => ({
                          nodeType: 'div',
                          dataset: { reason_id: reason.reason_id },
                          innerText: reason.reason_name,
                          title: `提交因为【${reason.reason_name}】不喜欢`,
                          onclick: dislike,
                        })),
                      },
                    ],
                  }
                : '',
            ],
          },
          `<a href="${
            data.goto == 'av' ? `/video/av${data.param}` : data.uri
          }" target="_blank" title="${data.title}" className="title">${data.title}</a>`,
          `<a href="//space.bilibili.com/${
            data.mid
          }/" target="_blank" className="up"><i className="bilifont bili-icon_xinxi_UPzhu"></i>${
            data.name || data.badge
          }</a>`,
        ],
      })
    }
    //显示推荐视频
    function updateRecommend(datas) {
      const point = listBox.firstChild
      datas.forEach((data) => {
        const recommend = element.isNew ? createNewRecommend(data) : createOldRecommend(data)
        recommends.push(point.insertAdjacentElement('beforeBegin', recommend))
      })
      //移除多余的显示内容
      while (setting.pageLimit && recommends.length > setting.pageLimit)
        listBox.removeChild(recommends.shift())
      listBox.scrollTop = 0
      scrollBox.scrollTop = 0
    }

    //提交不喜欢视频，视频数据提前绑定在页面元素上
    function dislike(ev) {
      let target = ev.target,
        parent = target.parentNode
      let cancel
      let url = `https://app.bilibili.com/x/feed/dislike`
      if (parent.className != 'dislike-list') {
        cancel = true
        let deep = 1
        while (!parent.dataset.id && deep++ < 4) {
          target = parent
          parent = target.parentNode
        }
        if (!parent.dataset.id) {
          tools.toast('请求撤销稍后再看失败：页面元素异常', ev)
          return false
        }
        url += `/cancel`
      } else {
        parent = parent.parentNode.parentNode
        if (!element.isNew) parent = parent.parentNode
      }
      url +=
        `?build=5000000&goto=${parent.dataset.goto}&id=${parent.dataset.id}&mid=${parent.dataset.mid}` +
        `&reason_id=${target.dataset.reason_id}&rid=${parent.dataset.rid}&tag_id=${parent.dataset.tag_id}`
      if (setting.accessKey) url += '&access_key=' + setting.accessKey
      const handleCover = () => {
        if (cancel) {
          parent.removeChild(target)
        } else {
          const cover = document.createElement('div')
          cover.className = 'dislike-cover'
          cover.dataset.reason_id = target.dataset.reason_id
          cover.innerHTML = `<a className="lazy-img"><br><br>提交成功，但愿服务器以后少给点这种东西。<br><br><b>点击撤销操作</b></a>`
          cover.onclick = dislike
          parent.appendChild(cover)
        }
      }
      //console.log(url);
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (res) => {
          try {
            const par = JSON.parse(res.response)
            if (par.code == 0) {
              handleCover()
            } else if (par.code == -101 && par.message == '账号未登录') {
              setting.storageAccessKey(undefined)
              tools.toast(`未获取授权或者授权失效，请点击设置重新获取授权`)
            } else {
              tools.toast(`请求不喜欢错误 code ${par.code}</br>msg ${par.message}`, { par, url })
            }
          } catch (e) {
            tools.toast(`请求不喜欢发生错错误${e}`, e)
          }
        },
        onerror: (e) => {
          tools.toast(`请求不喜欢发生错误`, e)
        },
      })
      return false
    }
  }

  //全站排行榜
  function InitRanking() {
    let rankingAll
    if (element.isNew) {
      //……直接把旧版的排行修一修搬过来用吧
      rankingAll = element.mainDiv.querySelector('.rank-list')
      element._s(rankingAll, {
        className: 'sec-rank report-wrap-module zone-rank rank-list',
        innerHTML: `
<style>
.bili-dropdown{position:relative;display:inline-block;vertical-align:middle;background-color:#fff;cursor:default;padding:0
7px;height:22px;line-height:22px;border:1px solid #ccd0d7;border-radius:4px}.bili-dropdown:hover{border-radius:4px 4px 0
0;box-shadow:0 2px 4px rgba(0,0,0,.16)}.bili-dropdown:hover .dropdown-list{display:block}.bili-dropdown
.selected{display:inline-block;vertical-align:top}.bili-dropdown .icon-arrow-down{background-position:-475px
-157px;display:inline-block;vertical-align:middle;width:12px;height:6px;margin-left:5px;margin-top:-1px}.bili-dropdown
.dropdown-list{position:absolute;width:100%;background:#fff;border:1px solid
#ccd0d7;border-top:0;left:-1px;top:22px;z-index:10;display:none;border-radius:0 0 4px 4px}.bili-dropdown .dropdown-list
.dropdown-item{cursor:pointer;margin:0;padding:3px 7px}.bili-dropdown .dropdown-list
.dropdown-item:hover{background-color:#e5e9ef}.rank-list
.rank-item{position:relative;padding-left:25px;margin-top:20px;overflow:hidden}.rank-list
.rank-item.first{margin-top:0;margin-bottom:15px}.rank-list .rank-item
.ri-num{position:absolute;color:#999;height:18px;line-height:18px;width:18px;top:0;left:0;font-size:12px;min-width:12px;text-align:center;padding:0
3px;font-weight:bolder;font-style:normal}.rank-list .rank-item.highlight .ri-num{background:#00a1d6;color:#fff}.rank-list
.rank-item .ri-info-wrap{position:relative;display:block;cursor:pointer}.rank-list .rank-item .ri-info-wrap
.w-later{left:45px}.rank-list .rank-item .ri-info-wrap:hover .w-later{display:block}.rank-list .rank-item
.ri-preview{margin-right:5px;width:80px;height:50px;float:left;display:none;border-radius:4px;overflow:hidden}.rank-list
.rank-item.show-detail .ri-preview{display:block}.rank-list .rank-item .ri-detail{float:left}.rank-list .rank-item .ri-detail
.ri-title{line-height:18px;height:18px;overflow:hidden;color:#222}.rank-list .rank-item .ri-detail
.ri-point{line-height:12px;color:#99a2aa;height:12px;margin-top:5px;display:none;overflow:hidden}.rank-list .rank-item.show-detail
.ri-detail .ri-title{height:36px;line-height:18px;width:150px;padding:0}.rank-list .rank-item.show-detail
.ri-point{display:block}.rank-list .rank-item:hover .ri-title{color:#00a1d6}.sec-rank{overflow:hidden}
.sec-rank .rank-head h3{float:left;font-size:18px;font-weight:400}.sec-rank .rank-head
.rank-tab{margin-left:20px;float:left}.sec-rank .rank-head .rank-dropdown{float:right}.sec-rank
.rank-list-wrap{width:200%;overflow:hidden;zoom:1;transition:all .2s linear}.sec-rank .rank-list-wrap
.rank-list{padding-bottom:15px;min-height:278px;width:50%;float:left;padding-top:20px;position:relative}.sec-rank .rank-list-wrap
.rank-list .state{line-height:100px}.sec-rank .rank-list-wrap.show-origin{margin-left:-100%}.sec-rank
.more-link{display:block;height:24px;line-height:24px;background-color:#e5e9ef;text-align:center;border:1px solid
#e0e6ed;color:#222;border-radius:4px;transition:.2s}.sec-rank
.more-link:hover{background-color:#ccd0d7;border-color:#ccd0d7}.sec-rank .more-link
.icon-arrow-r{display:inline-block;vertical-align:middle;background-position:-478px -218px;width:6px;height:12px;margin:-2px 0 0
5px}.bili-tab{overflow:hidden;zoom:1}.bili-tab
.bili-tab-item{float:left;position:relative;height:20px;line-height:20px;cursor:pointer;padding:1px 0 2px;border-bottom:1px solid
transparent;margin-left:12px;transition:.2s;transition-property:border,color}.bili-tab
.bili-tab-item:before{content:&quot;&quot;;display:none;position:absolute;left:50%;margin-left:-3px;bottom:0;width:0;height:0;border-bottom:3px
solid #00a1d6;border-top:0;border-left:3px dashed transparent;border-right:3px dashed transparent}.bili-tab
.bili-tab-item.on{background-color:transparent;border-color:#00a1d6;color:#00a1d6}.bili-tab
.bili-tab-item.on:before{display:block}.bili-tab .bili-tab-item:hover{color:#00a1d6}.bili-tab
.bili-tab-item:first-child{margin-left:0}ul.rank-list{width:50%!important}.video-info-module{position:absolute;top:0;left:0;width:320px;border:1px
solid #ccd0d7;border-radius:4px;box-shadow:0 2px 4px
rgba(0,0,0,.16);box-sizing:border-box;z-index:10020;overflow:hidden;background-color:#fff;padding:12px}.video-info-module
.v-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;height:20px;line-height:12px}.video-info-module
.v-info{color:#99a2aa;padding:4px 0 6px}.video-info-module .v-info
span{display:inline-block;vertical-align:top;height:16px;line-height:12px}.video-info-module .v-info
.name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}.video-info-module .v-info
.line{display:inline-block;border-left:1px solid #99a2aa;height:12px;margin:1px 10px 0}.video-info-module .v-preview{padding:8px 0
12px;border-top:1px solid #e5e9ef;height:64px}.video-info-module .v-preview
.lazy-img{width:auto;float:left;margin-right:8px;margin-top:4px;height:auto;border-radius:4px;overflow:hidden;width:96px;height:60px}.video-info-module
.v-preview
.txt{height:60px;overflow:hidden;line-height:21px;word-wrap:break-word;word-break:break-all;color:#99a2aa}.video-info-module
.v-data{border-top:1px solid #e5e9ef;padding-top:10px}.video-info-module .v-data
span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;width:70px;color:#99a2aa;line-height:12px}.video-info-module
.v-data span .icon{margin-right:4px;vertical-align:top;display:inline-block;width:12px;height:12px}.video-info-module .v-data .play
.icon{background-position:-282px -90px}.video-info-module .v-data .danmu .icon{background-position:-282px -218px}.video-info-module
.v-data .star .icon{background-position:-282px -346px}.video-info-module .v-data .coin .icon{background-position:-282px -410px}
li:not(.show-detail)>a>.watch-later-trigger{display:none}
</style>
<header className="rank-head rank-header" style="margin-bottom: 16px !important;"><h3 className="name">排行</h3>
<div className="bili-tab rank-tab"><div className="bili-tab-item on">全部</div><div className="bili-tab-item">原创</div></div>
<div className="bili-dropdown rank-dropdown"><span className="selected">三日</span><i className="icon icon-arrow-down"></i>
<ul className="dropdown-list"><li className="dropdown-item" style="display: none;">三日</li><li className="dropdown-item">一周</li></ul></div></header>
<div className="rank-list-wrap"><ul className="rank-list hot-list"><li className="state"><div className="b-loading"></div></li></ul><ul className="rank-list origin-list">
<li className="state"><div className="b-loading"></div></li></ul></div><a href="/ranking/all/1/1/3/" target="_blank" className="more-link">查看更多<i className="icon icon-arrow-r"></i></a>`,
      })
    } else {
      rankingAll = element.mainDiv.querySelector('#ranking_douga')
    }
    rankingAll.id = 'ranking-all'
    const rankingHead = rankingAll.querySelector('.rank-head')
    rankingHead.firstChild.innerText = '全站排行'
    const tab = rankingHead.querySelector('.bili-tab.rank-tab')
    const dropDown = rankingHead.querySelector('.bili-dropdown.rank-dropdown')
    const warp = rankingAll.querySelector('.rank-list-wrap')
    let type,
      day = setting.rankingDay
    const loading = element.getLoadingDiv()
    const configs = [
      {
        dataLink: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all',
        link: 'https://www.bilibili.com/v/popular/rank/all',
        list: warp.firstChild,
      },
      {
        dataLink: 'https://api.bilibili.com/x/web-interface/popular?ps=50&pn=',
        link: 'https://www.bilibili.com/v/popular/all',
        list: warp.lastChild,
      },
    ]
    const detail = {}
    //20121203旧排行彻底失效，删除日期选项
    rankingAll.lastChild.style = dropDown.style = 'display: none;'

    rankingHead.firstChild.style = 'display: none'
    tab.style = 'font-size: 16px;'
    tab.children[0].dataset.type = 0
    tab.children[0].textContent = '全站排行'
    tab.children[0].addEventListener('mouseover', update)
    tab.children[1].dataset.type = 1
    tab.children[1].textContent = '综合热门'
    tab.children[1].addEventListener('mouseover', update)
    configs[1].list.addEventListener('scroll', handleScroll)

    // 更多
    const more = element._c({
      nodeType: 'a',
      style: 'float: right;background: white;',
      target: '_blank',
      href: '',
      innerHTML:
        '更多<i className="bilifont bili-icon_caozuo_qianwang"></i><i className="icon icon-arrow-r"></i>',
      className: 'more more-link',
      parent: rankingHead,
    })

    //创建一个显示详情的浮窗
    ;(detail as any).div = element._c({
      nodeType: 'div',
      style: 'display:none',
      className: 'spread-module video-info-module',
      onmouseenter: () => ((detail as any).div.style.display = 'block'),
      onmouseleave: () => ((detail as any).div.style.display = 'none'),
    })
    warp.insertBefore((detail as any).div, warp.lastChild)

    //更新显示详情浮窗内容
    function updateDetail(data, offsetTop) {
      element._s((detail as any).div, {
        style: `display:"none";left:${rankingAll.offsetLeft}px;top:${offsetTop}px;`,
        innerHTML: [
          '<style>.clearfix.v-data>div>span{display: block;margin-bottom: 4px;width: 100%;}',
          '.cover-preview-module.show {opacity: 1}',
          '.cover-preview-module .cover {position: absolute;left: 0;top: 7px;height: 98px;width: 100%;margin-top: 2px}',
          '.spread-module .pic {position: relative;display: block;overflow: hidden;border-radius: 4px}</style>',
        ].join(''),
        childs: [
          `<a className="v-title" target="_blank" style="color: rgb(0, 0, 0);" title="${
            data.title
          }" href="${`/video/av${data.aid}/`}">${data.title}</a>`,
          {
            nodeType: 'div',
            className: 'clearfix v-data',
            childs: [
              {
                nodeType: 'div',
                style: 'display: inline-block;width:160px',
                childs: [
                  {
                    nodeType: 'a',
                    target: '_blank',
                    href: '/video/av' + data.aid,
                    onmouseenter: tools.preview,
                    onmouseleave: tools.preview,
                    onmousemove: tools.preview,
                    dataset: { id: data.aid },
                    childs: [
                      {
                        nodeType: 'div',
                        className: 'pic',
                        childs: [
                          `<div className="lazy-img" style="height:100px"><img src="${data.pic.replace(
                            /https?:/,
                            ''
                          )}@160w_100h.${tools.imgType}" /></div>`,
                          `<div className="cover-preview-module ${
                            element.isNew ? 'van-framepreview' : ''
                          } ranking"></div>`,
                          `<div className="mask-video"></div>`,
                          `<div className="danmu-module van-danmu"></div>`,
                          //`<span title="分区：${data.tname||data.badge}" className="tname">${data.tname||data.badge}</span>`,
                          {
                            nodeType: 'div',
                            dataset: { aid: data.aid },
                            title: '稍后再看',
                            className:
                              'watch-later-trigger w-later watch-later-video van-watchlater black',
                            onclick: tools.watchLater,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'display: inline-block;vertical-align: top;width: 130px;margin-left:3px',
                childs: [
                  '<span className="name"><i className="icon bilifont bili-icon_xinxi_UPzhu" style="background-position: -282px -154px;"></i>' +
                    `<a href="//space.bilibili.com/${
                      (data.owner && data.owner.mid) || data.mid
                    }/" target="_blank" title="${(data.owner && data.owner.name) || data.author}">${
                      (data.owner && data.owner.name) || data.author
                    }</a></span>`,
                  '<span className="play"><i className="icon bilifont bili-icon_shipin_bofangshu"></i>' +
                    `<span title="${
                      (data.stat && data.stat.view) || data.play
                    }">${tools.formatNumber(
                      (data.stat && data.stat.view) || data.play
                    )}</span></span>`,
                  '<span className="danmu"><i className="icon bilifont bili-icon_shipin_danmushu"></i>' +
                    `<span title="${
                      (data.stat && data.stat.danmaku) || data.video_review
                    }">${tools.formatNumber(
                      (data.stat && data.stat.danmaku) || data.video_review
                    )}</span></span>`,
                  '<span className="coin"><i className="icon bilifont bili-icon_shipin_yingbishu"></i>' +
                    `<span title="${
                      (data.stat && data.stat.coin) || data.coins
                    }">${tools.formatNumber(
                      (data.stat && data.stat.coin) || data.coins
                    )}</span></span>`,
                  `<span>时长:<span style="vertical-align: top;" title="${tools.formatNumber(
                    data.duration,
                    'time'
                  )}">${tools.formatNumber(data.duration, 'time')}</span>`,
                  `<span>${
                    data.score || data.pts ? '综合评分:' : ''
                  }<span style="vertical-align: top;" title="${data.score || data.pts}">${
                    data.score || data.pts
                      ? tools.formatNumber(data.score || data.pts)
                      : data.rcmd_reason && data.rcmd_reason.content
                  }</span></span>`,
                ],
              },
            ],
          },
        ],
      })
    }
    //将排行数据显示到指定目标中
    function showData(target, data) {
      while (target.lastChild) target.removeChild(target.lastChild)
      target.appendChild(loading)
      for (let i = 0; i < data.length; i++) {
        const itemData = data[i]
        let item, img
        item = element._c({
          nodeType: 'li',
          className:
            i == 0
              ? 'rank-item show-detail first highlight'
              : i < 3
              ? 'rank-item highlight'
              : 'rank-item',
          onmouseover: () => {
            item.classList.add('show-detail')
            if (img) {
              img.innerHTML = `<img src="${itemData.pic.split(':')[1]}@72w_45h.${tools.imgType}">`
              img = undefined
            }
          },
          onmouseleave: () => i != 0 && item.classList.remove('show-detail'),
          childs: [
            {
              nodeType: 'i',
              className: 'ri-num',
              innerText: i + 1,
              onmouseenter: (ev) => updateDetail(itemData, ev.pageY),
              onmouseleave: () => ((detail as any).div.style.display = 'none'),
            },
            {
              nodeType: 'a',
              target: '_blank',
              href: `/video/av${itemData.aid}/`,
              title: `${itemData.title}\r\n播放:${tools.formatNumber(
                (itemData.stat && itemData.stat.view) || itemData.play
              )} | ${tools.formatNumber(itemData.duration, 'time')} | UP: ${
                (itemData.owner && itemData.owner.name) || itemData.author
              }`,
              className: 'ri-info-wrap clearfix',
              childs: [
                i == 0
                  ? `<div className="lazy-img ri-preview"><img src="${
                      itemData.pic.split(':')[1]
                    }@72w_45h.${tools.imgType}"></div>`
                  : (img = element._c({ nodeType: 'div', className: 'lazy-img ri-preview' })),
                `<div className="ri-detail"><p className="ri-title">${
                  itemData.title
                }</p><p className="ri-point"><span className="name"><i className="icon bilifont bili-icon_xinxi_UPzhu" style="background-position: -282px -154px;"></i>${
                  (itemData.owner && itemData.owner.name) || itemData.author
                }</span></p></div>`,
                {
                  nodeType: 'div',
                  title: '添加到稍后再看',
                  dataset: { aid: itemData.aid },
                  className: 'watch-later-trigger w-later watch-later-video van-watchlater black',
                  onclick: tools.watchLater,
                },
              ],
            },
          ],
          parent: target,
        })
      }
    }
    let page = 1
    function handleScroll() {
      if (warp.lastChild.scrollHeight - warp.lastChild.scrollTop == warp.lastChild.clientHeight) {
        if (++page <= 10) {
          handleData(page)
        }
      }
    }
    //获取/缓存/调用显示数据
    async function handleData(page: number | string = '') {
      const config = configs[type]
      let dataPromise
      loading.firstChild.innerText = '正在加载...'
      config.list.appendChild(loading)
      if (config.data && !page) {
        dataPromise = Promise.resolve(config.data)
      } else {
        dataPromise = fetch(configs[type].dataLink + page, { credentials: 'include' })
          .then((res) => res.json())
          .then((res) => {
            if (res.code != 0) throw `请求排行榜失败 code ${res.code}</br>msg ${res.message}`
            if (!config.data) config.data = []
            config.data.push(...res.data.list)
            if (res.data.no_more) configs[1].list.removeEventListener('scroll', handleScroll)
            return config.data
          })
      }
      dataPromise
        .then((data) => {
          showData(config.list, data)
          config.list.removeChild(loading)
        })
        .catch((e) => {
          loading.firstChild.innerText = `请求排行榜发生错误 ${e}`
          console.error('请求排行榜发生错误', e)
        })
    }
    //处理排行榜切换事件，调用获取并显示数据
    function update(ev) {
      //console.log(ev);
      if (ev.target.dataset.type == type) return
      type = ev.target.dataset.type
      setting.setRankingType(type)
      tab.children[type].classList.add('on')
      tab.children[1 - type].classList.remove('on')
      type != warp.classList.contains('show-origin') && warp.classList.toggle('show-origin')
      //rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/0/${day}/`;
      more.href = configs[type].link
      handleData()
    }
    if (setting.noRanking) {
      //document.getElementById('ranking-all').style = 'display: none';
    } else {
      update({ target: { dataset: { type: setting.rankingType } } })
    }
  }

  //设置，包含设置变量以及设置窗口和对应的方法
  const setting = {
    dialog: undefined,
    historyData: JSON.parse(GM_getValue('historyRecommend', '[]')),
    historyLimit: isNaN(+GM_getValue('historyLimit')) ? 10 : +GM_getValue('historyLimit'),
    pageLimit: +GM_getValue('pageLimit') || 0,
    autoFreshCount: isNaN(+GM_getValue('autoFreshCount')) ? 1 : +GM_getValue('autoFreshCount'),
    hotkey: (() => {
      let key = GM_getValue('hotkey')
      if (!key) return ''
      return key
    })(),
    manualFreshCount: (() => {
      var mfc = GM_getValue('manualFreshCount', 1)
      if (isNaN(mfc) || mfc < 1) mfc = 1
      return mfc
    })(),
    boxHeight: +GM_getValue('boxHeight') || 2,
    noScrollBar: !!GM_getValue('noScrollBar'),
    reduceHeight: !!GM_getValue('reduceHeight', 0),
    rankingDays: { 1: '昨天', 3: '三日', 7: '一周' },
    rankingDay: (() => {
      var rd = GM_getValue('rankingDay', 3)
      if (rd != 1 && rd != 3 && rd != 7) rd = 3
      return rd
    })(),
    rankingType: GM_getValue('rankingType', 0),
    setRankingType(value) {
      if (this.rankingType == value) return
      GM_setValue('rankingType', (this.rankingType = value))
    },
    noRanking: GM_getValue('noRanking'),
    setNoRanking(value) {
      GM_setValue('noRanking', (this.noRanking = value))
      this.setStyle()
      if (!value) {
        document
          .querySelector(`#ranking-all .bili-tab-item[data-type="${this.rankingType}"]`)
          .dispatchEvent(new Event('mouseover'))
      }
    },
    noRankingWidth: GM_getValue('noRankingWidth'),
    setNoRankingWidth(value) {
      GM_setValue('noRankingWidth', (this.noRankingWidth = value))
      this.setStyle()
    },
    forceWidth: GM_getValue('forceWidth'),
    setForceWidth(value) {
      GM_setValue('forceWidth', (this.forceWidth = value))
      this.setStyle()
    },
    accessKey: GM_getValue('biliAppHomeKey'),
    storageAccessKey(key) {
      if (key) {
        GM_setValue('biliAppHomeKey', (this.accessKey = key))
      } else {
        delete this.accessKey
        GM_deleteValue('biliAppHomeKey')
      }
    },
    pushHistory(data) {
      this.historyData.unshift(...data)
    },
    saveHistory() {
      while (this.historyData.length > this.historyLimit) this.historyData.pop()
      GM_setValue('historyRecommend', JSON.stringify(this.historyData))
    },
    setHistoryLimit(limit) {
      GM_setValue('historyLimit', (this.historyLimit = +limit))
    },
    setPageLimit(limit) {
      GM_setValue('pageLimit', (this.pageLimit = +limit))
    },
    setAutoFreshCount(count) {
      GM_setValue('autoFreshCount', (this.autoFreshCount = +count))
    },
    setManualFreshCount(target) {
      var count = +target.value
      if (count < 1) count = target.value = 1
      GM_setValue('manualFreshCount', (this.manualFreshCount = +count))
    },
    setBoxHeight(line) {
      GM_setValue('boxHeight', (this.boxHeight = +line))
      this.setStyle()
    },
    setScrollBar(status) {
      GM_setValue('noScrollBar', (this.noScrollBar = +status))
      this.setStyle()
    },
    setReduceHeight(status) {
      GM_setValue('reduceHeight', (this.reduceHeight = +status))
      this.setStyle()
    },
    setHotkey(ev) {
      ev.preventDefault()
      const key = ev.key
      if (key == 'Backspace' || key == 'Delete' || key == ' ') {
        this.hotkey = ev.target.value = ''
        if (this.freshHotkey)
          this.freshHotkey = document.removeEventListener('keydown', this.freshHotkey)
      } else {
        this.hotkey = ev.target.value = ev.key.toUpperCase()
        if (!this.freshHotkey)
          document.addEventListener(
            'keydown',
            (this.freshHotkey = (ev) => this.freshHotkeyHandler(ev))
          )
      }
      GM_setValue('hotkey', this.hotkey)
    },
    freshHotkeyHandler(ev) {
      if (ev.target instanceof HTMLInputElement) return
      if (ev.key.toUpperCase() == this.hotkey) {
        document.querySelector('#bili_report_douga .btn-change > i').click()
      }
    },
    init() {
      this.setStyle()
      if (!!this.hotkey)
        document.addEventListener(
          'keydown',
          (this.freshHotkey = (ev) => this.freshHotkeyHandler(ev))
        )
    },
    setStyle() {
      if (!this.styleDiv) {
        this.styleDiv = element._c({
          nodeType: 'style',
          parent: document.head,
        })
      }
      let html = ''
      if (this.noScrollBar) {
        //不显示滚动条情况下，将内层容器宽度设置为比外层宽度多一个滚动条，则滚动条位置会溢出被遮挡
        html +=
          '#ranking-all .rank-list-wrap{width:calc(200% + 40px)}' +
          '#ranking-all .rank-list-wrap.show-origin{margin-left:calc(-100% - 20px)}'
        //左侧推荐容器本同理，但因为新版弹性布局如果没有滚动条内容会伸展到超出可视范围，需针对设置
      } else {
        //显示滚动条情况下，排行榜容器维持原样式，内层容器自带滚动条。
        //左侧推荐容器将内层高度设置为弹性，则外层容器固定高度下如果内容超出会显示滚动条。
        html += '#recommend #recommend-list{height:unset!important;}'
      }

      if (this.noRanking) {
        html += '#ranking-all{display: none !important}'
      }

      if (this.noRanking && this.noRankingWidth) {
        html +=
          '#recommend .card-list>.zone-list-box.storey-box, #recommend .zone-module>.l-con{width: 100% !important;}'
      }

      const reduceHeight = this.reduceHeight ? ' - 12px' : ''
      //设置推荐容器宽高
      if (element.isNew) {
        html +=
          `#recommend  .storey-box, #ranking-all ul.rank-list{height:calc(404px / 2 * ${this.boxHeight} ${reduceHeight})}` +
          `@media screen and (max-width: 1438px) { #recommend  .storey-box, #ranking-all ul.rank-list{height:calc(364px / 2 * ${this.boxHeight} ${reduceHeight})} }`
        if (this.setListWidth) {
          //新版的推荐容器宽度针对设置，该方法由初始化推荐容器的方法自行构造，真是深井冰的一团糟乱调用
          this.setListWidth()
        }
      } else {
        //旧版因为固定间隔布局的原因，无论滚动条在内还是在外是否显示均需要维持比外层多一个滚动条宽度
        html +=
          `#recommend  .storey-box {height:calc(336px / 2 * ${this.boxHeight}${reduceHeight})}` +
          `#ranking-all ul.rank-list{height:calc(336px / 2 * ${this.boxHeight}${reduceHeight} - 16px)}` +
          '#recommend #recommend-list{width:calc(100% + 20px)!important;}'
      }
      if (this.forceWidth) {
        //强制加宽低分辨率
        html += `
@media screen and (max-width: 1654px) {
	.b-footer-wrap .zone-list-box .live-card:nth-child(n+9):nth-child(-n+10),
	.b-footer-wrap .zone-list-box .video-card-common:nth-child(n+9):nth-child(-n+10),
	.b-wrap .zone-list-box .live-card:nth-child(n+9):nth-child(-n+10),
	.b-wrap .zone-list-box .video-card-common:nth-child(n+9):nth-child(-n+10),
	.b-footer-wrap .manga-list-box .manga-card:nth-child(n+9):nth-child(-n+10),
	.b-wrap .manga-list-box .manga-card:nth-child(n+9):nth-child(-n+10),
	.b-footer-wrap .extension .video-card-common:nth-child(5),
	.b-wrap .extension .video-card-common:nth-child(5),
	.b-footer-wrap .rcmd-box-wrap>.rcmd-box .video-card-reco:nth-child(n+7):nth-child(-n+8),
	.b-wrap .rcmd-box-wrap>.rcmd-box .video-card-reco:nth-child(n+7):nth-child(-n+8),
	.b-footer-wrap .recommend-box .video-card-reco:nth-child(n+7):nth-child(-n+8),
	.b-wrap .recommend-box .video-card-reco:nth-child(n+7):nth-child(-n+8){
			display:block !important;
	}
	.b-wrap .rcmd-box-wrap>.rcmd-box {
			width: 690px !important;
	}
	.b-footer-wrap .recommend-box, .b-wrap .recommend-box {
			width: 717px !important;
	}
	.b-footer-wrap .extension, .b-wrap .extension,
	.b-footer-wrap .zone-list-box, .b-wrap .zone-list-box,
	.b-footer-wrap .manga-list-box, .b-wrap .manga-list-box {
			width: 880px !important;
	}
	.b-footer-wrap .elevator, .b-wrap .elevator {
			margin-left: 602px !important;
	}
	.b-footer-wrap .zone-list-box .time-line-card, .b-wrap .zone-list-box .time-line-card {
			width: 210px !important;
			margin: 0 5px 13px 0!important;
	}
	.b-wrap {
			width: 1150px !important;
	}
	.b-footer-wrap .zone-list-box .article-card, .b-wrap .zone-list-box .article-card {
			width: 440px;
	}
	.van-popper[x-placement^=top] {
			top: 208px !important;
	}
	.van-popper[x-placement^=top] .popper__arrow {
			top: -6px;
			border-width: 6px !important;
			border-color: transparent !important;
			border-bottom-color: #ebeef5 !important;
			border-top-width: 0 !important;
	}
	.van-popper[x-placement^=top] .popper__arrow:after {
			bottom: 3px;
			top: 1px;
	}
	.van-popper[x-placement^=top] .popper__arrow:after {
			border-top-color: transparent !important;
			border-bottom-color: #fff;
			border-top-width: 0 !important;
			border-bottom-width: 6px !important;
	}
	/*旧版*/
	.bili-wrapper { width: 1160px !important; }
	.bili-wrapper .l-con { width:900px !important; }
	.elevator-module { margin-left: 590px !important;}
}
`
      }
      this.styleDiv.innerHTML = html
    },
    show() {
      if (this.dialog) return document.body.appendChild(this.dialog)
      this.dialog = element._c({
        nodeType: 'div',
        id: 'biliAppHomeSetting',
        style:
          'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 10000;',
        childs: [
          {
            nodeType: 'div',
            style:
              'width:400px;right:0;left:0;position:absolute;padding:20px;background:#fff;border-radius:8px;margin:auto;transform:translate(0,50%);box-sizing:content-box',
            childs: [
              '<style>div#biliAppHomeSetting>div>div { display: inline-block; width: 200px; }</style>',
              {
                nodeType: 'h2',
                innerText: 'APP首页推荐设置',
                style: 'font-size: 20px;color: #4fc1e9;font-weight: 400;',
                childs: [
                  {
                    nodeType: 'span',
                    innerText: 'Ｘ',
                    style: 'float:right;cursor: pointer;',
                    onclick: () => document.body.removeChild(this.dialog),
                  },
                ],
              },
              /*
											{
													nodeType:'div',style:'margin: 10px 0;',
													childs: [
															'<label style="margin-right: 5px;">全站排行默认:</label>',
															`<span style="margin-right: 5px;color:#00f" title="${[
																	'2020年10月左右起B站不再提供可选日期全站总排行数据',
																	'脚本显示排行更改为近期全站投稿排行，因接口限制不再提供30日数据'
															].join('\r\n')}">(?)</span>`,
															{
																	nodeType:'select',
																	style:'vertical-align: top',
																	onchange:({target})=>GM_setValue('rankingDay',(this.rankingDay = target.value)),
																	childs:Object.entries(this.rankingDays).map(([day,text])=>({
																			nodeType:'option',value:day,innerText:text,
																	})),
																	value:this.rankingDay
															}
													]
											},
											*/
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">保存推荐数量:</label>',
                  `<span style="margin-right: 5px;color:#00f" title="${[
                    '页面关闭时会保存此数量的最新推荐，保存的推荐下次打开首页时会显示在新推荐的下方',
                    '提交不喜欢的状态不会被保存在本地，但是已经提交给服务器所以没有必要再次提交',
                    '每10条推荐占用空间约2KB，注意不要保存太多以免拖慢脚本管理器',
                  ].join('\r\n')}">(?)</span>`,
                  {
                    nodeType: 'input',
                    type: 'number',
                    value: this.historyLimit,
                    min: 0,
                    step: 10,
                    onchange: ({ target }) => this.setHistoryLimit(target.value),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">页面显示限制:</label>',
                  `<span style="margin-right: 5px;color:#00f" title="${[
                    '页面中显示的推荐数量限制，超出的旧推荐会从推荐框中清除',
                    '0表示无限制，更改设置后需要点击加载更多才会生效',
                    '应当比保存推荐设置的数量大，否则保存的推荐不会全部被显示没有意义',
                  ].join('\r\n')}">(?)</span>`,
                  {
                    nodeType: 'input',
                    type: 'number',
                    value: this.pageLimit,
                    min: 0,
                    step: 10,
                    onchange: ({ target }) => this.setPageLimit(+target.value),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">自动刷新页数:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="每次打开首页时自动加载的新推荐页数，每页10条">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'number',
                    value: this.autoFreshCount,
                    min: 0,
                    step: 1,
                    onchange: ({ target }) => this.setAutoFreshCount(+target.value),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">手动刷新页数:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="每次点击加载更多时加载的新推荐页数，每页10条">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'number',
                    value: this.manualFreshCount,
                    min: 1,
                    step: 1,
                    onchange: ({ target }) => this.setManualFreshCount(target),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">显示推荐高度:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="显示推荐框的行数，超出的推荐内容会产生滚动条来容纳">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'number',
                    value: this.boxHeight,
                    min: 2,
                    step: 2,
                    onchange: ({ target }) => this.setBoxHeight(+target.value),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">刷新快捷键:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="设置一个加载更多的快捷键，如果为空则关闭">(?)</span>',
                  {
                    nodeType: 'input',
                    value: this.hotkey,
                    onkeydown: (ev) => this.setHotkey(ev),
                    style: 'width:50px',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">高度减去间隔:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="勾选此项推荐框的高度将减去一行间隔，如果你对浏览器进行缩放导致显示超出可以尝试勾选">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'checkbox',
                    checked: this.reduceHeight,
                    onchange: ({ target }) => this.setReduceHeight(target.checked),
                    style: 'vertical-align: bottom',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">不显示排行榜:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="勾选此项将不显示全站排行榜，但是右侧会存在空白">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'checkbox',
                    checked: this.noRanking,
                    onchange: ({ target }) => this.setNoRanking(target.checked),
                    style: 'vertical-align: bottom',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">不显示滚动条:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="勾选此项将不显示滚动条，但是列表仍然可以滚动">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'checkbox',
                    checked: this.noScrollBar,
                    onchange: ({ target }) => this.setScrollBar(target.checked),
                    style: 'vertical-align: bottom',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">无排行榜加宽:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="勾选此项将在不显示排行榜时加宽推荐框，但是推荐内容可能会对不齐">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'checkbox',
                    checked: this.noRankingWidth,
                    onchange: ({ target }) => this.setNoRankingWidth(target.checked),
                    style: 'vertical-align: bottom',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">低分辨率加宽:</label>',
                  '<span style="margin-right: 5px;color:#00f" title="勾选此项将把1654px分辨率以下显示整体强制加宽到每行5个推荐，效果和副作用未知，自行尝试">(?)</span>',
                  {
                    nodeType: 'input',
                    type: 'checkbox',
                    checked: this.forceWidth,
                    onchange: ({ target }) => this.setForceWidth(target.checked),
                    style: 'vertical-align: bottom',
                  },
                ],
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
              },
              {
                nodeType: 'div',
                style: 'margin: 10px 0;',
                childs: [
                  '<label style="margin-right: 5px;">APP接口授权:</label>',
                  `<span style="margin-right: 5px;color:#00f" title="${[
                    '目前获取根据个人观看喜好的APP首页数据和提交定制不喜欢的视频需要获取授权key。',
                    '点击获取授权将从官方授权接口获取一个授权key，获取的key保存在脚本管理器内。',
                    '如果不想使用授权，脚本仍然能从官方接口获取随机推荐视频，但内容可能不再根据个人喜好且无法提交不喜欢内容。',
                    '点击删除授权可从脚本管理器中删除已获取授权key，脚本将按照没有获取授权的情况执行。',
                    '授权key有效期大约一个月，如果看到奇怪的推荐提交不喜欢时遇到奇怪的错误可以尝试删除授权重新获取。',
                  ].join('\r\n')}">(?)</span>`,
                  {
                    nodeType: 'button',
                    style:
                      'padding:0 15px;height:30px;background:#4fc1e9;color:white;border-radius:5px;border:none;cursor:pointer;',
                    innerText: this.accessKey ? '删除授权' : '获取授权',
                    onclick: ({ target }) => this.handleKey(target),
                  },
                ],
              },
              {
                nodeType: 'div',
                childs: [
                  '<a href="https://github.com/indefined/UserScripts/issues" target="_blank">github问题反馈</a>',
                  `<a href="https://greasyfork.org/scripts/368446" target="_blank" style="padding-left:20px;">当前版本:${GM_info.script.version}</a>`,
                ],
              },
            ],
          },
        ],
        parent: document.body,
      })
    },
    handleKey(target) {
      if (target.innerText === '删除授权') {
        this.storageAccessKey(undefined)
        target.innerText = '获取授权'
        tools.toast('删除授权成功')
        return
      } else {
        target.innerText = '获取中...'
        target.style['pointer-events'] = 'none'
        let tip = '请求授权接口错误'
        fetch(
          'https://passport.bilibili.com/login/app/third?appkey=27eb53fc9058f8c3' +
            '&api=https%3A%2F%2Fwww.mcbbs.net%2Ftemplate%2Fmcbbs%2Fimage%2Fspecial_photo_bg.png&sign=04224646d1fea004e79606d3b038c84a',
          {
            method: 'GET',
            credentials: 'include',
          }
        )
          .then((res) => {
            return res.json().catch((e) => {
              throw { tip, msg: '返回数据异常:', data: res }
            })
          })
          .then((data) => {
            if (data.code || !data.data) {
              throw { tip, msg: data.msg || data.message || data.code, data }
            } else if (!data.data.has_login) {
              throw { tip, msg: '你必须登录B站之后才能使用授权', data }
            } else if (!data.data.confirm_uri) {
              throw { tip, msg: '无法获得授权网址', data }
            } else {
              return data.data.confirm_uri
            }
          })
          .then(
            (url) =>
              new Promise((resolve, reject) => {
                let tip = '获取授权错误'
                window.addEventListener('message', (ev) => {
                  if (ev.origin != 'https://www.mcbbs.net' || !ev.data) return
                  const key = ev.data.match(/access_key=([0-9a-z]{32})/)
                  if (key) {
                    this.storageAccessKey(key[1])
                    tools.toast('获取授权成功')
                    target.innerText = '删除授权'
                    clearTimeout(timeout)
                    document.body.contains(iframe) && document.body.removeChild(iframe)
                    resolve()
                  } else {
                    reject({ tip, msg: '没有获得匹配的密钥', data: ev })
                  }
                })
                let timeout = setTimeout(() => {
                  document.body.contains(iframe) && document.body.removeChild(iframe)
                  reject({ tip, msg: '请求超时' })
                }, 5000)
                let iframe = element._c({
                  nodeType: 'iframe',
                  style: 'display:none',
                  src: url,
                  parent: document.body,
                })
              })
          )
          .catch((error) => {
            target.innerText = '获取授权'
            tools.toast(`${error.tip}:${error.msg}`, error)
          })
          .then(() => {
            target.style['pointer-events'] = 'unset'
          })
      }
    },
  }

  //初始化
  function init() {
    if (document.querySelector('.international-home')) {
      element.setIsNew(1)
    } else if (document.querySelector('#i_cecream')) {
      element.setIsNew(2)
      throw 'Bilibili APP首页脚本目前尚未适配新版主页，点击https://github.com/indefined/UserScripts/issues/76 查看详情'
    }

    try {
      setting.init()
      InitRecommend()
      window.addEventListener('beforeunload', () => setting.saveHistory())
      InitRanking()
    } catch (e) {
      console.error(e)
    }
  }

  if (element.mainDiv) {
    init()
  } else {
    if (document.head.querySelector('link[href*=home]')) {
      setting.setStyle()
      //console.log('observe');
      new MutationObserver((mutations, observer) => {
        //console.log(mutations)
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.id == 'bili_douga' || node.className == 'bili-grid') {
              observer.disconnect()
              element.mainDiv = node.cloneNode(true)
              init()
              return
            }
          }
        }
      }).observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
  }
})()
