import { useCallback, useEffect, useRef } from 'react'

export const useInfiniteScroll = (onTargetIntersect) => {
  const targetRef = useRef()

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0]
      if (target.isIntersecting) {
        onTargetIntersect()
      }
    },
    [onTargetIntersect]
  )

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (targetRef.current) {
      observer.observe(targetRef.current)
    }
  }, [handleObserver])

  return { targetRef }
}
