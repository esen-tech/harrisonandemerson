import { appWithTranslation } from 'next-i18next'
import App from 'next/app'
import '../styles/global.css'

const EsenApp = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

EsenApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
})

export default appWithTranslation(EsenApp)
