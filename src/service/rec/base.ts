import type { TabType } from '$components/RecHeader/tab.shared'
import type { RecItemType } from '$define'
import type { ReactNode } from 'react'

export abstract class BaseService {
  abstract hasMore: boolean
  abstract refreshForHome(): Promise<RecItemType[] | undefined>
  abstract refreshForGrid(): Promise<RecItemType[] | undefined>
  abstract loadMore(): Promise<RecItemType[] | undefined>
}

export interface IService {
  forTab: TabType
  hasMore: boolean
  loadMore(abortSignal: AbortSignal): Promise<RecItemType[] | undefined>
  usageInfo?: ReactNode
}
