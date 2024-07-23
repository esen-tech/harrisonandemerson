import APIAgent from '@esen/utils/classes/APIAgent'
import { API_HOST, HARRISON_API_HOST, ICD_API_HOST } from './config'

const apiAgent = new APIAgent(API_HOST)

export const icdApiAgent = new APIAgent(ICD_API_HOST)
export const harrisonApiAgent = new APIAgent(HARRISON_API_HOST)

export default apiAgent
