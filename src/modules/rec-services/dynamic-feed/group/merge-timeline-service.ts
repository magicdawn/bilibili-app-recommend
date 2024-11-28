import type { DynamicFeedItem } from '$define'
import { orderBy } from 'es-toolkit'
import pmap from 'promise.map'
import { fetchVideoDynamicFeeds } from '../api'
import type { UpMidType } from '../store'

export class FollowGroupUpService {
  constructor(public upMid: UpMidType) {}

  bufferQueue: DynamicFeedItem[] = []
  hasMoreForApi = true
  offset: string = ''
  page = 0 // pages loaded

  get hasMore() {
    return !!this.bufferQueue.length || this.hasMoreForApi
  }

  async fillQueue(minimalQueueSize: number, abortSignal?: AbortSignal) {
    while (
      !abortSignal?.aborted &&
      this.hasMoreForApi &&
      this.bufferQueue.length < minimalQueueSize
    ) {
      const data = await fetchVideoDynamicFeeds({
        upMid: this.upMid,
        page: this.page + 1,
        offset: this.offset,
      })

      this.bufferQueue.push(...data.items)
      this.offset = data.offset
      this.hasMoreForApi = data.has_more
      this.page++
    }
  }
}

export class FollowGroupMergeTimelineService {
  static MAX_UPMID_COUNT = 20 // fillQueues 会对每一个 upMid 请求, 多了不适合

  upServices: FollowGroupUpService[] = []
  constructor(public upMids: UpMidType[]) {
    this.upServices = upMids.map((upMid) => new FollowGroupUpService(upMid))
  }

  get hasMore() {
    return this.upServices.some((s) => s.hasMore)
  }

  async loadMore(abortSignal?: AbortSignal): Promise<DynamicFeedItem[]> {
    if (!this.hasMore) return []

    // refill queues
    const refillQueues = async () => {
      const minimalQueueSize = 1 // we only slice the first one
      await pmap(this.upServices, (s) => s.fillQueue(minimalQueueSize, abortSignal), 5) // I don't know, maybe 3 will not trigger risk control
    }

    // pick from internal queues
    const pickedItems: DynamicFeedItem[] = []
    const expectSize = 10
    while (this.hasMore && pickedItems.length < expectSize) {
      await refillQueues()
      const restServices = this.upServices.filter((s) => s.hasMore)
      const pickedService = orderBy(
        restServices.map((service) => {
          const item = service.bufferQueue[0]
          const id = BigInt(item.id_str) // 假设 id_str 是有序的 ...
          return { service, item, id }
        }),
        ['id'],
        ['desc'],
      ).map((x) => x.service)[0]
      if (!pickedService) break

      const head = pickedService.bufferQueue[0]
      pickedService.bufferQueue = pickedService.bufferQueue.slice(1)
      pickedItems.push(head)
    }

    return pickedItems
  }
}
