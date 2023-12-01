import type { RecItemExtraType } from '$define'
import type { ReactNode } from 'react'

export interface IService {
  hasMore: boolean
  loadMore(abortSignal: AbortSignal): Promise<RecItemExtraType[] | undefined>
  usageInfo?: ReactNode
}

export class QueueStrategy<T extends RecItemExtraType = RecItemExtraType> {
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
