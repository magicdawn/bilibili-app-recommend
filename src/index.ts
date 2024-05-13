/*
 * 佛曰:
 *     写字楼里写字间，写字间里程序员；
 *     程序人员写程序，又拿程序换酒钱。
 *     酒醒只在网上坐，酒醉还来网下眠；
 *     酒醉酒醒日复日，网上网下年复年。
 *     但愿老死电脑间，不愿鞠躬老板前；
 *     奔驰宝马贵者趣，公交自行程序员。
 *     别人笑我忒疯癫，我笑自己命太贱；
 *     不见满街漂亮妹，哪个归得程序员？
 */

// styles
import '$common/global.scss'
import '@icon-park/react/styles/index.css'

// css modules 与 emtion 混用, 先 import 作为 base 的 css modules
import '$components/ModalSettings/index.module.scss'
import '$components/VideoCard/index.module.scss'
import '$components/video-grid.module.scss'

// dayjs setup
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

// load config first
import './modules/settings'

import { IN_BILIBILI_HOMEPAGE, IN_BILIBILI_VIDEO_PLAY_PAGE } from '$common'
import { initHomepage } from '$main/homepage'
import { initVideoPlayPage } from '$main/video-play-page'

void (function main() {
  if (IN_BILIBILI_HOMEPAGE) {
    return initHomepage()
  }

  if (IN_BILIBILI_VIDEO_PLAY_PAGE) {
    return initVideoPlayPage()
  }
})()
