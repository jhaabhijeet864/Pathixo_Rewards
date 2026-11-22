import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../lib/admin-auth';
import { adminStore } from '../../../../lib/admin-store';

export async function GET(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  const payouts = adminStore.getAllPayouts();
  return NextResponse.json({
    status: 'ok',
    total: payouts.length,
    payouts,
  });
}
