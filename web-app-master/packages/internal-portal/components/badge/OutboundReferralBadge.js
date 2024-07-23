import Badge from 'react-bootstrap/Badge'
import { REFERRAL_REFERRER_STATE, REFERRAL_PROVIDER_STATE } from '../../constants/state'


const OutboundReferralBadge = ({ referrer_state, provider_state }) => {
  const props_map = {
    [`${REFERRAL_REFERRER_STATE.SUBMITTED},${REFERRAL_PROVIDER_STATE.INCOMING}`]: {
      bg: 'light',
      text: 'dark',
      children: '轉診送出',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSING},${REFERRAL_PROVIDER_STATE.ACCEPTED}`]: {
      bg: 'success',
      children: '轉診受理',
    },
    [`${REFERRAL_REFERRER_STATE.IDLE},${REFERRAL_PROVIDER_STATE.INCOMING}`]: {
      bg: 'warning',
      children: '即將逾期',
    },
    [`${REFERRAL_REFERRER_STATE.EXPIRED},${REFERRAL_PROVIDER_STATE.EXPIRED}`]: {
      bg: 'light',
      text: 'dark',
      children: '轉診逾期',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.REJECTED}`]: {
      bg: 'danger',
      children: '轉診拒絕',
    },
    [`${REFERRAL_REFERRER_STATE.REVOKED},${REFERRAL_PROVIDER_STATE.CLOSED}`]: {
      bg: 'light',
      text: 'dark',
      children: '轉診取消',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.REVERTED}`]: {
      bg: 'danger',
      children: '轉診中斷',
    },
    [`${REFERRAL_REFERRER_STATE.PROCESSED},${REFERRAL_PROVIDER_STATE.COMPLETED}`]: {
      bg: 'success',
      children: '轉診完成',
    },
  }
  const props = props_map[`${referrer_state},${provider_state}`]
  return (
    <Badge pill className="m-1" {...props} />
  )
}

export default OutboundReferralBadge
