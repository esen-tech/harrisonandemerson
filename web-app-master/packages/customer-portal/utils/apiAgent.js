import APIAgent from '@esen/utils/classes/APIAgent'
import { API_HOST, EMERSON_API_HOST, ICD_API_HOST } from './config'

const apiAgent = new APIAgent(API_HOST)

export const icdApiAgent = new APIAgent(ICD_API_HOST)
export const emersonApiAgent = new APIAgent(EMERSON_API_HOST)

export default apiAgent
