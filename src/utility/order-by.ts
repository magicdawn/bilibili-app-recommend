import { sort } from 'fast-sort'

type OrderBy<T> = {
  prop: keyof T | ((it: T) => any)
  order: 'asc' | 'desc' | ((a: any, b: any) => number)
}

/**
 * just like lodash.orderBy API spec
 */

export function fastOrderBy<T>(
  list: T[],
  props: OrderBy<T>['prop'][],
  orders: OrderBy<T>['order'][],
) {
  if (props.length !== orders.length) {
    throw new Error('props & orders length not match')
  }

  const _by = props.map((prop, index) => {
    const order = orders[index]
    if (order === 'asc') return { asc: prop }
    else if (order === 'desc') return { desc: prop }
    return {
      asc: prop,
      comparer: order,
    }
  })

  return sort(list).by(_by)
}

export function fastSortWithOrders<T>(list: T[], orders: OrderBy<T>[]) {
  const _by = orders.map(({ order, prop }) => {
    if (order === 'asc') return { asc: prop }
    else if (order === 'desc') return { desc: prop }
    return { asc: prop, comparer: order }
  })
  return sort(list).by(_by)
}
