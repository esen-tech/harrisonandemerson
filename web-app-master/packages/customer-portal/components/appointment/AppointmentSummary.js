import ListItem from '@esen/essence/components/ListItem'
import {
  get_full_name,
  get_local_datetime,
  get_organization_name,
} from '@esen/utils/fn'
import { useInternalUserCollection } from '@esen/utils/hooks/useInternalUserCollection'
import { useOrganizationCollection } from '@esen/utils/hooks/useOrganizationCollection'
import { useServiceProductCollection } from '@esen/utils/hooks/useServiceProductCollection'
import { useEffect } from 'react'
import AppointmentBadge from '../badge/AppointmentBadge'

const AppointmentSummary = ({ appointment, ...rest }) => {
  const organizationCollection = useOrganizationCollection()
  const internalUserCollection = useInternalUserCollection()
  const serviceProductCollection = useServiceProductCollection()

  useEffect(() => {
    if (appointment) {
      internalUserCollection.addReference(
        appointment.internal_user_appointment_time_slots[0]
          .internal_user_reference
      )
      organizationCollection.addReference(appointment.organization_reference)
      serviceProductCollection.addReference(
        appointment.service_product_reference
      )
    }
  }, [appointment])

  const organization =
    organizationCollection.map?.[appointment?.organization_reference]
  const internalUser =
    internalUserCollection.map?.[
      appointment?.internal_user_appointment_time_slots?.[0]
        ?.internal_user_reference
    ]
  const serviceProduct =
    serviceProductCollection.map?.[appointment?.service_product_reference]

  return (
    <ListItem controlScope="all" {...rest}>
      <ListItem.Media
        image={{
          src: internalUser?.avatar_src,
        }}
      />
      <ListItem.Content
        title={serviceProduct?.display_sku_key || '(未知服務)'}
        paragraph={`${get_full_name(internalUser)}｜${get_organization_name(
          organization
        )}`}
        metadata={[
          `${get_local_datetime(
            appointment.evaluated_time_slot.start_time,
            'yyyy-MM-dd｜HH:mm'
          )} (${serviceProduct?.duration_in_time_slots * 5 || 'N/A'} mins)`,
        ]}
      />
      <ListItem.Control
        badgeComponent={
          <AppointmentBadge state={appointment.state} className="ms-auto" />
        }
      />
    </ListItem>
  )
}

export default AppointmentSummary
