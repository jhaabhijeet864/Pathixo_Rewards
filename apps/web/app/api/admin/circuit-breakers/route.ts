import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../lib/admin-auth';
import { adminStore } from '../../../../lib/admin-store';
import type { CircuitBreakerKey } from '@pathixo/shared';

export async function GET(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    circuit_breakers: adminStore.getCircuitBreakers(),
  });
}

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
    const { breaker_key, is_tripped, reason } = body;

    if (!breaker_key || typeof is_tripped !== 'boolean') {
      return NextResponse.json(
        { status: 'error', message: 'Missing breaker_key or is_tripped boolean' },
        { status: 400 }
      );
    }

    const ok = adminStore.setCircuitBreaker(
      breaker_key as CircuitBreakerKey,
      is_tripped,
      auth.email,
      reason
    );

    if (!ok) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid breaker key' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: `Circuit breaker ${breaker_key} set to ${is_tripped}`,
      circuit_breakers: adminStore.getCircuitBreakers(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
