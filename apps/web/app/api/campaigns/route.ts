import { NextResponse } from 'next/server';
import { campaignStore } from '../../../lib/campaign-store';
import { DEFAULT_USD_INR_RATE } from '@pathixo/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      advertiser_email,
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
      status,
    } = body;

    if (!advertiser_email || !headline || !target_url || !sponsor_name) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required campaign parameters' },
        { status: 400 }
      );
    }

    // Determine normalized USD budget
    let normalizedBudgetUsd = 2.0;
    if (budget_usd !== undefined && budget_usd !== null) {
      normalizedBudgetUsd = Number(budget_usd);
    } else if (budget_inr !== undefined && budget_inr !== null) {
      normalizedBudgetUsd = Number((Number(budget_inr) / DEFAULT_USD_INR_RATE).toFixed(4));
    }

    const campaign = campaignStore.createCampaign({
      advertiser_email,
      headline,
      sponsor_name,
      target_url,
      icon_url,
      badge,
      currency: currency || (budget_inr ? 'INR' : 'USD'),
      cpm_rate_usd: Number(cpm_rate_usd) || 2.50,
      budget_usd: normalizedBudgetUsd,
      target_platforms,
      status: status || undefined,
    });

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

export async function GET(request: Request) {
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
    return NextResponse.json({ status: 'ok', campaign });
  }

  if (email) {
    const campaigns = campaignStore.getCampaignsByEmail(email);
    return NextResponse.json({
      status: 'ok',
      total_campaigns: campaigns.length,
      campaigns,
    });
  }

  const all = campaignStore.getAllCampaigns();
  return NextResponse.json({
    status: 'ok',
    total_campaigns: all.length,
    campaigns: all,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, headline, sponsor_name, target_url, icon_url, badge, status, add_budget_usd } = body;

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

    if (add_budget_usd && Number(add_budget_usd) > 0) {
      campaign = campaignStore.addBudget(id, Number(add_budget_usd));
    }

    const updated = campaignStore.updateCampaign(id, {
      headline,
      sponsor_name,
      target_url,
      icon_url,
      badge,
      status,
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
