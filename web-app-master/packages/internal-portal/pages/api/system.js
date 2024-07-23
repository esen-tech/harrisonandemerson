import { API_HOST, ENV, HOST, IMAGE_TAG } from '../../utils/config'

export default function handler(req, res) {
  res.status(200).json({ HOST, API_HOST, ENV, IMAGE_TAG: IMAGE_TAG || 'local' })
}
