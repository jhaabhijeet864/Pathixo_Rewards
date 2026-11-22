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
    const action = body.action;
    const target_id = body.target_id || body.user_id;
    const reason = body.reason;
    let amount_usd = body.amount_usd;
    if (amount_usd === undefined && (body.adjustment_amount !== undefined || body.amount !== undefined)) {
      const amt = Number(body.adjustment_amount ?? body.amount);
      amount_usd = body.adjustment_type === 'debit' ? -Math.abs(amt) : Math.abs(amt);
    }

    if (!action || !target_id) {
      return NextResponse.json(
        { status: 'error', message: 'Missing action or target_id' },
        { status: 400 }
      );
    }

    if (action === 'ban') {
      const ok = adminStore.banUser(
        target_id,
        reason || 'Banned by admin for policy violation',
        auth.email
      );
      if (!ok) {
        return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 'ok', message: `User ${target_id} terminated and blacklisted` });
    }

    if (action === 'unban') {
      const ok = adminStore.unbanUser(target_id, auth.email);
      if (!ok) {
        return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 'ok', message: `User ${target_id} unbanned` });
    }

    if (action === 'adjust_balance') {
      if (typeof amount_usd !== 'number' || isNaN(amount_usd)) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid or missing amount_usd' },
          { status: 400 }
        );
      }
      const res = adminStore.adjustUserBalance(
        target_id,
        amount_usd,
        reason || 'Manual balance adjustment',
        auth.email
      );
      if (!res.success) {
        return NextResponse.json({ status: 'error', message: res.error }, { status: 400 });
      }
      return NextResponse.json({
        status: 'ok',
        message: `Balance adjusted by $${amount_usd}`,
        new_balance: res.newBalance,
      });
    }

    return NextResponse.json({ status: 'error', message: 'Unsupported action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
