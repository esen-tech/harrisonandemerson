import { EnvEnum } from '@esen/utils/constants'
import { EndUserProvider } from '@esen/utils/hooks/useEndUser'
import { InternalUserCollectionProvider } from '@esen/utils/hooks/useInternalUserCollection'
import { OrganizationCollectionProvider } from '@esen/utils/hooks/useOrganizationCollection'
import { ServiceProductCollectionProvider } from '@esen/utils/hooks/useServiceProductCollection'
import { TrackProvider } from '@esen/utils/hooks/useTrack'
import * as Sentry from '@sentry/nextjs'
import mixpanel from 'mixpanel-browser'
import { appWithTranslation } from 'next-i18next'
import App from 'next/app'

import { SSRProvider } from 'react-bootstrap'
import '../styles/global.css'
import { emersonApiAgent } from '../utils/apiAgent'
import {
  ENABLE_TRACKING,
  ENV,
  MIXPANEL_PROJECT_TOKEN,
  SENTRY_DSN,
} from '../utils/config'

if ([EnvEnum.STAGING, EnvEnum.PRODUCTION].includes(ENV)) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.0,
  })
}

if (ENABLE_TRACKING) {
  mixpanel.init(MIXPANEL_PROJECT_TOKEN, { debug: ENV === EnvEnum.DEVELOPING })
}

const EsenApp = ({ Component, pageProps }) => {
  return (
    <SSRProvider>
      <TrackProvider enabled={ENABLE_TRACKING}>
        <EndUserProvider apiAgent={emersonApiAgent}>
          <OrganizationCollectionProvider apiAgent={emersonApiAgent}>
            <InternalUserCollectionProvider apiAgent={emersonApiAgent}>
              <ServiceProductCollectionProvider apiAgent={emersonApiAgent}>
                <Component {...pageProps} />
              </ServiceProductCollectionProvider>
            </InternalUserCollectionProvider>
          </OrganizationCollectionProvider>
        </EndUserProvider>
      </TrackProvider>
    </SSRProvider>
  )
}

EsenApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
})

export default appWithTranslation(EsenApp)
