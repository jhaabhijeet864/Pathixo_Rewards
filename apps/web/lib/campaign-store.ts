import type { AdCampaign, AdCreative, SupportedPlatform, Currency } from '@pathixo/shared';

export interface CampaignStoreItem extends AdCampaign {
  ad_token: string;
}

// Default live startup house ads (displayed until external advertisers sponsor wait-time slots)
const initialCampaigns: CampaignStoreItem[] = [
  {
    id: 'cmp_house_vakxo',
    advertiser_email: 'founder@pathixo.com',
    headline: 'Run AI Agents Locally: 0 API Cost',
    sponsor_name: 'Vakxo',
    target_url: 'https://vakxo.pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    currency: 'USD',
    cpm_rate_usd: 25.0,
    budget_total_usd: 500.0,
    budget_remaining_usd: 500.0,
    target_platforms: ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
    status: 'active',
    created_at: new Date().toISOString(),
    ad_token: 'tok_house_vakxo_001',
    metrics: {
      total_impressions: 0,
      total_clicks: 0,
      spent_usd: 0,
      avg_dwell_ms: 0,
      platform_impressions: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, deepseek: 0 },
    },
  },
  {
    id: 'cmp_house_pathixo',
    advertiser_email: 'founder@pathixo.com',
    headline: 'Pathixo AI Labs: Builds AI Native Apps',
    sponsor_name: 'Pathixo',
    target_url: 'https://pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    currency: 'USD',
    cpm_rate_usd: 22.0,
    budget_total_usd: 500.0,
    budget_remaining_usd: 500.0,
    target_platforms: ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
    status: 'active',
    created_at: new Date().toISOString(),
    ad_token: 'tok_house_pathixo_002',
    metrics: {
      total_impressions: 0,
      total_clicks: 0,
      spent_usd: 0,
      avg_dwell_ms: 0,
      platform_impressions: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, deepseek: 0 },
    },
  },
  {
    id: 'cmp_house_krocpdf',
    advertiser_email: 'founder@pathixo.com',
    headline: 'Create PDFs and Other Docs: 100% Locally, Anti-ilovePDF',
    sponsor_name: 'KrocPDF',
    target_url: 'https://jpg-to-pdf-zeta.vercel.app/',
    icon_url: '/house-ads/krocpdf-icon.png',
    badge: '100% Local',
    currency: 'USD',
    cpm_rate_usd: 20.0,
    budget_total_usd: 300.0,
    budget_remaining_usd: 300.0,
    target_platforms: ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
    status: 'active',
    created_at: new Date().toISOString(),
    ad_token: 'tok_house_krocpdf_003',
    metrics: {
      total_impressions: 0,
      total_clicks: 0,
      spent_usd: 0,
      avg_dwell_ms: 0,
      platform_impressions: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, deepseek: 0 },
    },
  },
  {
    id: 'cmp_house_blip',
    advertiser_email: 'founder@pathixo.com',
    headline: 'Vanish From Meeting with just a snap',
    sponsor_name: 'Blip',
    target_url: 'https://blip-hnu8.vercel.app/',
    icon_url: '/house-ads/blip-icon.png',
    badge: 'Chrome Extension',
    currency: 'USD',
    cpm_rate_usd: 20.0,
    budget_total_usd: 300.0,
    budget_remaining_usd: 300.0,
    target_platforms: ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
    status: 'active',
    created_at: new Date().toISOString(),
    ad_token: 'tok_house_blip_004',
    metrics: {
      total_impressions: 0,
      total_clicks: 0,
      spent_usd: 0,
      avg_dwell_ms: 0,
      platform_impressions: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, deepseek: 0 },
    },
  },
];

class CampaignStore {
  private campaigns: Map<string, CampaignStoreItem> = new Map();

  constructor() {
    this.seed();
  }

  public seed() {
    this.campaigns.clear();
    for (const cmp of initialCampaigns) {
      this.campaigns.set(cmp.id, JSON.parse(JSON.stringify(cmp)));
    }
  }

