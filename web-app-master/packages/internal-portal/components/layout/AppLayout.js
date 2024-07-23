import ThemeProvider from '@esen/essence/theme/ThemeProvider'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'

const AppLayout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Harrison</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <ThemeProvider theme="light" />
      {children}
    </>
  )
}

export default AppLayout
