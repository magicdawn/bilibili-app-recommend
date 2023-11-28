import type { RecItemType } from '$define'

export abstract class BaseService {
  abstract hasMore: boolean
  abstract refreshForHome(): Promise<RecItemType[] | undefined>
  abstract refreshForGrid(): Promise<RecItemType[] | undefined>
  abstract loadMore(): Promise<RecItemType[] | undefined>
}

export interface IService {
  hasMore: boolean
  loadMore(): Promise<RecItemType[] | undefined>
}
