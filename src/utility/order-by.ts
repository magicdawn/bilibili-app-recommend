import { sort } from 'fast-sort'

type OrderBy<T> = {
  column: keyof T | ((it: T) => any)
  order: 'asc' | 'desc' | ((a: any, b: any) => number)
}

export function fastOrderBy<T>(
  list: T[],
  columns: OrderBy<T>['column'][],
  orders: OrderBy<T>['order'][],
) {
  if (columns.length !== orders.length) {
    throw new Error('columns & orders length not match')
  }

  const _by = columns.map((column, index) => {
    const order = orders[index]
    if (order === 'asc') return { asc: column }
    else if (order === 'desc') return { desc: column }
    return {
      asc: column,
      comparer: order,
    }
  })

  return sort(list).by(_by)
}
