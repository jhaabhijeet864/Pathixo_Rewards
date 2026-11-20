import { NextResponse } from 'next/server';
import type { AdCampaign } from '@pathixo/shared';

const activeCampaigns: AdCampaign[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { advertiser_email, headline, sponsor_name, target_url, icon_url, cpm_rate_usd, budget_usd, target_platforms } = body;

    if (!advertiser_email || !headline || !target_url || !sponsor_name) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required campaign parameters' },
        { status: 400 }
      );
    }

    const campaign: AdCampaign = {
      id: `cmp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      advertiser_email,
      headline,
      sponsor_name,
      target_url,
      icon_url,
      cpm_rate_usd: Number(cpm_rate_usd) || 20.0,
      budget_total_usd: Number(budget_usd) || 100.0,
      budget_remaining_usd: Number(budget_usd) || 100.0,
      target_platforms: target_platforms || ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
      status: 'active',
      created_at: new Date().toISOString(),
    };

    activeCampaigns.push(campaign);

    return NextResponse.json({
      status: 'success',
      message: 'Campaign published and funded successfully!',
      campaign,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    total_campaigns: activeCampaigns.length,
    campaigns: activeCampaigns,
  });
}
