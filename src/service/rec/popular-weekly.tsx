import { RecItemType } from '$define'
import { IService } from './base'

export class PopularWeeklyService implements IService {
  hasMore = false

  loadMore(): Promise<RecItemType[] | undefined> {
    throw new Error('Method not implemented.')
  }
}
