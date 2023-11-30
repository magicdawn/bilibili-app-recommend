import type { RecItemType } from '$define'
import type { ReactNode } from 'react'

export abstract class BaseService {
  abstract hasMore: boolean
  abstract refreshForHome(): Promise<RecItemType[] | undefined>
  abstract refreshForGrid(): Promise<RecItemType[] | undefined>
  abstract loadMore(): Promise<RecItemType[] | undefined>
}

export interface IService {
  hasMore: boolean
  loadMore(abortSignal: AbortSignal): Promise<RecItemType[] | undefined>
  usageInfo?: ReactNode
}

export class QueueStrategy<T extends RecItemType = RecItemType> {
  // full-list = returnQueue + bufferQueue + more
  private returnQueue: T[] = []
  bufferQueue: T[] = []

  ps: number
  constructor(ps = 20) {
    this.ps = ps
  }

  sliceFromQueue() {
    if (this.bufferQueue.length) {
      const sliced = this.bufferQueue.slice(0, this.ps)
      this.bufferQueue = this.bufferQueue.slice(this.ps)
      return this.doReturnItems(sliced)
    }
  }

  // add to returnQueue
  doReturnItems(items: T[] | undefined) {
    this.returnQueue.push(...(items || []))
    return items
  }
  // restore from returnQueue
  restore() {
    this.bufferQueue = [...this.returnQueue, ...this.bufferQueue]
    this.returnQueue = []
  }
}
