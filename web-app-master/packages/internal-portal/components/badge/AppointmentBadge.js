import Badge from '@esen/components/Badge'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'

const AppointmentBadge = ({ state, ...rest }) => {
  const props_map = {
    [APPOINTMENT_STATE.SCHEDULED]: {
      variant: 'info',
      children: '就診預約',
    },
    [APPOINTMENT_STATE.COMPLETED]: {
      variant: 'success',
      children: '就診完成',
    },
    [APPOINTMENT_STATE.CANCELLED]: {
      variant: 'light',
      children: '取消預約',
    },
    [APPOINTMENT_STATE.ABSENT]: {
      variant: 'danger',
      children: '無故缺席',
    },
  }

  const props = props_map[state]

  return <Badge pill {...props} {...rest} />
}

export default AppointmentBadge
