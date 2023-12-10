export {}

declare module 'valtio' {
  function useSnapshot<T extends object>(p: T): T
}
