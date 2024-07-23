import { EnvEnum } from '@esen/utils/constants'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const ENV = publicRuntimeConfig.env || EnvEnum.DEVELOPING

let HOST
let IMAGE_TAG

if (ENV === EnvEnum.DEVELOPING) {
  HOST = 'http://localhost:3000'
  API_HOST = 'http://localhost:8000'
  IMAGE_TAG = 'local'
} else if (ENV === EnvEnum.STAGING) {
  HOST = 'https://webflow-hack.cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
} else if (ENV === EnvEnum.PRODUCTION) {
  HOST = 'https://webflow-hack.stg-cloud.esenmedical.com'
  IMAGE_TAG = process.env.NEXT_PUBLIC_IMAGE_TAG
}

export { ENV, HOST, IMAGE_TAG }
