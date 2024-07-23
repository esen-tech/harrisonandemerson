export const REFERRAL_REFERRER_STATE = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
  // frontend only states
  IDLE: 'idle',
}

export const REFERRAL_PROVIDER_STATE = {
  DRAFT: 'draft',
  INCOMING: 'incoming',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  REVERTED: 'reverted',
  CLOSED: 'closed',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
}

export const VISIT_STATE = {
  PLANNED: 'planned',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  POST_SESSION: 'post_session',
  FINISHED: 'finished',
}
