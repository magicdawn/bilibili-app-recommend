import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { PopularWeeklyItemExtend } from '$define'
import type { PopularWeeklyJson } from '$define/popular-weekly'
import type { PopularWeeklyListItem, PopularWeeklyListJson } from '$define/popular-weekly.list'
import { request } from '$request'
import { blacklistIds } from '$service/user/relations/blacklist'
import { settings, updateSettings, useSettingsSnapshot } from '$settings'
import { Switch } from 'antd'
import dayjs from 'dayjs'
import delay from 'delay'
import { shuffle } from 'lodash'
import type { IService } from './base'

let episodes: PopularWeeklyListItem[] = []
let cacheKey = ''

function genCacheKey() {
  const now = dayjs()
  return [now.format('YYYYMMDD'), now.hour() < 18 ? 'less-18' : 'gte-18'].join('-')
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
  #returnedItems: PopularWeeklyItemExtend[] = []
  #bufferQueue: PopularWeeklyItemExtend[] = []

  private doReturnItems(items: PopularWeeklyItemExtend[] | undefined) {
    this.#returnedItems = this.#returnedItems.concat(items || [])
    return items
  }

  restore() {
    this.#bufferQueue = [...this.#returnedItems, ...this.#bufferQueue]
    this.#returnedItems = []
  }

  sliceFromQueue() {
    if (this.#bufferQueue.length) {
      const sliced = this.#bufferQueue.slice(0, PopularWeeklyService.PAGE_SIZE)
      this.#bufferQueue = this.#bufferQueue.slice(PopularWeeklyService.PAGE_SIZE)
      return this.doReturnItems(sliced)
    }
  }

  get hasMore() {
    if (!this.episodesLoaded) return true // not loaded yet
    return !!this.#bufferQueue.length || !!this.episodes.length
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
      if (this.#bufferQueue.length) return this.sliceFromQueue()

      // fill queue
      const episodeNum = this.episodes[0].number
      const items = await fetchWeeklyItems(episodeNum)
      this.#bufferQueue = this.#bufferQueue.concat(items)
      this.episodes = this.episodes.slice(1) // consume 1

      return this.sliceFromQueue()
    }

    /**
     * shuffle
     */

    // make queue enough
    const prefetchPage = 5
    while (
      this.#bufferQueue.length < PopularWeeklyService.PAGE_SIZE * prefetchPage &&
      this.episodes.length
    ) {
      this.episodes = shuffle(this.episodes)
      const episodes = this.episodes.slice(0, prefetchPage) // slice
      this.episodes = this.episodes.slice(prefetchPage) // rest
      const fetched = await Promise.all(
        episodes.map((x) => x.number).map((episodeNum) => fetchWeeklyItems(episodeNum))
      )
      this.#bufferQueue = shuffle([...this.#bufferQueue, ...fetched.flat()])
    }

    return this.sliceFromQueue()
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
      return { ...item, api: 'popular-weekly', uniqId: item.bvid } as PopularWeeklyItemExtend
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
