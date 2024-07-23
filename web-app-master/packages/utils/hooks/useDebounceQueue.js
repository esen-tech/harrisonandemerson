import debounce from 'lodash/debounce'

export const useDebounceQueue = (fn, wait) => {
  let pendingItems = []
  const deboundedFlush = debounce(async () => {
    await fn(pendingItems)
    pendingItems = []
  }, wait)
  const enqueue = (item) => {
    pendingItems = [...pendingItems, item]
    deboundedFlush()
  }
  return { enqueue }
}
