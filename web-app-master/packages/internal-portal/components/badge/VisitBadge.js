import Badge from 'react-bootstrap/Badge'
import { VISIT_STATE } from '../../constants/state'


export const propsMap = {
  [VISIT_STATE.PLANNED]: {
    bg: 'light',
    text: 'dark',
    children: '已建立',
  },
  [VISIT_STATE.ARRIVED]: {
    bg: 'warning',
    children: '已到診',
  },
  [VISIT_STATE.IN_PROGRESS]: {
    bg: 'success',
    children: '看診中',
  },
  [VISIT_STATE.POST_SESSION]: {
    bg: 'warning',
    children: '診後衛教',
  },
  [VISIT_STATE.FINISHED]: {
    bg: 'light',
    text: 'dark',
    children: '看診結束',
  },
}

const VisitBadge = ({ state, ...rest }) => {
  const props = propsMap[state]
  return (
    <Badge pill className="m-1" {...props} {...rest} />
  )
}

export default VisitBadge