  public createCampaign(data: {
    advertiser_email: string;
    headline: string;
    sponsor_name: string;
    target_url: string;
    icon_url?: string;
    badge?: string;
    currency?: Currency;
    cpm_rate_usd?: number;
    budget_usd?: number;
    target_platforms?: SupportedPlatform[];
    status?: AdCampaign['status'];
  }): CampaignStoreItem {
    const id = `cmp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const adToken = `tok_${id}_${Date.now().toString(36)}`;
    const cpm = Number(data.cpm_rate_usd) || 2.50;
    const budget = Number(data.budget_usd) || 5.0;

    const newCampaign: CampaignStoreItem = {
      id,
      advertiser_email: data.advertiser_email,
      headline: data.headline,
      sponsor_name: data.sponsor_name,
      target_url: data.target_url,
      icon_url: data.icon_url,
      badge: data.badge || 'Sponsored',
      currency: data.currency || 'USD',
      cpm_rate_usd: cpm,
      budget_total_usd: budget,
      budget_remaining_usd: budget,
      target_platforms: data.target_platforms || ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      ad_token: adToken,
      metrics: {
        total_impressions: 0,
        total_clicks: 0,
        spent_usd: 0,
        avg_dwell_ms: 0,
        platform_impressions: {
          chatgpt: 0,
          claude: 0,
          gemini: 0,
          perplexity: 0,
          deepseek: 0,
        },
      },
    };

    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  public getCampaign(id: string): CampaignStoreItem | undefined {
    return this.campaigns.get(id);
  }

  public getCampaignsByEmail(email: string): CampaignStoreItem[] {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.campaigns.values()).filter(
      (c) => c.advertiser_email.toLowerCase() === normalized
    );
  }

  public getAllCampaigns(): CampaignStoreItem[] {
    return Array.from(this.campaigns.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getAll(): CampaignStoreItem[] {
    return this.getAllCampaigns();
  }

  public updateCampaign(
    id: string,
    updates: Partial<Pick<CampaignStoreItem, 'headline' | 'target_url' | 'badge' | 'status' | 'sponsor_name' | 'icon_url'>>
  ): CampaignStoreItem | undefined {
    const cmp = this.campaigns.get(id);
    if (!cmp) return undefined;

    if (updates.headline !== undefined) cmp.headline = updates.headline;
    if (updates.target_url !== undefined) cmp.target_url = updates.target_url;
    if (updates.sponsor_name !== undefined) cmp.sponsor_name = updates.sponsor_name;
    if (updates.icon_url !== undefined) cmp.icon_url = updates.icon_url;
    if (updates.badge !== undefined) cmp.badge = updates.badge;
    if (updates.status !== undefined) cmp.status = updates.status;

    return cmp;
  }

  public addBudget(id: string, additionalUsd: number): CampaignStoreItem | undefined {
    const cmp = this.campaigns.get(id);
    if (!cmp) return undefined;

    cmp.budget_total_usd = Number((cmp.budget_total_usd + additionalUsd).toFixed(4));
    cmp.budget_remaining_usd = Number((cmp.budget_remaining_usd + additionalUsd).toFixed(4));
    if (cmp.status === 'exhausted' && cmp.budget_remaining_usd > 0) {
      cmp.status = 'active';
    }
    return cmp;
  }

  public recordImpression(params: {
    adToken?: string;
    adId?: string;
    dwellMs: number;
    platform: SupportedPlatform;
  }): { deductedUsd: number; remainingUsd: number; campaignId: string } | null {
    // Find campaign by token or id
    let targetCmp: CampaignStoreItem | undefined;
    for (const cmp of this.campaigns.values()) {
      if (
        (params.adToken && cmp.ad_token === params.adToken) ||
        (params.adId && cmp.id === params.adId)
      ) {
        targetCmp = cmp;
        break;
      }
    }

    if (!targetCmp) return null;

    const costPerImpression = Number((targetCmp.cpm_rate_usd / 1000).toFixed(6));
    const newRemaining = Math.max(0, targetCmp.budget_remaining_usd - costPerImpression);
    targetCmp.budget_remaining_usd = Number(newRemaining.toFixed(4));

    if (!targetCmp.metrics) {
      targetCmp.metrics = {
        total_impressions: 0,
        total_clicks: 0,
        spent_usd: 0,
        avg_dwell_ms: 0,
        platform_impressions: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, deepseek: 0 },
      };
    }

    const prevCount = targetCmp.metrics.total_impressions;
    const newCount = prevCount + 1;
    targetCmp.metrics.total_impressions = newCount;
    targetCmp.metrics.spent_usd = Number((targetCmp.metrics.spent_usd + costPerImpression).toFixed(4));
    targetCmp.metrics.avg_dwell_ms = Math.round(
      (targetCmp.metrics.avg_dwell_ms * prevCount + params.dwellMs) / newCount
    );

    if (targetCmp.metrics.platform_impressions[params.platform] !== undefined) {
      targetCmp.metrics.platform_impressions[params.platform] += 1;
    } else {
      targetCmp.metrics.platform_impressions[params.platform] = 1;
    }

    if (targetCmp.budget_remaining_usd <= 0) {
      targetCmp.status = 'exhausted';
    }

    return {
      deductedUsd: costPerImpression,
      remainingUsd: targetCmp.budget_remaining_usd,
      campaignId: targetCmp.id,
    };
  }

  public getActiveCreatives(): AdCreative[] {
    const active = Array.from(this.campaigns.values()).filter(
      (c) => c.status === 'active' && c.budget_remaining_usd > 0
    );

    if (active.length === 0) {
      // Fallback house ad
      return [
        {
          id: 'ad_house_pathixo',
          headline: 'Get paid while AI thinks — Join Pathixo Rewards today.',
          sponsor_name: 'Pathixo',
          url: 'https://pathixorewards.com',
          icon_url: '/house-ads/pathixo-icon.png',
          badge: 'House Ad',
          is_house_ad: true,
          target_cpm: 15.0,
          ad_token: 'tok_house_fallback_2026',
        },
      ];
    }

    return active.map((c) => ({
      id: c.id,
      headline: c.headline,
      sponsor_name: c.sponsor_name,
      url: c.target_url,
      icon_url: c.icon_url,
      badge: c.badge || 'Sponsored',
      is_house_ad: false,
      target_cpm: c.cpm_rate_usd,
      ad_token: c.ad_token,
    }));
  }
}

// Global singleton instance
export const campaignStore = new CampaignStore();
