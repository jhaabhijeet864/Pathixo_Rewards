import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-session';
import { userStore } from '@/lib/user-store';

export async function DELETE(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ status: 'error', message: 'Rewards storage is not configured.' }, { status: 503 });
  }
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  const cleared = userStore.clearViewedAdsForEmail(session.email);
  return NextResponse.json({ status: 'ok', cleared });
}
