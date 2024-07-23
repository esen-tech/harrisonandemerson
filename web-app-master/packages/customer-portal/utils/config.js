import { EnvEnum } from '@esen/utils/constants'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const ENV = publicRuntimeConfig.env || EnvEnum.DEVELOPING

let HOST
let API_HOST
let ICD_API_HOST
let EMERSON_API_HOST
let IMAGE_TAG
let MIXPANEL_PROJECT_TOKEN
let ENABLE_TRACKING
const SENTRY_DSN =
  'https://ee2dfae4d86749c68d88f6a6c17a5e91@o1353934.ingest.sentry.io/6639783'

if (ENV === EnvEnum.DEVELOPING) {
  HOST = 'http://localhost:3000'
  API_HOST = 'http://localhost:8001'
  ICD_API_HOST = 'http://localhost:8002'
  EMERSON_API_HOST = 'http://localhost:8001'
  IMAGE_TAG = 'local'
  MIXPANEL_PROJECT_TOKEN = '93b5b031fd80c3f5cdd5b37e3a0e7ab0'
  ENABLE_TRACKING = false
} else if (ENV === EnvEnum.STAGING) {
  HOST = 'https://app.stg-cloud.esenmedical.com'
  API_HOST = 'https://customer-portal-api.stg-cloud.esenmedical.com'
  ICD_API_HOST = 'https://icd-api.stg-cloud.esenmedical.com'
  EMERSON_API_HOST = 'https://emerson-gateway.stg-cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
  MIXPANEL_PROJECT_TOKEN = '387aaaafd8949dd29b7e8c99365de77d'
  ENABLE_TRACKING = true
} else if (ENV === EnvEnum.PRODUCTION) {
  HOST = 'https://app.cloud.esenmedical.com'
  API_HOST = 'https://customer-portal-api.cloud.esenmedical.com'
  ICD_API_HOST = 'https://icd-api.cloud.esenmedical.com'
  EMERSON_API_HOST = 'https://emerson-gateway.cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
  MIXPANEL_PROJECT_TOKEN = '1b004fc3345d144eea20d882e1070191'
  ENABLE_TRACKING = true
}

export {
  ENV,
  HOST,
  API_HOST,
  ICD_API_HOST,
  EMERSON_API_HOST,
  IMAGE_TAG,
  MIXPANEL_PROJECT_TOKEN,
  ENABLE_TRACKING,
  SENTRY_DSN,
}
