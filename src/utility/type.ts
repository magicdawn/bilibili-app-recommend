export type ArrayItem<T extends any[]> = T extends Array<infer Inner> ? Inner : never
