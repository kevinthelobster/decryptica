/**
 * KPI Event Definitions for Decryptica
 * Defines all funnel events with deterministic identifiers for joins.
 */

export type IntentValue = 'learn' | 'calculate' | 'implement';

export type FunnelStage =
  | 'impression'
  | 'ranking'
  | 'organic_session'
  | 'signup'
  | 'activation'
  | 'paid_conversion'
  | 'net_new_mrr'
  | 'churn'
  | 'affiliate_click'
  | 'sponsorship_lead';

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

export interface AffiliateClickEvent extends BaseEvent {
  event: 'affiliate_click';
  /** Affiliate program identifier (e.g. "amazon-associates", "aesirx-affiliate") */
  affiliateId: string;
  /** Program name */
  program: string;
  /** Sub-partner ID within the program */
  partnerId?: string;
  /** Actual affiliate link clicked */
  targetUrl: string;
  /** Source article slug */
  articleSlug?: string;
  /** Content category */
  category?: string;
  /** User intent at click time */
  intent?: IntentValue;
  /** Position in list/grid */
  position?: number;
  /** UTM source */
  utmSource?: string;
  /** UTM medium */
  utmMedium?: string;
  /** UTM campaign */
  utmCampaign?: string;
}

export interface SponsorshipLeadEvent extends BaseEvent {
  event: 'sponsorship_lead';
  /** Lead type */
  leadType: 'demo_request' | 'audit_request' | 'consulting_inquiry' | 'partnership_inquiry';
  /** Email hash (privacy-safe) */
  emailHash?: string;
  /** Company name */
  company?: string;
  /** Contact name */
  name?: string;
  /** Message/inquiry text */
  message?: string;
  /** Source article or page */
  sourceContent?: string;
  /** Content category */
  category?: string;
  /** User intent */
  intent?: IntentValue;
  /** UTM source */
  utmSource?: string;
  /** UTM medium */
  utmMedium?: string;
  /** UTM campaign */
  utmCampaign?: string;
  /** Pipeline status */
  pipelineStatus: 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost';
}

export interface DailyRollupFields {
  date: string; // YYYY-MM-DD
  /** Total page views */
  pageViews: number;
  /** Total affiliate clicks */
  affiliateClicks: number;
  /** Total sponsorship leads */
  sponsorshipLeads: number;
  /** Signups */
  signups: number;
  /** Subscribers (email confirmed) */
  subscribers: number;
  /** AI category page views */
  aiImpressions: number;
  /** Crypto category page views */
  cryptoImpressions: number;
  /** Automation category page views */
  automationImpressions: number;
  /** Revenue (cents) — for affiliate payouts or ad revenue */
  revenueCents: number;
}

export type KpiEvent =
  | ImpressionEvent
  | RankingEvent
  | OrganicSessionEvent
  | SignupEvent
  | ActivationEvent
  | PaidConversionEvent
  | NetNewMrrEvent
  | ChurnEvent
  | AffiliateClickEvent
  | SponsorshipLeadEvent;
