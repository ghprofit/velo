export const VERIFF_MODULE_OPTIONS = 'VERIFF_MODULE_OPTIONS';

export const VERIFF_API_BASE_URL = 'https://stationapi.veriff.com';

export const VERIFF_ENDPOINTS = {
  SESSIONS: '/v1/sessions',
  DECISION: '/v1/sessions/:sessionId/decision',
  MEDIA: '/v1/sessions/:sessionId/media',
} as const;

export const VERIFICATION_STATUS = {
  CREATED: 'created',
  STARTED: 'started',
  SUBMITTED: 'submitted',
  RESUBMITTED: 'resubmitted',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ABANDONED: 'abandoned',
  EXPIRED: 'expired',
} as const;

export const VERIFICATION_CODE = {
  APPROVED: 9001,
  RESUBMISSION_REQUESTED: 9102,
  DECLINED: 9103,
  EXPIRED: 9104,
  ABANDONED: 9105,
} as const;
