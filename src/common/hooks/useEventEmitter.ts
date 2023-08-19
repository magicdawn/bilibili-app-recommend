/* eslint-disable @typescript-eslint/no-this-alias */

import { useEffect, useRef } from 'react'

type Subscription<T> = (val: T) => void

export class EventEmitter<T> {
  private subscriptions = new Set<Subscription<T>>()

  emit = (val: T) => {
    for (const subscription of this.subscriptions) {
      subscription(val)
    }
  }

  useSubscription = (callback: Subscription<T>) => {
    const emitter = this

    const callbackRef = useRef<Subscription<T>>()
    callbackRef.current = callback
    useEffect(() => {
      function subscription(val: T) {
        if (callbackRef.current) {
          callbackRef.current(val)
        }
      }

      console.log('useSubscription: re-add')
      emitter.subscriptions.add(subscription)

      return () => {
        emitter.subscriptions.delete(subscription)
      }
    }, [emitter]) // ADD: emitter as dep
  }
}

export default function useEventEmitter<T = void>() {
  const ref = useRef<EventEmitter<T>>()
  if (!ref.current) {
    ref.current = new EventEmitter()
  }
  return ref.current
}
