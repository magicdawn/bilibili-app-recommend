import type { RecItemTypeOrSeparator } from '$define'

export interface IService {
  hasMore: boolean
  loadMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined>
  usageInfo?: ReactNode
}

export class QueueStrategy<T extends RecItemTypeOrSeparator = RecItemTypeOrSeparator> {
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
    this.returnQueue = this.returnQueue.concat(items || [])
    return items
  }

  // restore from returnQueue
  restore() {
    this.bufferQueue = [...this.returnQueue, ...this.bufferQueue]
    this.returnQueue = []
  }
}

export function usePopupContainer<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const getPopupContainer = useCallback(() => {
    return ref.current?.closest<T>('.area-header') || document.body
  }, [])
  return { ref, getPopupContainer }
}
