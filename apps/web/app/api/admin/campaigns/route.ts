import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../lib/admin-auth';
import { adminStore } from '../../../../lib/admin-store';
import { campaignStore } from '../../../../lib/campaign-store';

export async function GET(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  const campaigns = campaignStore.getAllCampaigns();
  return NextResponse.json({
    status: 'ok',
    total: campaigns.length,
    campaigns,
  });
}

export async function PATCH(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized || !auth.email) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const campaign_id = body.campaign_id;
    const updates = body.updates || { ...body };
    delete updates.campaign_id;

    if (!campaign_id || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Missing campaign_id or updates payload' },
        { status: 400 }
      );
    }

    const updated = adminStore.moderateCampaign(campaign_id, updates, auth.email);
    if (!updated) {
      return NextResponse.json(
        { status: 'error', message: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Campaign updated successfully',
      campaign: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
