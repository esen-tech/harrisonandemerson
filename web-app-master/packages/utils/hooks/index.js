import { useEffect, useState } from 'react'

export const useCountdown = (total_seconds) => {
  const [elapsed_seconds, set_elapsed_seconds] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      set_elapsed_seconds((v) => v + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [total_seconds])

  const remaining_seconds = total_seconds - elapsed_seconds
  const reset = () => {
    set_elapsed_seconds(0)
  }

  return [remaining_seconds, reset]
}

export const usePaginator = () => {
  const [activePage, setActivePage] = useState()
  const [activePageToken, setActivePageToken] = useState()
  const [previousPages, setPreviousPages] = useState([])

  const isPrevDisabled = (fn) => {
    const defaultIsPrevDisabled = previousPages.length === 0
    if (fn) {
      return fn(defaultIsPrevDisabled, previousPages)
    } else {
      return defaultIsPrevDisabled
    }
  }

  const isNextDisabled = (fn) => {
    const defaultIsNextDisabled = !activePage?.next_page_token
    if (fn) {
      return fn(defaultIsNextDisabled, previousPages)
    } else {
      return defaultIsNextDisabled
    }
  }

  const goPrev = () => {
    const newPreviousPages = previousPages.slice(0, -1)
    setPreviousPages((previousPages) => [...previousPages.slice(0, -1)])
    setActivePageToken(
      newPreviousPages?.[newPreviousPages.length - 1]?.next_page_token
    )
  }

  const goNext = () => {
    setPreviousPages((previousPages) => [...previousPages, activePage])
    setActivePageToken(activePage.next_page_token)
  }

  const reset = () => {
    setActivePage()
    setActivePageToken()
    setPreviousPages([])
  }

  return {
    activePage,
    activePageToken,
    isPrevDisabled,
    isNextDisabled,
    setActivePage,
    goPrev,
    goNext,
    reset,
  }
}
