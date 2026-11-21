import { NextResponse } from 'next/server';
import type { CashoutRequest } from '@pathixo/shared';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';

const cashoutRequests: CashoutRequest[] = [];

export async function POST(request: Request) {
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

    const amount = Number(amount_usd);
    if (isNaN(amount) || amount < 2.0) {
      return NextResponse.json(
        { status: 'error', message: 'Minimum cashout threshold is $2.00 USD' },
        { status: 400 }
      );
    }

    const newCashout: CashoutRequest = {
      id: `payout_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      device_id: device_id || 'dev_guest',
      amount_usd: amount,
      payout_method,
      payout_destination,
      status: 'completed', // Instant simulated transfer
      created_at: new Date().toISOString(),
    };

    cashoutRequests.push(newCashout);

    return NextResponse.json({
      status: 'success',
      message: `Cashout of $${amount.toFixed(2)} sent via ${payout_method.toUpperCase()}!`,
      payout: newCashout,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
