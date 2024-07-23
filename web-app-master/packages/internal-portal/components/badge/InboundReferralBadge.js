import Badge from 'react-bootstrap/Badge'
import { REFERRAL_REFERRER_STATE, REFERRAL_PROVIDER_STATE } from '../../constants/state'


const InboundReferralBadge = ({ referrer_state, provider_state }) => {
  const props_map = {
    [`${REFERRAL_REFERRER_STATE.SUBMITTED},${REFERRAL_PROVIDER_STATE.INCOMING}`]: {
      bg: 'warning',
      children: '轉診送入',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSING},${REFERRAL_PROVIDER_STATE.ACCEPTED}`]: {
      bg: 'success',
      children: '轉診受理',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.REJECTED}`]: {
      bg: 'danger',
      children: '轉診拒絕',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.COMPLETED}`]: {
      bg: 'success',
      children: '轉診完成',
    },
    [`${REFERRAL_REFERRER_STATE.EXPIRED},${REFERRAL_PROVIDER_STATE.EXPIRED}`]: {
      bg: 'light',
      text: 'dark',
      children: '轉診逾期',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.REVERTED}`]: {
      bg: 'danger',
      children: '轉診中斷',
    },
  }
  const props = props_map[`${referrer_state},${provider_state}`]
  return (
    <Badge pill className="m-1" {...props} />
  )
}

export default InboundReferralBadge
