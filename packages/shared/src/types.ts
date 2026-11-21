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
    id: 'tier_micro',
    name: 'Micro-Test',
    price_usd: 5,
    price_inr: 425,
    cpm_usd: 20,
    estimated_impressions: 250,
  },
  {
    id: 'tier_starter',
    name: 'Starter',
    price_usd: 15,
    price_inr: 1275,
    cpm_usd: 20,
    estimated_impressions: 750,
  },
  {
    id: 'tier_growth',
    name: 'Growth',
    price_usd: 50,
    price_inr: 4250,
    cpm_usd: 20,
    estimated_impressions: 2500,
    popular: true,
  },
  {
    id: 'tier_scale',
    name: 'Scale',
    price_usd: 150,
    price_inr: 12750,
    cpm_usd: 20,
    estimated_impressions: 7500,
  },
];

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
