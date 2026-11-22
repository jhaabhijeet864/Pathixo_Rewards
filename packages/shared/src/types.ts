export type SupportedPlatform =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'perplexity'
  | 'deepseek';

export interface AdCreative {
  id: string;
  headline: string;
  sponsor_name: string;
  url: string;
  icon_url?: string;
  badge?: string;
  is_house_ad?: boolean;
  target_cpm?: number;
  ad_token: string;
}

export interface ImpressionEvent {
  event_id: string;
  ad_id: string;
  ad_token: string;
  device_id: string;
  timestamp: number;
  dwell_ms: number;
  ai_platform: SupportedPlatform;
  earned_usd?: number;
  user_email?: string;
}

export interface PromptCallbacks {
  onSubmit: () => void;
  onAnchorReady: (anchor: HTMLElement) => void;
  onReanchor?: (anchor: HTMLElement) => void;
  onDone: () => void;
}

export interface PromptAdapter {
  host: string;
  start: (cb: PromptCallbacks) => void;
  stop: () => void;
  hostAdVisible: () => boolean;
}

export interface DomainSelectors {
  composer: string;
  send_button: string;
  stop_button?: string;
  user_bubble: string;
  turn_anchor?: string;
}

export interface RemoteSelectorConfig {
  version: string;
  updated_at: string;
  domains: Record<string, DomainSelectors>;
}

export interface UserEarnings {
  balance_usd: number;
  lifetime_earned_usd: number;
  lifetime_cashouts_usd?: number;
  impressions_today: number;
  referral_count: number;
  referral_bonus_usd: number;
}

export interface CashoutRequest {
  id: string;
  device_id: string;
  user_email?: string;
  amount_usd: number;
  payout_method: 'upi' | 'paypal' | 'gift_card';
  payout_destination: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
}

export type Currency = 'USD' | 'INR';

export const DEFAULT_USD_INR_RATE = 85.0;

export interface PricingTier {
  id: string;
  name: string;
  price_usd: number;
  price_inr: number;
  cpm_usd: number;
  estimated_impressions: number;
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier_starter',
    name: 'Starter Test',
    price_usd: 2,
    price_inr: 170,
    cpm_usd: 2.0,
    estimated_impressions: 1000,
  },
  {
    id: 'tier_growth',
    name: 'Growth Pack',
    price_usd: 5,
    price_inr: 425,
    cpm_usd: 2.5,
    estimated_impressions: 2000,
    popular: true,
  },
  {
    id: 'tier_pro',
    name: 'Pro Priority',
    price_usd: 15,
    price_inr: 1275,
    cpm_usd: 3.0,
    estimated_impressions: 5000,
  },
  {
    id: 'tier_scale',
    name: 'Scale Domination',
    price_usd: 50,
    price_inr: 4250,
    cpm_usd: 3.33,
    estimated_impressions: 15000,
  },
];

/**
 * Calculates variable dynamic user earnings per verified prompt based on the ad's CPM bid.
 * 60% user revenue share with optional natural variance (±5%).
 */
export function calculateDynamicUserReward(cpmRateUsd: number = 2.0, applyJitter = false): number {
  const baseGrossPerView = cpmRateUsd / 1000;
  const userShare = baseGrossPerView * 0.60;
  if (!applyJitter) {
    return Number(userShare.toFixed(5));
  }
  const jitterFactor = 1 + (Math.random() * 0.10 - 0.05); // ±5% variance
  return Number((userShare * jitterFactor).toFixed(5));
}

export interface CampaignMetrics {
  total_impressions: number;
  total_clicks: number;
  spent_usd: number;
  avg_dwell_ms: number;
  platform_impressions: Record<SupportedPlatform, number>;
}

export interface AdCampaign {
  id: string;
  advertiser_email: string;
  headline: string;
  sponsor_name: string;
  target_url: string;
  icon_url?: string;
  badge?: string;
  currency?: Currency;
  cpm_rate_usd: number;
  budget_total_usd: number;
  budget_remaining_usd: number;
  target_platforms: SupportedPlatform[];
  target_countries?: string[];
  status: 'active' | 'paused' | 'exhausted' | 'pending_review';
  created_at: string;
  metrics?: CampaignMetrics;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime_seconds: number;
  version: string;
  environment: string;
  services: {
    selectors: ServiceHealth;
    ad_inventory: ServiceHealth;
    payout_engine: ServiceHealth;
    anti_fraud: ServiceHealth;
  };
  system?: {
    node_version: string;
    platform: string;
    memory_mb: {
      rss: number;
      heap_used: number;
      heap_total: number;
    };
  };
}

export type AdminRole = 'superadmin' | 'moderator' | 'finance_viewer';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export type CircuitBreakerKey =
  | 'PAUSE_PAID_ADS'
  | 'EXTENSION_MAINTENANCE'
  | 'FREEZE_PAYOUTS';

export interface CircuitBreakerState {
  breaker_key: CircuitBreakerKey;
  is_tripped: boolean;
  tripped_by?: string;
  tripped_at?: string;
  reason?: string;
}

export interface AIPlatformMetricDetail {
  impressions: number;
  avg_dwell_ms: number;
  share_percentage: number;
}

export type AIPlatformDistribution = Record<SupportedPlatform, AIPlatformMetricDetail>;

export interface AdminMetrics {
  total_inflow_usd: number;
  user_liability_usd: number;
  platform_profit_usd: number;
  referral_pool_usd: number;
  active_campaigns_count: number;
  live_extensions_today: number;
  cws_installs: number;
  registered_users_count: number;
  logins_today: number;
  platform_distribution: AIPlatformDistribution;
  circuit_breakers: Record<CircuitBreakerKey, boolean>;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  full_name?: string;
  device_ids: string[];
  balance_usd: number;
  lifetime_earned_usd: number;
  impressions_count: number;
  referral_code: string;
  referred_by_code?: string;
  referral_count: number;
  is_banned: boolean;
  fraud_risk_score?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface PayoutSettlementRequest {
  payout_id: string;
  transaction_reference: string;
  admin_email: string;
}

export interface UserBalanceAdjustment {
  id: string;
  user_id: string;
  admin_email: string;
  adjustment_usd: number;
  reason: string;
  created_at: string;
}

export interface AdminAuditLogEntry {
  id: string;
  admin_email: string;
  action_type: string;
  target_entity: 'user' | 'device' | 'campaign' | 'payout' | 'circuit_breaker' | 'cws_telemetry';
  target_id: string;
  previous_state?: unknown;
  new_state?: unknown;
  justification_note?: string;
  created_at: string;
}
