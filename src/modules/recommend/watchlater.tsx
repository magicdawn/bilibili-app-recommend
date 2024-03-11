import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { type ItemsSeparator, type WatchLaterItemExtend, type WatchLaterJson } from '$define'
import { ApiType } from '$define/index.shared'
import { request } from '$request'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { getHasLogined } from '$utility'
import { toast } from '$utility/toast'
import { Switch, Tag } from 'antd'
import dayjs from 'dayjs'
import delay from 'delay'
import { shuffle } from 'lodash'
import type { ComponentProps, ReactNode } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { QueueStrategy, type IService } from './base'

export const watchLaterState = proxy({
  updatedAt: 0,
  bvidSet: proxySet<string>(),
})
export function useWatchLaterState(bvid: string) {
  return useSnapshot(watchLaterState).bvidSet.has(bvid)
}

if (getHasLogined()) {
  setTimeout(() => {
    new WatchLaterRecService().loadMore() // init watchLaterState
  })
}

/**
 * Q: 为什么不一次性加载?
 * A: 全部加载特别卡, 没有滚动时没必要全部加载
 */

export class WatchLaterRecService implements IService {
  static PAGE_SIZE = 20
  static LAST_BVID_ARR: string[] = []

  qs = new QueueStrategy<WatchLaterItemExtend | ItemsSeparator>(WatchLaterRecService.PAGE_SIZE)

  useShuffle: boolean
  addSeparator: boolean
  constructor(keepOrder?: boolean) {
    this.keepOrder = keepOrder ?? false
    this.useShuffle = settings.shuffleForWatchLater
    this.addSeparator = settings.addSeparatorForWatchLater
  }

  private async fetch() {
    const res = await request.get('/x/v2/history/toview/web')
    const json = res.data as WatchLaterJson
    const items: WatchLaterItemExtend[] = json.data.list.map((item) => {
      return {
        ...item,
        api: ApiType.watchlater,
        uniqId: `watchlater-${item.bvid}`,
      }
    })

    // save
    if (Date.now() > watchLaterState.updatedAt) {
      watchLaterState.updatedAt = Date.now()
      watchLaterState.bvidSet = proxySet(items.map((i) => i.bvid))
    }

    // keep 最近几天内
    const gate = dayjs().subtract(2, 'days').unix()
    const firstNotTodayAddedIndex = items.findIndex((item) => item.add_at < gate)

    let itemsWithSeparator: Array<WatchLaterItemExtend | ItemsSeparator> = items

    if (firstNotTodayAddedIndex !== -1) {
      const recent = items.slice(0, firstNotTodayAddedIndex)
      let earlier = items.slice(firstNotTodayAddedIndex)

      // 保持顺序
      if (this.keepOrder && WatchLaterRecService.LAST_BVID_ARR.length) {
        earlier = earlier
          .map((item) => ({
            item,
            // if not found, -1, front-most
            index: WatchLaterRecService.LAST_BVID_ARR.findIndex((bvid) => item.bvid === bvid),
          }))
          .sort((a, b) => a.index - b.index)
          .map((x) => x.item)
      }
      // 洗牌
      else if (this.useShuffle) {
        earlier = shuffle(earlier)
      }

      // combine
      itemsWithSeparator = [
        !!recent.length &&
          this.addSeparator && {
            api: ApiType.separator as const,
            uniqId: 'watchlater-recent',
            content: '近期',
          },
        ...recent,

        !!earlier.length &&
          this.addSeparator && {
            api: ApiType.separator as const,
            uniqId: 'watchlater-earlier',
            content: '更早',
          },
        ...earlier,
      ].filter(Boolean)
    }

    // FIXME: 测试 watchlater 不足一屏的情况
    // https://github.com/magicdawn/bilibili-app-recommend/issues/41
    // this.items = items.slice(0, 10)
    // this.count = this.items.length

    this.count = json.data.count

    // save for next keepOrder=true
    WatchLaterRecService.LAST_BVID_ARR = itemsWithSeparator
      .map((item) => item.api === ApiType.watchlater && item.bvid)
      .filter(Boolean)

    return itemsWithSeparator
  }

  loaded = false
  count: number = 0
  keepOrder: boolean

  get usageInfo(): ReactNode {
    if (!this.loaded) return
    const { count } = this
    return <WatchLaterUsageInfo count={count} />
  }

  get hasMore() {
    if (!this.loaded) return true
    return !!this.qs.bufferQueue.length
  }

  async loadMore() {
    if (!this.hasMore) return

    if (!this.loaded) {
      const items = await this.fetch()
      this.qs.bufferQueue.push(...items)
      this.loaded = true
    }

    return this.qs.sliceFromQueue()
  }
}

function WatchLaterUsageInfo({ count }: { count: number }) {
  const color: ComponentProps<typeof Tag>['color'] =
    count <= 90 ? 'success' : count < 100 ? 'warning' : 'error'
  const title = `${color !== 'success' ? '快满了~ ' : ''}已使用 ${count} / 100`

  const { shuffleForWatchLater } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()

  return (
    <>
      <Tag
        color={color}
        style={{
          marginLeft: 20,
          marginRight: 0,
          marginTop: 1,
          cursor: 'pointer',
        }}
        title={title}
        onClick={() => {
          toast(`稍后再看: ${title}`)
        }}
      >
        {count} / 100
      </Tag>

      <Switch
        style={{ marginLeft: 15 }}
        checkedChildren='随机顺序'
        unCheckedChildren='添加顺序'
        checked={shuffleForWatchLater}
        onChange={async (checked) => {
          updateSettings({ shuffleForWatchLater: checked })
          await delay(100)
          onRefresh?.()
        }}
      />
    </>
  )
}
