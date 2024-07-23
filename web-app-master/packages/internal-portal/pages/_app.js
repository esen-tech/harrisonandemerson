import { EnvEnum } from '@esen/utils/constants'
import { CareProductCollectionProvider } from '@esen/utils/hooks/useCareProductCollection'
import { CurrentOrganizationProvider } from '@esen/utils/hooks/useCurrentOrganization'
import { DeliveryOrderCollectionProvider } from '@esen/utils/hooks/useDeliveryOrderCollection'
import { EndUserCollectionProvider } from '@esen/utils/hooks/useEndUserCollection'
import { InternalUserProvider } from '@esen/utils/hooks/useInternalUser'
import { InternalUserCollectionProvider } from '@esen/utils/hooks/useInternalUserCollection'
import { ServiceProductCollectionProvider } from '@esen/utils/hooks/useServiceProductCollection'
import * as Sentry from '@sentry/nextjs'
import { appWithTranslation } from 'next-i18next'
import App from 'next/app'
import { SSRProvider } from 'react-bootstrap'
import '../styles/global.css'
import { harrisonApiAgent } from '../utils/apiAgent'
import { ENV, SENTRY_DSN } from '../utils/config'

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

const EsenApp = ({ Component, pageProps }) => {
  return (
    <SSRProvider>
      <InternalUserProvider apiAgent={harrisonApiAgent}>
        <CurrentOrganizationProvider apiAgent={harrisonApiAgent}>
          <InternalUserCollectionProvider apiAgent={harrisonApiAgent}>
            <EndUserCollectionProvider apiAgent={harrisonApiAgent}>
              <DeliveryOrderCollectionProvider apiAgent={harrisonApiAgent}>
                <ServiceProductCollectionProvider apiAgent={harrisonApiAgent}>
                  <CareProductCollectionProvider apiAgent={harrisonApiAgent}>
                    <Component {...pageProps} />
                  </CareProductCollectionProvider>
                </ServiceProductCollectionProvider>
              </DeliveryOrderCollectionProvider>
            </EndUserCollectionProvider>
          </InternalUserCollectionProvider>
        </CurrentOrganizationProvider>
      </InternalUserProvider>
    </SSRProvider>
  )
}

EsenApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
})

export default appWithTranslation(EsenApp)
