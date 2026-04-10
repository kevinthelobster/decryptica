/**
 * KPI Event Definitions for Decryptica
 * Defines all funnel events with deterministic identifiers for joins.
 */

export type FunnelStage =
  | 'impression'
  | 'ranking'
  | 'organic_session'
  | 'signup'
  | 'activation'
  | 'paid_conversion'
  | 'net_new_mrr'
  | 'churn';

export interface BaseEvent {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Unique session identifier — consistent across page views */
  sessionId: string;
  /** Anonymous user ID (localStorage, resets on new browser session) */
  anonymousId: string;
  /** Deterministic event type — used for funnel joins */
  event: FunnelStage;
  /** Event version for schema evolution */
  version: '1.0';
}

export interface ImpressionEvent extends BaseEvent {
  event: 'impression';
  /** Which article/category/tool was displayed */
  impressionType: 'article' | 'category' | 'tool' | 'homepage';
  slug?: string;
  category?: string;
  /** Search query that led to impression (if applicable) */
  searchQuery?: string;
  /** UTM source */
  utmSource?: string;
  /** UTM medium */
  utmMedium?: string;
  /** UTM campaign */
  utmCampaign?: string;
}

export interface RankingEvent extends BaseEvent {
  event: 'ranking';
  /** Target keyword tracked */
  keyword: string;
  /** URL being tracked */
  url: string;
  /** Search engine that reported the ranking */
  searchEngine: 'google' | 'bing' | 'duckduckgo' | 'other';
  /** Position in SERP (1 = first result) */
  position: number;
  /** Previous position (negative = new entry) */
  previousPosition?: number;
  /** Search volume estimate (monthly) */
  searchVolume?: number;
}

export interface OrganicSessionEvent extends BaseEvent {
  event: 'organic_session';
  /** Source channel */
  source: string;
  /** Medium (organic, referral, social) */
  medium: string;
  /** Landing page */
  landingPage: string;
  /** Number of pages viewed in session */
  pageViews: number;
  /** Session duration in seconds */
  durationSeconds: number;
  /** Whether session bounced (single page) */
  isBounce: boolean;
  /** Device type */
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface SignupEvent extends BaseEvent {
  event: 'signup';
  /** Email (hashed for privacy) */
  emailHash: string;
  /** Signup method */
  method: 'email_form' | 'oauth' | 'api';
  /** UTM data captured at impression */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface ActivationEvent extends BaseEvent {
  event: 'activation';
  /** User ID (from signup) */
  userId: string;
  /** Action taken to activate */
  activationType: 'first_login' | 'first_action' | 'email_confirmed';
  /** Feature accessed */
  featureSlug?: string;
}

export interface PaidConversionEvent extends BaseEvent {
  event: 'paid_conversion';
  /** User ID */
  userId: string;
  /** Subscription tier */
  tier: 'monthly' | 'annual' | 'one-time';
  /** Amount in cents */
  amountCents: number;
  /** Currency */
  currency: 'USD';
  /** Payment provider */
  provider: 'stripe' | 'paypal' | 'other';
  /** Coupon code used (if any) */
  couponCode?: string;
}

export interface NetNewMrrEvent extends BaseEvent {
  event: 'net_new_mrr';
  /** MRR in cents */
  mrrCents: number;
  /** MRR source */
  source: 'new_mrr' | 'expansion_mrr' | 'reactivation_mrr';
  /** User ID */
  userId: string;
  /** Cohort for cohort analysis */
  cohortMonth: string; // YYYY-MM
}

export interface ChurnEvent extends BaseEvent {
  event: 'churn';
  /** User ID */
  userId: string;
  /** MRR lost in cents */
  mrrLostCents: number;
  /** Churn reason (self-reported or inferred) */
  reason: 'voluntary' | 'involuntary' | 'payment_failed' | 'unknown';
  /** Subscription tier at time of churn */
  tier: 'monthly' | 'annual';
  /** Tenure in months before churn */
  tenureMonths: number;
}

export type KpiEvent =
  | ImpressionEvent
  | RankingEvent
  | OrganicSessionEvent
  | SignupEvent
  | ActivationEvent
  | PaidConversionEvent
  | NetNewMrrEvent
  | ChurnEvent;
