import { NextResponse } from 'next/server';
import type { CashoutRequest } from '@pathixo/shared';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';
import { userStore } from '@/lib/user-store';
import { adminStore } from '@/lib/admin-store';
import { accountStoreKey, getSessionFromRequest } from '@/lib/auth-session';

const cashoutRequests: CashoutRequest[] = [];

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { status: 'error', message: 'Payout processing is not configured. Your balance was not changed.' },
      { status: 503 }
    );
  }
  const session = getSessionFromRequest(request);
  if (process.env.NODE_ENV !== 'test' && !session) {
    return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  }
  try {
    const rateLimit = checkRateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'cashout' });
    if (!rateLimit.success) {
      return createRateLimitExceededResponse(rateLimit);
    }

    const body = await request.json();
    const { device_id, amount_usd, payout_method, payout_destination } = body;

    if (!payout_method || !payout_destination) {
      return NextResponse.json(
        { status: 'error', message: 'Payout method and destination are required' },
        { status: 400 }
      );
    }
    if (!['upi', 'paypal', 'gift_card'].includes(payout_method) || typeof payout_destination !== 'string' || payout_destination.trim().length > 255) {
      return NextResponse.json({ status: 'error', message: 'Invalid payout method or destination.' }, { status: 400 });
    }

    const amount = Number(amount_usd);
    if (isNaN(amount) || amount < 2.0) {
      return NextResponse.json(
        { status: 'error', message: 'Minimum cashout threshold is $2.00 USD' },
        { status: 400 }
      );
    }

    const resolvedDeviceId = process.env.NODE_ENV === 'test'
      ? device_id || 'dev_guest'
      : accountStoreKey(session!.email);
    const cashoutRes = userStore.cashout(resolvedDeviceId, amount, payout_method, payout_destination);
    if (!cashoutRes.success) {
      return NextResponse.json({ status: 'error', message: cashoutRes.message }, { status: 400 });
    }

    const newCashout: CashoutRequest = {
      id: `payout_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      device_id: resolvedDeviceId,
      user_email: session?.email,
      amount_usd: cashoutRes.amount,
      payout_method,
      payout_destination,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    cashoutRequests.push(newCashout);
    adminStore.registerPayout({
      ...newCashout,
      user_email: session?.email,
    });

    return NextResponse.json({
      status: 'success',
      message: cashoutRes.message,
      payout: newCashout,
      earnings: cashoutRes.earnings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
