import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { type ItemsSeparator, type PopularWeeklyItemExtend } from '$define'
import { ApiType } from '$define/index.shared'
import type { PopularWeeklyJson } from '$define/popular-weekly'
import type { PopularWeeklyListItem, PopularWeeklyListJson } from '$define/popular-weekly.list'
import { blacklistIds } from '$modules/user/relations/blacklist'
import { request } from '$request'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { Switch } from 'antd'
import dayjs from 'dayjs'
import delay from 'delay'
import { shuffle } from 'lodash'
import pmap from 'promise.map'
import type { IService } from './base'
import { QueueStrategy } from './base'

let episodes: PopularWeeklyListItem[] = []
let cacheKey = ''

// 每周五晚 18:00 更新
function genCacheKey() {
  const now = dayjs()
  return [now.format('YYYYMMDD'), now.hour() < 18 ? 'lt-18' : 'gte-18'].join('_')
}

async function getEpisodeList() {
  const useCache = episodes.length && cacheKey && cacheKey === genCacheKey()
  if (useCache) return episodes

  const res = await request.get('/x/web-interface/popular/series/list')
  const json = res.data as PopularWeeklyListJson
  const list = json.data.list

  episodes = list
  cacheKey = genCacheKey()
  return episodes
}

export class PopularWeeklyService implements IService {
  static id = 0
  static PAGE_SIZE = 20

  episodesLoaded = false
  episodes: PopularWeeklyListItem[] = []

  id: number
  useShuffle: boolean
  constructor() {
    this.id = PopularWeeklyService.id++
    this.useShuffle = settings.shuffleForPopularWeekly
  }

  // full-list = returnedItems + bufferQueue + more
  qs = new QueueStrategy<PopularWeeklyItemExtend | ItemsSeparator>(PopularWeeklyService.PAGE_SIZE)

  get hasMore() {
    if (!this.episodesLoaded) return true // not loaded yet
    return !!this.qs.bufferQueue.length || !!this.episodes.length
  }

  async loadMore() {
    // load ep list
    if (!this.episodesLoaded) {
      this.episodes = await getEpisodeList()
      this.episodesLoaded = true
      if (this.useShuffle) this.episodes = shuffle(this.episodes)
    }

    if (!this.hasMore) return

    /**
     * no shuffle
     */

    if (!this.useShuffle) {
      // from queue
      if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()

      // fill queue
      const ep = this.episodes[0]
      const epNum = ep.number
      const items = await fetchWeeklyItems(epNum)
      this.qs.bufferQueue.push(
        {
          api: ApiType.separator,
          uniqId: `popular-weekly-${epNum}`,
          content: (
            <a target='_blank' href={`https://www.bilibili.com/v/popular/weekly?num=${epNum}`}>
              {ep.name}
            </a>
          ),
        },
        ...items,
      )
      this.episodes = this.episodes.slice(1) // consume 1

      return this.qs.sliceFromQueue()
    }

    /**
     * shuffle
     */

    // make queue enough
    const prefetchPage = 5
    while (
      this.qs.bufferQueue.length < PopularWeeklyService.PAGE_SIZE * prefetchPage &&
      this.episodes.length
    ) {
      this.episodes = shuffle(this.episodes)
      const episodes = this.episodes.slice(0, prefetchPage) // slice
      this.episodes = this.episodes.slice(prefetchPage) // rest

      // 小心风控, code: -352, 需要去热门页面点验证码
      const fetched = await pmap(
        episodes.map((x) => x.number),
        (episodeNum) => fetchWeeklyItems(episodeNum),
        2,
      )

      this.qs.bufferQueue = shuffle([...this.qs.bufferQueue, ...fetched.flat()])
    }

    return this.qs.sliceFromQueue()
  }

  get usageInfo() {
    return <PopularWeeklyUsageInfo />
  }
}

/**
 * 每期必看, 应该不会变吧~
 */

const cache: Record<number, PopularWeeklyItemExtend[]> = {}

async function fetchWeeklyItems(episodeNum: number) {
  if (!cache[episodeNum]?.length) {
    const res = await request.get('/x/web-interface/popular/series/one', {
      params: { number: episodeNum },
    })
    const json = res.data as PopularWeeklyJson
    const items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: ApiType.popularWeekly,
        uniqId: item.bvid,
      } as PopularWeeklyItemExtend
    })

    cache[episodeNum] = items
  }
  let items = cache[episodeNum]

  // 过滤黑名单
  items = items.filter((x) => !blacklistIds.has(x.owner.mid.toString()))
  return items
}

function PopularWeeklyUsageInfo() {
  const { shuffleForPopularWeekly } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()

  return (
    <>
      <Switch
        style={{ marginLeft: '10px' }}
        checked={shuffleForPopularWeekly}
        onChange={async (val) => {
          updateSettings({ shuffleForPopularWeekly: val })
          await delay(100)
          onRefresh?.()
        }}
        checkedChildren='随机顺序'
        unCheckedChildren='默认顺序'
      />
    </>
  )
}
