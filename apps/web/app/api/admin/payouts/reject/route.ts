import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/admin-auth';
import { adminStore } from '../../../../../lib/admin-store';

export async function POST(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized || !auth.email) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { payout_id, reason } = body;

    if (!payout_id || !reason) {
      return NextResponse.json(
        { status: 'error', message: 'Missing payout_id or rejection reason' },
        { status: 400 }
      );
    }

    const ok = adminStore.rejectPayout(payout_id, reason, auth.email);
    if (!ok) {
      return NextResponse.json(
        { status: 'error', message: 'Payout not found or not in pending status' },
        { status: 400 }
      );
    }

    const updatedPayout = adminStore.getAllPayouts().find((p) => p.id === payout_id);

    return NextResponse.json({
      status: 'ok',
      message: `Payout ${payout_id} rejected. Balance refunded back to user.`,
      payout: updatedPayout,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
