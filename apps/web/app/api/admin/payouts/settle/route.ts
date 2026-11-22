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
    const { payout_id, transaction_reference } = body;

    if (!payout_id || !transaction_reference) {
      return NextResponse.json(
        { status: 'error', message: 'Missing payout_id or transaction_reference' },
        { status: 400 }
      );
    }

    const ok = adminStore.settlePayout(payout_id, transaction_reference, auth.email);
    if (!ok) {
      return NextResponse.json(
        { status: 'error', message: 'Payout not found or not in pending status' },
        { status: 400 }
      );
    }

    const updatedPayout = adminStore.getAllPayouts().find((p) => p.id === payout_id);

    return NextResponse.json({
      status: 'ok',
      message: `Payout ${payout_id} marked as settled with ref: ${transaction_reference}`,
      payout: updatedPayout,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
