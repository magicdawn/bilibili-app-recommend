import type { RecItemType } from '$define'
import type { PopularWeeklyListItem, PopularWeeklyListJson } from '$define/popular-weekly.list'
import { request } from '$request'
import type { IService } from './base'

const episodes: PopularWeeklyListItem[] = []

async function getList() {
  const res = await request.get('/x/web-interface/popular/series/list')
  const json = res.data as PopularWeeklyListJson
  const list = json.data.list
}

export class PopularWeeklyService implements IService {
  hasMore = false

  loadMore(): Promise<RecItemType[] | undefined> {
    throw new Error('Method not implemented.')
  }
}
