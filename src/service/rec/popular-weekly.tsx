import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { PopularWeeklyItemExtend } from '$define'
import type { PopularWeeklyJson } from '$define/popular-weekly'
import type { PopularWeeklyListItem, PopularWeeklyListJson } from '$define/popular-weekly.list'
import { request } from '$request'
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

  episodes: PopularWeeklyListItem[] = []
  episodeIndex = 0
  episodeNum = -1
  hasMore = true

  id: number
  shuffle: boolean
  constructor() {
    this.id = PopularWeeklyService.id++
    this.shuffle = settings.shuffleForPopularWeekly
  }

  async loadMore() {
    if (!this.hasMore) return

    // load list
    if (!this.episodes.length) {
      this.episodes = await getEpisodeList()
      if (this.shuffle) this.episodes = shuffle(this.episodes)
      this.episodeIndex = 0
    }

    this.episodeNum = this.episodes[this.episodeIndex].number
    this.hasMore = this.episodeIndex < this.episodes.length - 1
    const res = await request.get('/x/web-interface/popular/series/one', {
      params: { number: this.episodeNum },
    })
    const json = res.data as PopularWeeklyJson
    const items = (json.data.list || []).map((item) => {
      return { ...item, api: 'popular-weekly', uniqId: item.bvid } as PopularWeeklyItemExtend
    })

    this.episodeIndex++

    return items
  }

  get usageInfo() {
    return <PopularWeeklyUsageInfo />
  }
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
