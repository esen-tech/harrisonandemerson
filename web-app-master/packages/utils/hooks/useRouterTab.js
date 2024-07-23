import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useRouterTab = (defaultTab) => {
  const router = useRouter()
  const routerTab = router.query.tab || defaultTab

  useEffect(() => {
    setTab(routerTab)
  }, [routerTab])

  const setTab = (tab) => {
    router.replace({ query: { ...router.query, tab } })
  }

  return { tab: routerTab, setTab }
}
