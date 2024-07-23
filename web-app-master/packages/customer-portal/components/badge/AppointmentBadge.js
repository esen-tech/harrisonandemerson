import Badge from '@esen/essence/components/Badge'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'

const AppointmentBadge = ({ state, ...rest }) => {
  const props_map = {
    [APPOINTMENT_STATE.SCHEDULED]: {
      variant: 'info',
      children: '已預約',
    },
    [APPOINTMENT_STATE.COMPLETED]: {
      variant: 'positive',
      children: '就診完成',
    },
    [APPOINTMENT_STATE.CANCELLED]: {
      variant: 'secondary',
      children: '取消預約',
    },
    [APPOINTMENT_STATE.ABSENT]: {
      variant: 'negative',
      children: '無故缺席',
    },
  }

  const props = props_map[state]

  return <Badge {...props} {...rest} />
}

export default AppointmentBadge
