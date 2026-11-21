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

export interface AdCampaign {
  id: string;
  advertiser_email: string;
  headline: string;
  sponsor_name: string;
  target_url: string;
  icon_url?: string;
  cpm_rate_usd: number;
  budget_total_usd: number;
  budget_remaining_usd: number;
  target_platforms: SupportedPlatform[];
  target_countries?: string[];
  status: 'active' | 'paused' | 'exhausted';
  created_at: string;
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
