import { EnvEnum } from '@esen/utils/constants'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const ENV = publicRuntimeConfig.env || EnvEnum.DEVELOPING

let HOST
let API_HOST
let ICD_API_HOST
let HARRISON_API_HOST
let IMAGE_TAG
const SENTRY_DSN =
  'https://2b696131b16345cb97e9757b5fd8a166@o1353934.ingest.sentry.io/6639781'

if (ENV === EnvEnum.DEVELOPING) {
  HOST = 'http://localhost:3000'
  API_HOST = 'http://localhost:8000'
  ICD_API_HOST = 'http://localhost:8002'
  HARRISON_API_HOST = 'http://localhost:8000'
  IMAGE_TAG = 'local'
} else if (ENV === EnvEnum.STAGING) {
  HOST = 'https://harrison.stg-cloud.esenmedical.com'
  API_HOST = 'https://internal-portal-api.stg-cloud.esenmedical.com'
  ICD_API_HOST = 'https://icd-api.stg-cloud.esenmedical.com'
  HARRISON_API_HOST = 'https://harrison-gateway.stg-cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
} else if (ENV === EnvEnum.PRODUCTION) {
  HOST = 'https://harrison.cloud.esenmedical.com'
  API_HOST = 'https://internal-portal-api.cloud.esenmedical.com'
  ICD_API_HOST = 'https://icd-api.cloud.esenmedical.com'
  HARRISON_API_HOST = 'https://harrison-gateway.cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
}

export {
  ENV,
  HOST,
  API_HOST,
  ICD_API_HOST,
  HARRISON_API_HOST,
  IMAGE_TAG,
  SENTRY_DSN,
}
