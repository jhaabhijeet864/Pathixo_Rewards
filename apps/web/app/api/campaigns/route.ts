import { NextResponse } from 'next/server';
import { campaignStore } from '../../../lib/campaign-store';
import { DEFAULT_USD_INR_RATE } from '@pathixo/shared';
import { getSessionFromRequest } from '@/lib/auth-session';

const productionNotConfigured = () => NextResponse.json(
  { status: 'error', message: 'Campaign storage and advertiser checkout are not configured. No campaign was changed.' },
  { status: 503 }
);

function validHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return productionNotConfigured();
  const session = getSessionFromRequest(request);
  if (process.env.NODE_ENV !== 'test' && !session) {
    return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      headline,
      sponsor_name,
      target_url,
      icon_url,
      badge,
      currency,
      cpm_rate_usd,
      budget_usd,
      budget_inr,
      target_platforms,
    } = body;

    if (!headline || !target_url || !sponsor_name || !validHttpsUrl(target_url)) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required campaign parameters' },
        { status: 400 }
      );
    }
    const cleanHeadline = typeof headline === 'string' ? headline.trim() : '';
    const cleanSponsor = typeof sponsor_name === 'string' ? sponsor_name.trim() : '';
    if (cleanHeadline.length < 3 || cleanHeadline.length > 70 || cleanSponsor.length < 2 || cleanSponsor.length > 80) {
      return NextResponse.json({ status: 'error', message: 'Campaign name or headline is outside the allowed length.' }, { status: 400 });
    }

    // Determine normalized USD budget
    let normalizedBudgetUsd = 2.0;
    if (budget_usd !== undefined && budget_usd !== null) {
      normalizedBudgetUsd = Number(budget_usd);
    } else if (budget_inr !== undefined && budget_inr !== null) {
      normalizedBudgetUsd = Number((Number(budget_inr) / DEFAULT_USD_INR_RATE).toFixed(4));
    }
    if (!Number.isFinite(normalizedBudgetUsd) || normalizedBudgetUsd < 2 || normalizedBudgetUsd > 100_000) {
      return NextResponse.json({ status: 'error', message: 'Campaign budget must be between $2 and $100,000.' }, { status: 400 });
    }

    const campaign = campaignStore.createCampaign({
      advertiser_email: process.env.NODE_ENV === 'test' ? body.advertiser_email : session?.email,
      headline: cleanHeadline,
      sponsor_name: cleanSponsor,
      target_url,
      icon_url,
      badge,
      currency: currency || (budget_inr ? 'INR' : 'USD'),
      cpm_rate_usd: Number(cpm_rate_usd) || 2.50,
      budget_usd: normalizedBudgetUsd,
      target_platforms,
      status: 'pending_review',
    });

    return NextResponse.json({
      status: 'success',
      message: 'Campaign submitted for review. No payment was processed.',
      campaign,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  let id: string | null = null;
  let email: string | null = null;

  if (request && request.url) {
    try {
      const { searchParams } = new URL(request.url);
      id = searchParams.get('id');
      email = searchParams.get('email');
    } catch {
      // ignore parsing failure
    }
  }

  if (id) {
    const campaign = campaignStore.getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { status: 'error', message: `Campaign not found with ID: ${id}` },
        { status: 404 }
      );
    }
    if (process.env.NODE_ENV !== 'test' && (!session || campaign.advertiser_email.toLowerCase() !== session.email)) {
      return NextResponse.json({ status: 'error', message: 'Campaign not found.' }, { status: 404 });
    }
    return NextResponse.json({ status: 'ok', campaign });
  }

  if (email) {
    if (process.env.NODE_ENV !== 'test' && (!session || session.email !== email.trim().toLowerCase())) {
      return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
    }
    const campaigns = campaignStore.getCampaignsByEmail(process.env.NODE_ENV === 'test' ? email : session?.email || '');
    return NextResponse.json({
      status: 'ok',
      total_campaigns: campaigns.length,
      campaigns,
    });
  }

  const all = campaignStore.getAllCampaigns()
    .filter((campaign) => campaign.status === 'active')
    .map(({ advertiser_email: _email, ad_token: _token, ...campaign }) => campaign);
  return NextResponse.json({
    status: 'ok',
    total_campaigns: all.length,
    campaigns: all,
  });
}

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV === 'production') return productionNotConfigured();
  const session = getSessionFromRequest(request);
  if (process.env.NODE_ENV !== 'test' && !session) {
    return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, headline, sponsor_name, target_url, icon_url, badge } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Missing campaign id' },
        { status: 400 }
      );
    }

    let campaign = campaignStore.getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { status: 'error', message: `Campaign not found: ${id}` },
        { status: 404 }
      );
    }
    if (process.env.NODE_ENV !== 'test' && campaign.advertiser_email.toLowerCase() !== session?.email) {
      return NextResponse.json({ status: 'error', message: 'Campaign not found.' }, { status: 404 });
    }
    if (target_url !== undefined && !validHttpsUrl(target_url)) {
      return NextResponse.json({ status: 'error', message: 'A valid HTTPS destination is required.' }, { status: 400 });
    }

    const updated = campaignStore.updateCampaign(id, {
      headline,
      sponsor_name,
      target_url,
      icon_url,
      badge,
    });

    return NextResponse.json({
      status: 'success',
      message: 'Campaign updated successfully',
      campaign: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
