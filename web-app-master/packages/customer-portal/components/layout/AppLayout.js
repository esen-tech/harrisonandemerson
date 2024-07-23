import ThemeProvider from '@esen/essence/theme/ThemeProvider'
import useTrack from '@esen/utils/hooks/useTrack'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const AppLayout = ({ children }) => {
  const router = useRouter()
  const [track] = useTrack()

  useEffect(() => {
    const handleRouteChange = (url) => {
      track('route-change-complete', { pathname: router.pathname, url })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>ĒSEN</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <ThemeProvider theme="light" />
      {children}
    </>
  )
}

export default AppLayout
